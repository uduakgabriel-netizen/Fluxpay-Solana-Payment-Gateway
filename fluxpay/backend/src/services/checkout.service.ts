/**
 * Checkout Session Service
 *
 * Manages the lifecycle of hosted checkout sessions:
 * create → awaiting_payment → payment_detected → swapping → completed
 *
 * This is the "Stripe Checkout" equivalent for Solana.
 */

import { PrismaClient, CheckoutSessionStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from './auth.service';
import { buildSwapTransaction } from './nonCustodialSwap.service';
import { deliverWebhook } from '../utils/webhook';

const prisma = new PrismaClient();

const SESSION_EXPIRY_HOURS = 1;
const CHECKOUT_BASE_URL = process.env.FLUXPAY_CHECKOUT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Interfaces ─────────────────────────────────────────────

interface CreateCheckoutSessionInput {
  merchantId: string;
  amount: number;
  token: string;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

// ─── Create Checkout Session ────────────────────────────────

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const { merchantId, amount, token, orderId, successUrl, cancelUrl, webhookUrl } = input;

  if (amount <= 0) {
    throw new AppError('Amount must be greater than 0', 400);
  }

  // Verify merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      businessName: true,
      walletAddress: true,
      preferredTokenSymbol: true,
      preferredTokenMint: true,
      preferredTokenDecimals: true,
    },
  });

  if (!merchant) {
    throw new AppError('Merchant not found', 404);
  }

  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const session = await prisma.checkoutSession.create({
    data: {
      merchantId,
      orderId: orderId || null,
      amount,
      token: token.toUpperCase(),
      successUrl: successUrl || null,
      cancelUrl: cancelUrl || null,
      webhookUrl: webhookUrl || null,
      status: 'PENDING',
      expiresAt,
    },
  });

  return {
    id: session.id,
    checkoutUrl: `${CHECKOUT_BASE_URL}/pay/${session.id}`,
    amount: session.amount,
    token: session.token,
    status: session.status,
    expiresAt: session.expiresAt.toISOString(),
  };
}

// ─── Get Checkout Session (Public — no auth needed) ─────────

export async function getCheckoutSession(sessionId: string) {
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    include: {
      merchant: {
        select: {
          businessName: true,
          walletAddress: true,
          preferredTokenSymbol: true,
          preferredTokenDecimals: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError('Checkout session not found', 404);
  }

  // Check expiry
  if (session.status === 'PENDING' && new Date() > session.expiresAt) {
    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED' },
    });
    throw new AppError('Checkout session has expired', 410);
  }

  return {
    id: session.id,
    merchantName: session.merchant.businessName,
    merchantWallet: session.merchant.walletAddress,
    merchantPreferredToken: session.merchant.preferredTokenSymbol,
    orderId: session.orderId,
    amount: session.amount,
    token: session.token,
    status: session.status,
    customerWallet: session.customerWallet,
    transactionHash: session.transactionHash,
    successUrl: session.successUrl,
    cancelUrl: session.cancelUrl,
    errorMessage: session.errorMessage,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

// ─── Get Checkout Session Status (lightweight polling) ──────

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      transactionHash: true,
      customerWallet: true,
      errorMessage: true,
      successUrl: true,
    },
  });

  if (!session) {
    throw new AppError('Checkout session not found', 404);
  }

  return {
    id: session.id,
    status: session.status,
    transactionHash: session.transactionHash,
    customerWallet: session.customerWallet,
    errorMessage: session.errorMessage,
    successUrl: session.successUrl,
  };
}

// ─── Execute Payment (after customer connects wallet) ───────

