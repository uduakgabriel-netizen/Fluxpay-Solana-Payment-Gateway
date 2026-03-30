import { PrismaClient, WebhookLogStatus, Prisma } from '@prisma/client';
import { AppError } from './auth.service';
import { generateWebhookSecret, sendTestWebhook } from '../utils/webhook';

const prisma = new PrismaClient();

// ─── Get Webhook Config ─────────────────────────────────────

export async function getWebhookConfig(merchantId: string) {
  const config = await prisma.webhookConfig.findFirst({
    where: { merchantId },
  });

  if (!config) {
    return {
      configured: false,
      url: null,
      events: [],
      active: false,
      maxRetries: 5,
      secret: null,
    };
  }

  return {
    configured: true,
    id: config.id,
    url: config.url,
    events: config.events,
    active: config.active,
    maxRetries: config.maxRetries,
    retryBackoff: config.retryBackoff,
    // Show partial secret for display: whsec_abc...xyz
    secretPreview: config.secret.slice(0, 10) + '...' + config.secret.slice(-4),
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  };
}

// ─── Update Webhook Config ──────────────────────────────────

interface UpdateWebhookInput {
  merchantId: string;
  url: string;
  events: string[];
  active: boolean;
  maxRetries: number;
}

export async function updateWebhookConfig(input: UpdateWebhookInput) {
  const { merchantId, url, events, active, maxRetries } = input;

  // Check if config already exists
  const existing = await prisma.webhookConfig.findFirst({
    where: { merchantId },
  });

  if (existing) {
    // Update existing
    const updated = await prisma.webhookConfig.update({
      where: { id: existing.id },
      data: {
        url,
        events,
        active,
        maxRetries,
      },
    });

    return {
      id: updated.id,
      url: updated.url,
      events: updated.events,
      active: updated.active,
      maxRetries: updated.maxRetries,
      secretPreview: updated.secret.slice(0, 10) + '...' + updated.secret.slice(-4),
      updatedAt: updated.updatedAt.toISOString(),
      message: 'Webhook configuration updated.',
    };
  }

  // Create new config with generated secret
  const secret = generateWebhookSecret();

  const config = await prisma.webhookConfig.create({
    data: {
      merchantId,
      url,
      secret,
      events,
      active,
      maxRetries,
    },
  });

  return {
    id: config.id,
    url: config.url,
    events: config.events,
    active: config.active,
    maxRetries: config.maxRetries,
    // Return full secret on creation only
    secret: config.secret,
    secretPreview: config.secret.slice(0, 10) + '...' + config.secret.slice(-4),
    createdAt: config.createdAt.toISOString(),
    message: 'Webhook configured. Store the signing secret securely — it will not be shown in full again.',
  };
}

// ─── Test Webhook ───────────────────────────────────────────

export async function testWebhook(merchantId: string) {
  const config = await prisma.webhookConfig.findFirst({
    where: { merchantId },
  });

  if (!config) {
    throw new AppError('No webhook configured. Set up a webhook URL first.', 400);
  }

  if (!config.active) {
    throw new AppError('Webhook is currently disabled. Enable it before testing.', 400);
  }

  const result = await sendTestWebhook(merchantId, config.url, config.secret);

  return {
    url: config.url,
    ...result,
    message: result.success
      ? 'Test webhook delivered successfully!'
      : `Test webhook failed: ${result.error}`,
  };
}

// ─── List Webhook Logs ──────────────────────────────────────

interface ListWebhookLogsInput {
  merchantId: string;
  page: number;
  limit: number;
  event?: string;
  status?: WebhookLogStatus;
  fromDate?: string;
  toDate?: string;
}

export async function listWebhookLogs(input: ListWebhookLogsInput) {
  const { merchantId, page, limit, event, status, fromDate, toDate } = input;

  const where: Prisma.WebhookLogWhereInput = { merchantId };

  if (event) where.event = event;
  if (status) where.status = status;

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) (where.createdAt as any).gte = new Date(fromDate);
    if (toDate) (where.createdAt as any).lte = new Date(toDate);
  }

  const total = await prisma.webhookLog.count({ where });

  const skip = (page - 1) * limit;
  const logs = await prisma.webhookLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      event: true,
      url: true,
      status: true,
      statusCode: true,
      duration: true,
      attempt: true,
      maxAttempts: true,
      error: true,
      createdAt: true,
    },
  });

  // Summary
  const [successCount, failedCount, retryingCount] = await Promise.all([
    prisma.webhookLog.count({ where: { merchantId, status: 'SUCCESS' } }),
    prisma.webhookLog.count({ where: { merchantId, status: 'FAILED' } }),
    prisma.webhookLog.count({ where: { merchantId, status: 'RETRYING' } }),
  ]);

  return {
    data: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      successCount,
      failedCount,
      retryingCount,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
    },
  };
}
