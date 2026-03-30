import { PrismaClient, PaymentStatus, Prisma } from '@prisma/client';
import { generateReceivingWallet } from './solana-wallet.service';
import { AppError } from './auth.service';

const prisma = new PrismaClient();
const PAYMENT_EXPIRY_HOURS = 24;
const CHECKOUT_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Interfaces ─────────────────────────────────────────────

interface CreatePaymentInput {
  merchantId: string;
  amount: number;
  token: string;
  customerEmail?: string;
  customerWallet?: string;
  metadata?: Record<string, any>;
}

interface ListPaymentsInput {
  merchantId: string;
  page: number;
  limit: number;
  status?: PaymentStatus;
  token?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ─── Create Payment ─────────────────────────────────────────

export async function createPayment(input: CreatePaymentInput) {
  const { merchantId, amount, token, customerEmail, customerWallet, metadata } = input;

  // Generate unique receiving address with encrypted private key
  const { address, encryptedPrivateKey } = generateReceivingWallet();

  // Set expiry to 24 hours from now
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000);

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      merchantId,
      amount,
      token: token.toUpperCase(),
      customerEmail: customerEmail || null,
      customerWallet: customerWallet || null,
      metadata: metadata || Prisma.JsonNull,
      status: 'PENDING',
      receivingAddress: address,
      privateKey: encryptedPrivateKey, // AES-256-GCM encrypted
      expiresAt,
    },
  });

  // Create initial status event
  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      status: 'PENDING',
    },
  });

  return {
    id: payment.id,
    amount: payment.amount,
    token: payment.token,
    status: payment.status,
    receivingAddress: payment.receivingAddress,
    checkoutUrl: `${CHECKOUT_BASE_URL}/pay/${payment.id}`,
    expiresAt: payment.expiresAt.toISOString(),
    createdAt: payment.createdAt.toISOString(),
  };
}

// ─── List Payments ──────────────────────────────────────────

export async function listPayments(input: ListPaymentsInput) {
  const { merchantId, page, limit, status, token, fromDate, toDate, search } = input;

  // Build where clause
  const where: Prisma.PaymentWhereInput = {
    merchantId,
  };

  if (status) {
    where.status = status;
  }

  if (token) {
    where.token = token.toUpperCase();
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      (where.createdAt as any).gte = new Date(fromDate);
    }
    if (toDate) {
      (where.createdAt as any).lte = new Date(toDate);
    }
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { customerWallet: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { txHash: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.payment.count({ where });

  // Get paginated results
  const skip = (page - 1) * limit;
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      amount: true,
      token: true,
      status: true,
      customerWallet: true,
      customerEmail: true,
      txHash: true,
      createdAt: true,
      completedAt: true,
    },
  });

  // Calculate summary (for the filtered set)
  const summaryAgg = await prisma.payment.aggregate({
    where,
    _sum: { amount: true },
    _count: true,
    _avg: { amount: true },
  });

  return {
    data: payments.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      completedAt: p.completedAt?.toISOString() || null,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalAmount: summaryAgg._sum.amount || 0,
      totalPayments: summaryAgg._count,
      averageAmount: Math.round((summaryAgg._avg.amount || 0) * 100) / 100,
    },
  };
}

// ─── Get Payment Details ────────────────────────────────────

export async function getPaymentById(paymentId: string, merchantId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      merchantId,
    },
    include: {
      statusHistory: {
        orderBy: { timestamp: 'asc' },
      },
      refunds: true,
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Build swap details if applicable
  const swapDetails = payment.swapRequired
    ? {
        required: true,
        fromToken: payment.swappedFrom,
        fromAmount: payment.amount,
        toToken: payment.token,
        toAmount: payment.swappedAmount,
        fee: payment.swapFee ?? (payment.amount - (payment.swappedAmount || 0)),
        swapTxHash: payment.swapTxHash,
      }
    : null;

  // Build timeline from status history
  const timeline = payment.statusHistory.map((event) => ({
    status: event.status,
    timestamp: event.timestamp.toISOString(),
  }));

  return {
    id: payment.id,
    amount: payment.amount,
    token: payment.token,
    status: payment.status,
    customerWallet: payment.customerWallet,
    customerEmail: payment.customerEmail,
    receivingAddress: payment.receivingAddress,
    txHash: payment.txHash,
    metadata: payment.metadata,
    swapDetails,
    timeline,
    refunds: payment.refunds.map((r) => ({
      id: r.id,
      amount: r.amount,
      reason: r.reason,
      status: r.status,
      txHash: r.txHash,
      createdAt: r.createdAt.toISOString(),
    })),
    confirmedAt: payment.confirmedAt?.toISOString() || null,
    createdAt: payment.createdAt.toISOString(),
    completedAt: payment.completedAt?.toISOString() || null,
    expiresAt: payment.expiresAt.toISOString(),
  };
}

// ─── Get Payment Status ─────────────────────────────────────

