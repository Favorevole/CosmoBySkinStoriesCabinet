import config from './config/environment.js';
import { initializeDatabase, disconnectDatabase } from './db/index.js';
import { startServer, stopServer, setBotsForWebhook } from './server/index.js';
import { createClientBot, startClientBot, stopClientBot, getClientBot } from './clientBot/index.js';
import { createDoctorBot, startDoctorBot, stopDoctorBot, getDoctorBot } from './doctorBot/index.js';
import { setClientBot, setDoctorBot } from './services/notifications.js';
import { cleanupExpiredCodes } from './db/auth.js';

console.log(`
╔═══════════════════════════════════════════╗
║     CosmoSkin Care - Consultation MVP     ║
║     Environment: ${config.nodeEnv.padEnd(22)}║
╚═══════════════════════════════════════════╝
`);

async function main() {
  try {
    // 1. Initialize database
    console.log('[STARTUP] Initializing database...');
    await initializeDatabase();

    // 2. Create bots
    console.log('[STARTUP] Creating bots...');
    const clientBot = createClientBot();
    const doctorBot = createDoctorBot();

    // Set bot references for notifications
    setClientBot(clientBot);
    setDoctorBot(doctorBot);

    // 3. Start server
    console.log('[STARTUP] Starting server...');
    const { server } = startServer();

    // 4. Set bots for webhook handling
    setBotsForWebhook(clientBot, doctorBot);

    // 5. Start bots
    console.log('[STARTUP] Starting bots...');
    await startClientBot();
    await startDoctorBot();

    // 6. Start auth code cleanup interval
    setInterval(async () => {
      try {
        await cleanupExpiredCodes();
      } catch (error) {
        console.error('[CLEANUP] Error:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    console.log(`
╔═══════════════════════════════════════════╗
║         All systems operational!          ║
║                                           ║
║  Server:      http://localhost:${String(config.server.port).padEnd(10)}║
║  Client Bot:  Running                     ║
║  Doctor Bot:  Running                     ║
╚═══════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('[STARTUP] Fatal error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n[SHUTDOWN] Received ${signal}, shutting down gracefully...`);

  try {
    await stopClientBot();
    await stopDoctorBot();
    stopServer();
    await disconnectDatabase();

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
