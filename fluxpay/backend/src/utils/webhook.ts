/**
 * Webhook Delivery Utility
 *
 * Handles delivering webhooks to merchant endpoints, including:
 * - HMAC-SHA256 signature generation (X-FluxPay-Signature)
 * - Exponential backoff retry logic
 * - Delivery logging
 */

import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';

const prisma = new PrismaClient();

const WEBHOOK_TIMEOUT_MS = parseInt(process.env.WEBHOOK_TIMEOUT_MS || '10000', 10);
const MAX_RESPONSE_BODY_LENGTH = 500; // Truncate stored response bodies

// ─── Signature Generation ───────────────────────────────────

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Generate a random webhook secret
 */
export function generateWebhookSecret(): string {
  const { randomBytes } = require('crypto');
  return `whsec_${randomBytes(24).toString('hex')}`;
}

// ─── Webhook Delivery ───────────────────────────────────────

interface DeliverWebhookInput {
  merchantId: string;
  event: string;
  data: Record<string, any>;
}

/**
 * Deliver a webhook event to all matching merchant configs.
 * Creates log entries and schedules retries for failures.
 * This is fire-and-forget — errors are logged, not thrown.
 */
export async function deliverWebhook(input: DeliverWebhookInput): Promise<void> {
  const { merchantId, event, data } = input;

  try {
    // Find active webhook configs for this merchant that subscribe to this event
    const configs = await prisma.webhookConfig.findMany({
      where: {
        merchantId,
        active: true,
      },
    });

    for (const config of configs) {
      const subscribedEvents = config.events as string[];
      if (!subscribedEvents.includes(event)) continue;

      // Build payload
      const payload = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        event,
        data,
        timestamp: new Date().toISOString(),
        merchantId,
      };

      const payloadStr = JSON.stringify(payload);

      // Generate signature
      const signature = generateWebhookSignature(payloadStr, config.secret);

      // Create log entry
      const log = await prisma.webhookLog.create({
        data: {
          merchantId,
          event,
          url: config.url,
          payload,
          status: 'PENDING',
          attempt: 1,
          maxAttempts: config.maxRetries,
        },
      });

      // Attempt delivery (async, don't block)
      attemptDelivery(log.id, config.url, payloadStr, signature, 1, config.maxRetries, config.retryBackoff)
        .catch((err) => console.error(`[Webhook] Delivery error for log ${log.id}:`, err));
    }
  } catch (error) {
    console.error(`[Webhook] Error delivering ${event} for merchant ${merchantId}:`, error);
  }
}

/**
 * Attempt to deliver a webhook, with retry on failure
 */
async function attemptDelivery(
  logId: string,
  url: string,
  payloadStr: string,
  signature: string,
  attempt: number,
  maxAttempts: number,
  retryBackoffMs: number
): Promise<void> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FluxPay-Signature': signature,
        'X-FluxPay-Event': (await prisma.webhookLog.findUnique({ where: { id: logId } }))?.event || '',
        'User-Agent': 'FluxPay-Webhook/1.0',
      },
      body: payloadStr,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const duration = Date.now() - startTime;
    let responseBody = '';

    try {
      responseBody = await response.text();
      if (responseBody.length > MAX_RESPONSE_BODY_LENGTH) {
        responseBody = responseBody.slice(0, MAX_RESPONSE_BODY_LENGTH) + '... (truncated)';
      }
    } catch {
      responseBody = '(unable to read response body)';
    }

    if (response.ok) {
      // Success
      await prisma.webhookLog.update({
        where: { id: logId },
        data: {
          status: 'SUCCESS',
          statusCode: response.status,
          responseBody,
          duration,
          attempt,
        },
      });
    } else {
      // Non-2xx response — retry
      await handleRetry(logId, url, payloadStr, signature, attempt, maxAttempts, retryBackoffMs, {
        statusCode: response.status,
        responseBody,
        duration,
        error: `HTTP ${response.status}: ${response.statusText}`,
      });
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.name === 'AbortError'
      ? `Timeout after ${WEBHOOK_TIMEOUT_MS}ms`
      : error.message || 'Unknown error';

    await handleRetry(logId, url, payloadStr, signature, attempt, maxAttempts, retryBackoffMs, {
      statusCode: null,
      responseBody: null,
      duration,
      error: errorMessage,
    });
  }
}