export async function getPaymentStatus(paymentId: string, merchantId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      merchantId,
    },
    select: {
      id: true,
      status: true,
      amount: true,
      token: true,
      customerWallet: true,
      txHash: true,
      completedAt: true,
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return {
    ...payment,
    completedAt: payment.completedAt?.toISOString() || null,
  };
}

// ─── Export Payments to CSV ─────────────────────────────────

export async function exportPayments(
  merchantId: string,
  filters: {
    fromDate?: string;
    toDate?: string;
    status?: PaymentStatus;
    token?: string;
  }
): Promise<string> {
  const where: Prisma.PaymentWhereInput = { merchantId };

  if (filters.status) where.status = filters.status;
  if (filters.token) where.token = filters.token.toUpperCase();

  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};
    if (filters.fromDate) (where.createdAt as any).gte = new Date(filters.fromDate);
    if (filters.toDate) (where.createdAt as any).lte = new Date(filters.toDate);
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Build CSV
  const headers = [
    'Payment ID',
    'Amount',
    'Token',
    'Status',
    'Customer Wallet',
    'Customer Email',
    'Transaction Hash',
    'Receiving Address',
    'Created At',
    'Completed At',
  ];

  const rows = payments.map((p) =>
    [
      p.id,
      p.amount.toString(),
      p.token,
      p.status,
      p.customerWallet || '',
      p.customerEmail || '',
      p.txHash || '',
      p.receivingAddress,
      p.createdAt.toISOString(),
      p.completedAt?.toISOString() || '',
    ]
      .map((field) => `"${field}"`)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// ─── Expire Pending Payments ────────────────────────────────

export async function expirePendingPayments(): Promise<number> {
  const result = await prisma.payment.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  // Create status events for expired payments
  if (result.count > 0) {
    const expired = await prisma.payment.findMany({
      where: {
        status: 'EXPIRED',
        statusHistory: {
          none: { status: 'EXPIRED' },
        },
      },
      select: { id: true },
    });

    if (expired.length > 0) {
      await prisma.paymentEvent.createMany({
        data: expired.map((p) => ({
          paymentId: p.id,
          status: 'EXPIRED' as PaymentStatus,
        })),
      });
    }
  }

  return result.count;
}

// ─── Dashboard Stats ────────────────────────────────────────

export async function getPaymentStats(merchantId: string) {
  // Total revenue (completed payments)
  const revenueAgg = await prisma.payment.aggregate({
    where: { merchantId, status: 'COMPLETED' },
    _sum: { amount: true },
    _count: true,
  });

  // Total transactions
  const totalTxCount = await prisma.payment.count({ where: { merchantId } });

  // Pending settlements (completed but not settled)
  const pendingSettlementAgg = await prisma.payment.aggregate({
    where: { merchantId, status: 'COMPLETED', settled: false },
    _sum: { amount: true },
    _count: true,
  });

  // Success rate
  const completedCount = revenueAgg._count;
  const failedCount = await prisma.payment.count({ where: { merchantId, status: 'FAILED' } });
  const finishedCount = completedCount + failedCount;
  const successRate = finishedCount > 0 ? Math.round((completedCount / finishedCount) * 1000) / 10 : 100;

  // Token distribution (by completed payments)
  const tokenGroups = await prisma.payment.groupBy({
    by: ['token'],
    where: { merchantId, status: 'COMPLETED' },
    _sum: { amount: true },
    _count: true,
  });

  const totalTokenAmount = tokenGroups.reduce((s, g) => s + (g._sum.amount || 0), 0);
  const tokenDistribution = tokenGroups.map((g) => ({
    token: g.token,
    amount: g._sum.amount || 0,
    count: g._count,
    percentage: totalTokenAmount > 0 ? Math.round(((g._sum.amount || 0) / totalTokenAmount) * 100) : 0,
  }));

  // Daily revenue for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPayments = await prisma.payment.findMany({
    where: {
      merchantId,
      status: 'COMPLETED',
      completedAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  // Group by date
  const dailyRevenueMap = new Map<string, number>();
  for (let d = 0; d < 30; d++) {
    const date = new Date(Date.now() - (29 - d) * 24 * 60 * 60 * 1000);
    dailyRevenueMap.set(date.toISOString().split('T')[0], 0);
  }
  for (const p of recentPayments) {
    if (p.completedAt) {
      const dateKey = p.completedAt.toISOString().split('T')[0];
      dailyRevenueMap.set(dateKey, (dailyRevenueMap.get(dateKey) || 0) + p.amount);
    }
  }
  const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, amount]) => ({ date, amount }));

  // Recent 5 transactions
  const recentTransactions = await prisma.payment.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      amount: true,
      token: true,
      status: true,
      customerWallet: true,
      createdAt: true,
    },
  });

  return {
    totalRevenue: revenueAgg._sum.amount || 0,
    totalTransactions: totalTxCount,
    completedTransactions: completedCount,
    pendingSettlementAmount: pendingSettlementAgg._sum.amount || 0,
    pendingSettlementCount: pendingSettlementAgg._count,
    successRate,
    tokenDistribution,
    dailyRevenue,
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      token: t.token,
      status: t.status,
      customerWallet: t.customerWallet,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

