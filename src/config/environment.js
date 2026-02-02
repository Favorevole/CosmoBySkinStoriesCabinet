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

const config = {
  nodeEnv: NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL || process.env.DB_URL
  },

  clientBot: {
    token: process.env.CLIENT_BOT_TOKEN
  },

  doctorBot: {
    token: process.env.DOCTOR_BOT_TOKEN
  },

  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    webhookUrl: process.env.WEBHOOK_URL,
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5173'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => BigInt(id))
};

// Validation
const requiredVars = ['CLIENT_BOT_TOKEN', 'DOCTOR_BOT_TOKEN'];
const missing = requiredVars.filter(v => !process.env[v]);

// Check DB_URL separately (can be DB_URL or DATABASE_URL)
if (!process.env.DB_URL && !process.env.DATABASE_URL) {
  missing.push('DB_URL');
}

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  if (config.isProduction) {
    process.exit(1);
  }
}

export default config;
