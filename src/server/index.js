import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';

// Routes
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import doctorsRoutes from './routes/doctors.js';
import statsRoutes from './routes/stats.js';
import webRoutes from './routes/web.js';
import settingsRoutes from './routes/settings.js';
import reviewsRoutes from './routes/reviews.js';
import promoCodesRoutes from './routes/promoCodes.js';
import paymentsRoutes from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

// Trust proxy (Railway runs behind a reverse proxy)
app.set('trust proxy', 1);

// Store bot references for webhooks
let clientBot = null;
let doctorBot = null;

export function setBotsForWebhook(client, doctor) {
  clientBot = client;
  doctorBot = doctor;
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // CSP managed separately for frontend
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS — restrict to allowed origins
// Build allowed origins from config + well-known domains
const allowedOrigins = [
  'https://bot.skinstories.ru',
  'https://skinstories.ru',
  'https://www.skinstories.ru',
  ...(config.server.webhookUrl ? [config.server.webhookUrl] : []),
  ...(config.isDevelopment ? ['http://localhost:5173', 'http://localhost:3000'] : [])
];

console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (webhooks, bots, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow Railway deployment domains
    if (origin.endsWith('.up.railway.app')) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Слишком много попыток. Попробуйте через 15 минут.' }
});

const webFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 applications per hour per IP
  message: { error: 'Слишком много заявок. Попробуйте позже.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' }
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many requests' }
});

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

// Webhook diagnostics (only for debug — check if bots have webhook set)
app.get('/health/webhooks', async (req, res) => {
  try {
    const results = {};
    if (clientBot) {
      const info = await clientBot.telegram.getWebhookInfo();
      results.client = {
        url: info.url,
        pending: info.pending_update_count,
        lastError: info.last_error_message || 'none',
        lastErrorDate: info.last_error_date || null
      };
    } else {
      results.client = { error: 'bot not initialized' };
    }
    if (doctorBot) {
      const info = await doctorBot.telegram.getWebhookInfo();
      results.doctor = {
        url: info.url,
        pending: info.pending_update_count,
        lastError: info.last_error_message || 'none',
        lastErrorDate: info.last_error_date || null
      };
    } else {
      results.doctor = { error: 'bot not initialized' };
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// YooKassa webhook IP whitelist
// https://yookassa.ru/developers/using-api/webhooks#ip
const YOOKASSA_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32'
];

function ipInCIDR(ip, cidr) {
  if (cidr.includes('/')) {
    const [range, bits] = cidr.split('/');
    const rangeParts = range.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);
    const mask = -1 << (32 - parseInt(bits));
    const rangeNum = ((rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]) >>> 0;
    const ipNum = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
    return (ipNum & mask) === (rangeNum & mask);
  }
  return ip === cidr;
}

function isYooKassaIP(requestIp) {
  // In dev mode, skip IP check
  if (config.isDevelopment) return true;
  const ip = requestIp.replace('::ffff:', '');
  return YOOKASSA_IPS.some(cidr => {
    if (cidr.includes(':')) return false; // Skip IPv6 for now
    return ipInCIDR(ip, cidr);
  });
}

// YooKassa payment webhook — MUST be before paymentsRoutes to avoid auth middleware
app.post('/api/payments/yookassa/webhook',
  express.json({ limit: '1mb' }),
  async (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    console.log(`[WEBHOOK] YooKassa notification from IP: ${clientIp}`);

    if (!isYooKassaIP(clientIp)) {
      console.warn(`[WEBHOOK] Rejected YooKassa webhook from untrusted IP: ${clientIp}`);
      return res.sendStatus(403);
    }

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

// API routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/applications', apiLimiter, applicationsRoutes);
app.use('/api/doctors', apiLimiter, doctorsRoutes);
app.use('/api/stats', apiLimiter, statsRoutes);
app.use('/api/web', webFormLimiter, webRoutes);
app.use('/api/settings', apiLimiter, settingsRoutes);
app.use('/api/reviews', apiLimiter, reviewsRoutes);
app.use('/api/promo-codes', apiLimiter, promoCodesRoutes);
app.use('/api/payments', apiLimiter, paymentsRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);

// Client bot webhook
app.post('/client-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // Verify Telegram webhook signature
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];
    if (config.webhookSecrets.client && secretToken !== config.webhookSecrets.client) {
      console.warn('[WEBHOOK] ❌ Client bot: invalid secret token');
      return res.sendStatus(403);
    }

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
    // Verify Telegram webhook signature
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];
    if (config.webhookSecrets.doctor && secretToken !== config.webhookSecrets.doctor) {
      console.warn('[WEBHOOK] ❌ Doctor bot: invalid secret token');
      return res.sendStatus(403);
    }

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
