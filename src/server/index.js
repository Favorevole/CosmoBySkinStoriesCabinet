import express from 'express';
import cors from 'cors';
import config from '../config/environment.js';

// Routes
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import doctorsRoutes from './routes/doctors.js';
import statsRoutes from './routes/stats.js';
import webRoutes from './routes/web.js';

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
  if (req.path === '/client-webhook' || req.path === '/doctor-webhook') {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/web', webRoutes);

// Client bot webhook
app.post('/client-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!clientBot) {
      console.error('[WEBHOOK] Client bot not initialized');
      return res.status(500).send('Bot not initialized');
    }

    try {
      const update = JSON.parse(req.body.toString());
      await clientBot.handleUpdate(update);
      res.status(200).send('ok');
    } catch (error) {
      console.error('[WEBHOOK] Client bot error:', error);
      res.status(200).send('ok'); // Always respond 200 to Telegram
    }
  }
);

// Doctor bot webhook
app.post('/doctor-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!doctorBot) {
      console.error('[WEBHOOK] Doctor bot not initialized');
      return res.status(500).send('Bot not initialized');
    }

    try {
      const update = JSON.parse(req.body.toString());
      await doctorBot.handleUpdate(update);
      res.status(200).send('ok');
    } catch (error) {
      console.error('[WEBHOOK] Doctor bot error:', error);
      res.status(200).send('ok');
    }
  }
);

// Serve frontend in production
if (config.isProduction) {
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    // Don't serve frontend for API routes
    if (req.path.startsWith('/api/') || req.path.includes('-webhook')) {
      return res.status(404).json({ error: 'Not found' });
    }
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
  server = app.listen(config.server.port, () => {
    console.log(`[SERVER] Running on port ${config.server.port}`);
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
