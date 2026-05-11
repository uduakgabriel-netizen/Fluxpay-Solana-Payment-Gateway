import { initCronJobs, shutdownCronJobs } from './queues/jobQueue';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initWebhookQueue, shutdownWebhookQueue } from './utils/webhook';
import { AlertService } from './services/alert.service';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap() {
  // Start server FIRST (critical for Render port detection)
  const server = app.listen(PORT, () => {
    logger.info(`
⚡ FluxPay Backend Server (Non-Custodial)
─────────────────────────────────────────
Port:         ${PORT}
Environment:  ${process.env.NODE_ENV || 'development'}
Network:      ${process.env.SOLANA_NETWORK || 'devnet'}
Architecture: Non-Custodial (customer → Jupiter → merchant)
Health:       http://localhost:${PORT}/api/health
Auth API:     http://localhost:${PORT}/api/auth
Payments:     http://localhost:${PORT}/api/payments
Refunds:      http://localhost:${PORT}/api/refunds
Settlements:  http://localhost:${PORT}/api/settlements
API Keys:     http://localhost:${PORT}/api/api-keys
Webhooks:     http://localhost:${PORT}/api/webhooks
Helius:       http://localhost:${PORT}/api/webhooks/helius
Blockchain:   http://localhost:${PORT}/api/blockchain
Tokens:       http://localhost:${PORT}/api/tokens
Merchants:    http://localhost:${PORT}/api/merchants
Checkout:     http://localhost:${PORT}/api/checkout
─────────────────────────────────────────
    `);

    // Run background services AFTER server is live (non-blocking)
    setImmediate(() => {
      initWebhookQueue()
        .then(() => logger.info('Webhook queue initialized'))
        .catch(err => logger.error('Webhook queue error:', err));

      initCronJobs()
        .then(() => logger.info('Cron jobs initialized'))
        .catch(err => logger.error('Cron jobs error:', err));

      AlertService.alertServerStartup().catch(() => {});
    });
  });

  // Handle port errors
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`);
    } else {
      logger.error(`[Server] Startup error: ${err.message}`);
    }
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);

    await AlertService.alertServerShutdown(signal).catch(() => {});
    await shutdownCronJobs();
    await shutdownWebhookQueue();

    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('[Server] Fatal startup error:', error);
  process.exit(1);
});