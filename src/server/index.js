import express from 'express';
import cors from 'cors';
import config from '../config/environment.js';

// Routes
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import doctorsRoutes from './routes/doctors.js';
import statsRoutes from './routes/stats.js';
import webRoutes from './routes/web.js';
import settingsRoutes from './routes/settings.js';
import reviewsRoutes from './routes/reviews.js';

const app = express();

// Store bot references for webhooks
let clientBot = null;
let doctorBot = null;

export function setBotsForWebhook(client, doctor) {
  clientBot = client;
  doctorBot = doctor;
}

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// JSON parsing (except for webhooks)
app.use((req, res, next) => {
  if (req.path === '/client-webhook' || req.path === '/doctor-webhook' || req.path === '/api/payments/yookassa/webhook') {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Тестовые endpoints для проверки webhook путей
app.get('/client-webhook', (req, res) => {
  res.json({
    message: 'Client webhook endpoint доступен',
    method: 'GET',
    note: 'Telegram использует POST метод'
  });
});

app.get('/doctor-webhook', (req, res) => {
  res.json({
    message: 'Doctor webhook endpoint доступен',
    method: 'GET',
    note: 'Telegram использует POST метод'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/web', webRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewsRoutes);

// YooKassa payment webhook
app.post('/api/payments/yookassa/webhook',
  express.json({ limit: '1mb' }),
  async (req, res) => {
    console.log('[WEBHOOK] YooKassa payment notification received');
    // Respond 200 immediately — YooKassa requires fast response
    res.sendStatus(200);

    try {
      const { handleYooKassaWebhook } = await import('../services/payment.js');
      await handleYooKassaWebhook(req.body);
    } catch (error) {
      console.error('[WEBHOOK] YooKassa processing error:', error.message);
    }
  }
);

// Client bot webhook
app.post('/client-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('[WEBHOOK] ✅ Client bot request received');

    if (!clientBot) {
      console.error('[WEBHOOK] ❌ Client bot not initialized');
      return res.status(503).json({ error: 'Bot not initialized' });
    }

    if (!req.body || req.body.length === 0) {
      console.error('[WEBHOOK] ❌ Empty request body');
      return res.status(400).json({ error: 'Empty body' });
    }

    try {
      const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
      const update = JSON.parse(bodyStr);
      console.log('[WEBHOOK] Client update:', update?.message?.text || update?.callback_query?.data || 'other');

      // Сразу отвечаем Telegram 200 OK, чтобы не было повторных отправок
      res.sendStatus(200);

      // Обрабатываем update асинхронно
      clientBot.handleUpdate(update).catch(error => {
        console.error('[WEBHOOK] ❌ Client bot processing error:', error.message);
      });
    } catch (error) {
      console.error('[WEBHOOK] ❌ Client bot parse error:', error.message);
      res.sendStatus(500);
    }
  }
);

// Doctor bot webhook
app.post('/doctor-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('[WEBHOOK] ✅ Doctor bot request received');

    if (!doctorBot) {
      console.error('[WEBHOOK] ❌ Doctor bot not initialized');
      return res.status(503).json({ error: 'Bot not initialized' });
    }

    if (!req.body || req.body.length === 0) {
      console.error('[WEBHOOK] ❌ Empty request body');
      return res.status(400).json({ error: 'Empty body' });
    }

    try {
      const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
      const update = JSON.parse(bodyStr);
      console.log('[WEBHOOK] Doctor update:', update?.message?.text || update?.callback_query?.data || 'other');

      // Сразу отвечаем Telegram 200 OK
      res.sendStatus(200);

      // Обрабатываем update асинхронно
      doctorBot.handleUpdate(update).catch(error => {
        console.error('[WEBHOOK] ❌ Doctor bot processing error:', error.message);
      });
    } catch (error) {
      console.error('[WEBHOOK] ❌ Doctor bot parse error:', error.message);
      res.sendStatus(500);
    }
  }
);

// Serve frontend in production
if (config.isProduction) {
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Serve static files with long cache for hashed assets
  app.use(express.static(path.join(__dirname, '../../frontend/dist'), {
    maxAge: '1y', // Cache assets for 1 year (they have hashes)
    setHeaders: (res, filePath) => {
      // Don't cache HTML files
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  app.get('*', (req, res) => {
    // Don't serve frontend for API routes
    if (req.path.startsWith('/api/') || req.path.includes('-webhook')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Send index.html with no-cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[SERVER] Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files (max 6)' });
    }
  }

  res.status(500).json({ error: 'Internal server error' });
});

let server = null;

export function startServer() {
  server = app.listen(config.server.port, '0.0.0.0', () => {
    console.log(`[SERVER] Running on http://0.0.0.0:${config.server.port}`);
  });

  return { app, server };
}

export function stopServer() {
  if (server) {
    server.close(() => {
      console.log('[SERVER] Stopped');
    });
  }
}

export { app };