export async function executeCheckoutPayment(sessionId: string, customerWallet: string) {
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    include: {
      merchant: {
        select: {
          walletAddress: true,
          preferredTokenSymbol: true,
          preferredTokenDecimals: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError('Checkout session not found', 404);
  }

  if (session.status !== 'PENDING' && session.status !== 'AWAITING_PAYMENT') {
    throw new AppError(`Session is in ${session.status} state and cannot be executed`, 400);
  }

  if (new Date() > session.expiresAt) {
    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED' },
    });
    throw new AppError('Checkout session has expired', 410);
  }

  // Update session with customer wallet
  await prisma.checkoutSession.update({
    where: { id: sessionId },
    data: {
      customerWallet,
      status: 'AWAITING_PAYMENT',
    },
  });

  const customerToken = session.token;
  const merchantToken = session.merchant.preferredTokenSymbol;
  const merchantWallet = session.merchant.walletAddress;

  // If customer pays in same token as merchant prefers, build direct transfer
  // Otherwise build a Jupiter swap transaction
  const swapNeeded = customerToken !== merchantToken;

  if (swapNeeded) {
    // Build swap transaction via Jupiter
    const swapResult = await buildSwapTransaction(
      customerWallet,
      merchantWallet,
      customerToken,
      merchantToken,
      session.amount
    );

    if (!swapResult) {
      await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: {
          status: 'FAILED',
          errorMessage: 'Failed to build swap transaction. Please try again.',
        },
      });
      throw new AppError('Failed to build swap transaction', 500);
    }

    // Store quote in session
    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        swapQuote: swapResult.quote as any,
      },
    });

    return {
      sessionId,
      transaction: swapResult.serializedTransaction,
      expectedOutput: swapResult.outputAmount,
      merchantWallet,
      swapRequired: true,
    };
  }

  // No swap needed — build a direct SPL token transfer or SOL transfer
  // For direct transfers, the frontend handles the transaction building
  return {
    sessionId,
    transaction: null,
    expectedOutput: session.amount,
    merchantWallet,
    swapRequired: false,
    directTransfer: {
      to: merchantWallet,
      amount: session.amount,
      token: customerToken,
    },
  };
}

// ─── Confirm Payment (after tx is confirmed on-chain) ───────

export async function confirmCheckoutPayment(sessionId: string, txHash: string) {
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    include: {
      merchant: {
        select: {
          id: true,
          businessName: true,
          walletAddress: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError('Checkout session not found', 404);
  }

  if (session.status === 'COMPLETED') {
    return { status: 'COMPLETED', transactionHash: session.transactionHash };
  }

  // Update session to completed
  await prisma.checkoutSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      transactionHash: txHash,
    },
  });

  // Also create a Payment record for the merchant's dashboard
  const payment = await prisma.payment.create({
    data: {
      merchant: { connect: { id: session.merchantId } },
      amount: session.amount,
      token: session.token,
      customerWallet: session.customerWallet,
      status: 'COMPLETED',
      txHash,
      merchantWallet: session.merchant.walletAddress,
      expiresAt: session.expiresAt,
      completedAt: new Date(),
      metadata: { checkoutSessionId: session.id, orderId: session.orderId },
    },
  });

  // Link payment to session
  await prisma.checkoutSession.update({
    where: { id: sessionId },
    data: { paymentId: payment.id },
  });

  // Create payment event
  await prisma.paymentEvent.create({
    data: { paymentId: payment.id, status: 'COMPLETED' },
  });

  // Deliver webhook to merchant
  const webhookPayload = {
    event: 'payment.completed',
    sessionId: session.id,
    orderId: session.orderId,
    amount: session.amount,
    token: session.token,
    customerWallet: session.customerWallet,
    transactionHash: txHash,
    merchantId: session.merchantId,
  };

  // Use merchant's session-level webhookUrl or fall back to configured webhook
  deliverWebhook({
    merchantId: session.merchantId,
    event: 'payment.completed',
    data: webhookPayload,
  }).catch((err) => logger.error('[Checkout] Webhook delivery error:', err));

  return {
    status: 'COMPLETED',
    transactionHash: txHash,
    paymentId: payment.id,
  };
}

// ─── Expire Stale Checkout Sessions ─────────────────────────

export async function expireCheckoutSessions(): Promise<number> {
  const result = await prisma.checkoutSession.updateMany({
    where: {
      status: { in: ['PENDING', 'AWAITING_PAYMENT'] },
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  return result.count;
}
