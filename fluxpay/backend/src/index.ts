import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startExpirePaymentsJob } from './jobs/expire-payments';
import { startDailySettlementJob } from './jobs/daily-settlement';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
  console.log(`
  ⚡ FluxPay Backend Server
  ─────────────────────────
  Port:        ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Network:     ${process.env.SOLANA_NETWORK || 'devnet'}
  Health:      http://localhost:${PORT}/api/health
  Auth API:    http://localhost:${PORT}/api/auth
  Payments:    http://localhost:${PORT}/api/payments
  Refunds:     http://localhost:${PORT}/api/refunds
  Settlements: http://localhost:${PORT}/api/settlements
  API Keys:    http://localhost:${PORT}/api/api-keys
  Webhooks:    http://localhost:${PORT}/api/webhooks
  Helius:      http://localhost:${PORT}/api/webhooks/helius
  Blockchain:  http://localhost:${PORT}/api/blockchain
  ─────────────────────────
  `);

  // Start background jobs
  startExpirePaymentsJob();
  startDailySettlementJob();
});
