import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment-specific .env file
const envFile = NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

const envPath = path.resolve(__dirname, '../../', envFile);

// Load .env first, then environment-specific file
dotenv.config();
dotenv.config({ path: envPath, override: true });

// Railway автоматически создает RAILWAY_PUBLIC_DOMAIN, используем его для webhook
const WEBHOOK_URL = process.env.WEBHOOK_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null);

const config = {
  nodeEnv: NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',

  database: {
    // DATABASE_URL - стандартная переменная для Railway
    url: process.env.DATABASE_URL
  },

  clientBot: {
    token: process.env.CLIENT_BOT_TOKEN
  },

  doctorBot: {
    token: process.env.DOCTOR_BOT_TOKEN
  },

  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    webhookUrl: WEBHOOK_URL,
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5173'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || 'https://s3.ru-1.storage.selcloud.ru',
    region: process.env.S3_REGION || 'ru-1',
    bucket: process.env.S3_BUCKET || 'cosmobynika-photos',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },

  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => BigInt(id))
};

// Validation
const requiredVars = ['DATABASE_URL', 'CLIENT_BOT_TOKEN', 'DOCTOR_BOT_TOKEN'];
if (config.isProduction) {
  requiredVars.push('S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET');
}
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

// Log configuration
console.log(`\n🚀 Environment: ${NODE_ENV.toUpperCase()}`);
console.log(`📁 Config file: ${envFile}`);
if (config.clientBot.token) {
  console.log(`🤖 Client Bot: ${config.clientBot.token.substring(0, 10)}...`);
}
if (config.doctorBot.token) {
  console.log(`👨‍⚕️ Doctor Bot: ${config.doctorBot.token.substring(0, 10)}...`);
}
if (config.database.url) {
  console.log(`🗄️  Database: ${config.database.url.substring(0, 30)}...`);
}
console.log(`🌐 Server Port: ${config.server.port}`);
if (config.s3.accessKeyId) {
  console.log(`📦 S3: ${config.s3.bucket} @ ${config.s3.endpoint}`);
}
if (WEBHOOK_URL) {
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
} else if (config.isProduction) {
  console.warn(`⚠️  No WEBHOOK_URL or RAILWAY_PUBLIC_DOMAIN set in production!`);
}
console.log('');

export default config;
