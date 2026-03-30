import { processDailySettlement } from '../services/settlement.service';

/**
 * Daily Settlement Cron Job
 *
 * Runs once per day at ~23:59 UTC to batch-process all unsettled
 * COMPLETED payments for every merchant, grouped by token.
 *
 * Schedule: Every 24 hours (86400000 ms)
 */

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Run the daily settlement batch once
 */
export async function runDailySettlement(): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`[Cron] Daily settlement started at ${timestamp}`);

  try {
    const result = await processDailySettlement();

    console.log(
      `[Cron] Daily settlement complete — ` +
        `${result.merchantCount} merchant(s) checked, ` +
        `${result.settlementsCreated} settlement(s) created, ` +
        `$${result.totalAmount.toFixed(2)} total settled`
    );
  } catch (error) {
    console.error('[Cron] Daily settlement error:', error);
  }
}

/**
 * Start the recurring daily settlement job
 */
export function startDailySettlementJob(): void {
  console.log('[Cron] Daily settlement job registered (runs every 24 hours)');

  // Run once on startup (optional — useful in dev for testing)
  if (process.env.RUN_SETTLEMENT_ON_BOOT === 'true') {
    console.log('[Cron] Running settlement immediately on boot...');
    runDailySettlement();
  }

  // Then run every 24 hours
  setInterval(runDailySettlement, INTERVAL_MS);
}
