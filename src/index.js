import config from './config/environment.js';
import { initializeDatabase, disconnectDatabase } from './db/index.js';
import { startServer, stopServer, setBotsForWebhook } from './server/index.js';
import { createClientBot, startClientBot, stopClientBot, getClientBot } from './clientBot/index.js';
import { createDoctorBot, startDoctorBot, stopDoctorBot, getDoctorBot } from './doctorBot/index.js';
import { setClientBot, setDoctorBot } from './services/notifications.js';
import { cleanupExpiredCodes } from './db/auth.js';
import { cleanupAnalytics } from './db/analytics.js';

console.log(`
╔═══════════════════════════════════════════╗
║     CosmoSkin Care - Consultation MVP     ║
║     Environment: ${config.nodeEnv.padEnd(22)}║
╚═══════════════════════════════════════════╝
`);

console.log(`Режим: ${config.isProduction ? 'PRODUCTION (webhook)' : 'DEVELOPMENT (polling)'}\n`);

async function main() {
  try {
    // 1. Initialize database
    console.log('[STARTUP] Initializing database...');
    await initializeDatabase();
    console.log('[STARTUP] ✅ Database connected');

    // 2. Create bots (без запуска)
    console.log('[STARTUP] Creating bots...');
    const clientBot = createClientBot();
    const doctorBot = createDoctorBot();
    console.log('[STARTUP] ✅ Bots created');

    // Set bot references for notifications
    setClientBot(clientBot);
    setDoctorBot(doctorBot);

    // 3. Set bots for webhook handling BEFORE starting server
    // Это критически важно - endpoint должен быть готов принимать запросы
    setBotsForWebhook(clientBot, doctorBot);
    console.log('[STARTUP] ✅ Webhook handlers configured');

    // 4. Start server
    console.log('[STARTUP] Starting server...');
    const { server } = startServer();
    console.log(`[STARTUP] ✅ Server running on port ${config.server.port}`);

    // 5. Start bots (в production только устанавливает webhook, НЕ запускает polling)
    console.log('[STARTUP] Configuring Telegram bots...');
    await startClientBot();
    await startDoctorBot();

    // 6. Start auth code cleanup interval
    setInterval(async () => {
      try {
        await cleanupExpiredCodes();
        console.log('[CLEANUP] Expired auth codes removed');
      } catch (error) {
        console.error('[CLEANUP] Error:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // 7. Analytics cleanup — every 24 hours (TTL 90 days, hard cap 100k rows)
    setInterval(async () => {
      try {
        const result = await cleanupAnalytics();
        console.log(`[ANALYTICS] Cleanup done: ${result.totalAfter} rows remaining`);
      } catch (error) {
        console.error('[ANALYTICS] Cleanup error:', error.message);
      }
    }, 24 * 60 * 60 * 1000);

    // Run cleanup once on startup
    cleanupExpiredCodes().catch(err => {
      console.error('[AUTH] Initial cleanup error:', err.message);
    });
    cleanupAnalytics().catch(err => {
      console.error('[ANALYTICS] Initial cleanup error:', err.message);
    });

    const botMode = config.isProduction && config.server.webhookUrl ? 'Webhook' : 'Polling';
    console.log(`
╔═══════════════════════════════════════════╗
║         All systems operational!          ║
║                                           ║
║  Server:      http://localhost:${String(config.server.port).padEnd(10)}║
║  Client Bot:  ${botMode.padEnd(27)}║
║  Doctor Bot:  ${botMode.padEnd(27)}║
╚═══════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('[STARTUP] Fatal error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n[SHUTDOWN] 🛑 Received ${signal}, shutting down gracefully...`);

  try {
    // Останавливаем ботов
    try {
      await stopClientBot();
      console.log('[SHUTDOWN] ✅ Client bot stopped');
    } catch (error) {
      console.error('[SHUTDOWN] Error stopping client bot:', error.message);
    }

    try {
      await stopDoctorBot();
      console.log('[SHUTDOWN] ✅ Doctor bot stopped');
    } catch (error) {
      console.error('[SHUTDOWN] Error stopping doctor bot:', error.message);
    }

    // Останавливаем сервер
    stopServer();
    console.log('[SHUTDOWN] ✅ Server stopped');

    // Отключаемся от базы данных
    await disconnectDatabase();
    console.log('[SHUTDOWN] ✅ Database disconnected');

    console.log('[SHUTDOWN] Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('[SHUTDOWN] Error during shutdown:', error);
    process.exit(1);
  }
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main();