/**
 * Handle retry logic with exponential backoff
 */
async function handleRetry(
  logId: string,
  url: string,
  payloadStr: string,
  signature: string,
  attempt: number,
  maxAttempts: number,
  retryBackoffMs: number,
  result: {
    statusCode: number | null;
    responseBody: string | null;
    duration: number;
    error: string;
  }
): Promise<void> {
  if (attempt >= maxAttempts) {
    // Final failure
    await prisma.webhookLog.update({
      where: { id: logId },
      data: {
        status: 'FAILED',
        statusCode: result.statusCode,
        responseBody: result.responseBody,
        duration: result.duration,
        attempt,
        error: result.error,
      },
    });
    console.log(`[Webhook] Delivery failed after ${attempt} attempts for log ${logId}`);
    return;
  }

  // Calculate exponential backoff: base * 2^(attempt-1)
  const backoffMs = retryBackoffMs * Math.pow(2, attempt - 1);
  const nextRetryAt = new Date(Date.now() + backoffMs);

  // Update log as RETRYING
  await prisma.webhookLog.update({
    where: { id: logId },
    data: {
      status: 'RETRYING',
      statusCode: result.statusCode,
      responseBody: result.responseBody,
      duration: result.duration,
      attempt,
      error: result.error,
      nextRetryAt,
    },
  });

  console.log(
    `[Webhook] Retry ${attempt + 1}/${maxAttempts} for log ${logId} in ${backoffMs}ms`
  );

  // Schedule retry
  setTimeout(() => {
    attemptDelivery(logId, url, payloadStr, signature, attempt + 1, maxAttempts, retryBackoffMs)
      .catch((err) => console.error(`[Webhook] Retry error for log ${logId}:`, err));
  }, backoffMs);
}

// ─── Test Webhook Delivery ──────────────────────────────────

/**
 * Send a test webhook to verify the merchant's endpoint
 */
export async function sendTestWebhook(
  merchantId: string,
  url: string,
  secret: string
): Promise<{
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  duration: number;
  error?: string;
}> {
  const payload = {
    id: `evt_test_${Date.now()}`,
    event: 'test.webhook',
    data: {
      message: 'This is a test webhook from FluxPay',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    merchantId,
  };

  const payloadStr = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadStr, secret);

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FluxPay-Signature': signature,
        'X-FluxPay-Event': 'test.webhook',
        'User-Agent': 'FluxPay-Webhook/1.0',
      },
      body: payloadStr,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const duration = Date.now() - startTime;
    let responseBody = '';
    try {
      responseBody = await response.text();
      if (responseBody.length > MAX_RESPONSE_BODY_LENGTH) {
        responseBody = responseBody.slice(0, MAX_RESPONSE_BODY_LENGTH) + '... (truncated)';
      }
    } catch {
      responseBody = '';
    }

    // Log the test delivery
    await prisma.webhookLog.create({
      data: {
        merchantId,
        event: 'test.webhook',
        url,
        payload,
        status: response.ok ? 'SUCCESS' : 'FAILED',
        statusCode: response.status,
        responseBody,
        duration,
        attempt: 1,
        maxAttempts: 1,
        error: response.ok ? null : `HTTP ${response.status}`,
      },
    });

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody,
      duration,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.name === 'AbortError'
      ? `Timeout after ${WEBHOOK_TIMEOUT_MS}ms`
      : error.message || 'Unknown error';

    // Log failed test
    await prisma.webhookLog.create({
      data: {
        merchantId,
        event: 'test.webhook',
        url,
        payload,
        status: 'FAILED',
        duration,
        attempt: 1,
        maxAttempts: 1,
        error: errorMessage,
      },
    });

    return {
      success: false,
      duration,
      error: errorMessage,
    };
  }
}
