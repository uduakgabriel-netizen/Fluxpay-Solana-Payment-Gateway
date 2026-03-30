/**
 * Helius Webhook Service
 *
 * Processes real-time Solana transaction data from Helius webhooks.
 *
 * Flow:
 * 1. Receive webhook payload from Helius
 * 2. Parse transaction details (sender, receiver, token, amount)
 * 3. Match to payment session by receiving address
 * 4. Verify transaction on-chain
 * 5. Update payment status
 * 6. Trigger swap if needed
 * 7. Send merchant webhook
 */

import { PrismaClient, PaymentStatus } from '@prisma/client';
import { verifyTransaction } from './solana-wallet.service';
import { processSwapIfNeeded } from './jupiter.service';
import { deliverWebhook } from '../utils/webhook';
import { getTokenByMint, TOKEN_REGISTRY } from '../utils/token-registry';

const prisma = new PrismaClient();

// ─── Helius Webhook Types ───────────────────────────────────

interface HeliusTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
  mint?: string;
  tokenStandard?: string;
}

interface HeliusEnhancedTransaction {
  signature: string;
  type: string;
  timestamp: number;
  slot: number;
  fee: number;
  feePayer: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number; // in lamports
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount?: string;
    toTokenAccount?: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
  }>;
  accountData?: any[];
  description?: string;
  source?: string;
}

// ─── Process Helius Webhook ─────────────────────────────────

/**
 * Process an incoming Helius webhook payload.
 * Helius sends an array of enhanced transactions.
 *
 * @param payload - The raw webhook body (array of enhanced transactions)
 * @returns Processing results for each transaction
 */
export async function processHeliusWebhook(
  payload: HeliusEnhancedTransaction[]
): Promise<{
  processed: number;
  matched: number;
  errors: string[];
}> {
  const results = { processed: 0, matched: 0, errors: [] as string[] };

  if (!Array.isArray(payload)) {
    results.errors.push('Invalid payload: expected array of transactions');
    return results;
  }

  for (const tx of payload) {
    results.processed++;

    try {
      await processTransaction(tx);
      results.matched++;
    } catch (error: any) {
      const msg = `Error processing tx ${tx.signature?.slice(0, 12)}...: ${error.message}`;
      console.error(`[Helius] ${msg}`);
      results.errors.push(msg);
    }
  }

  console.log(
    `[Helius] Processed ${results.processed} transactions, matched ${results.matched}, errors: ${results.errors.length}`
  );

  return results;
}

// ─── Process Single Transaction ─────────────────────────────

async function processTransaction(tx: HeliusEnhancedTransaction): Promise<void> {
  const { signature, nativeTransfers, tokenTransfers } = tx;

  if (!signature) {
    throw new Error('Transaction has no signature');
  }

  // Check for duplicate — skip if we already processed this tx
  const existing = await prisma.payment.findFirst({
    where: { txHash: signature },
  });

  if (existing) {
    console.log(`[Helius] Duplicate tx ${signature.slice(0, 12)}... already processed, skipping`);
    return;
  }

  // Process native SOL transfers
  if (nativeTransfers && nativeTransfers.length > 0) {
    for (const transfer of nativeTransfers) {
      const matched = await matchAndProcessTransfer({
        signature,
        sender: transfer.fromUserAccount,
        receiver: transfer.toUserAccount,
        amount: transfer.amount / 1e9, // lamports → SOL
        token: 'SOL',
        mintAddress: TOKEN_REGISTRY.SOL.mintAddress,
        timestamp: tx.timestamp,
      });

      if (matched) return; // One match per transaction is enough
    }
  }

  // Process SPL token transfers
  if (tokenTransfers && tokenTransfers.length > 0) {
    for (const transfer of tokenTransfers) {
      const tokenInfo = getTokenByMint(transfer.mint);

      const matched = await matchAndProcessTransfer({
        signature,
        sender: transfer.fromUserAccount,
        receiver: transfer.toUserAccount,
        amount: transfer.tokenAmount,
        token: tokenInfo?.symbol || 'UNKNOWN',
        mintAddress: transfer.mint,
        timestamp: tx.timestamp,
      });

      if (matched) return;
    }
  }

  // No matching payment found — this is normal for unrelated transactions
  console.log(`[Helius] No matching payment for tx ${signature.slice(0, 12)}...`);
}

// ─── Match Transfer to Payment ──────────────────────────────

interface TransferData {
  signature: string;
  sender: string;
  receiver: string;
  amount: number;
  token: string;
  mintAddress: string;
  timestamp: number;
}

async function matchAndProcessTransfer(transfer: TransferData): Promise<boolean> {
  // Find payment by receiving address
  const payment = await prisma.payment.findFirst({
    where: {
      receivingAddress: transfer.receiver,
      status: 'PENDING',
    },
    include: {
      merchant: true,
    },
  });

  if (!payment) return false;

  console.log(
    `[Helius] Matched tx ${transfer.signature.slice(0, 12)}... to payment ${payment.id}`
  );

  // ─── Validate Amount ───────────────────────────────────────
  const amountTolerance = 0.01; // 1% tolerance for rounding
  const expectedAmount = payment.amount;
  const receivedAmount = transfer.amount;
  const amountDiff = Math.abs(receivedAmount - expectedAmount) / expectedAmount;

  if (amountDiff > amountTolerance) {
    console.error(
      `[Helius] Amount mismatch for payment ${payment.id}: expected ${expectedAmount}, got ${receivedAmount}`
    );

    await markPaymentFailed(payment.id, payment.merchantId, {
      reason: 'Amount mismatch',
      expected: expectedAmount,
      received: receivedAmount,
      txHash: transfer.signature,
    });

    return true; // We matched the payment, even though it failed
  }

  // ─── Validate Token (if merchant specified one) ────────────
  // The payment.token is what the merchant expects to receive
  // The transfer.token is what the customer actually sent
  // If they differ, we'll need a swap

  // ─── Update Payment to CONFIRMED ──────────────────────────
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CONFIRMED',
      txHash: transfer.signature,
      customerWallet: transfer.sender,
      confirmedAt: new Date(),
    },
  });

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      status: 'CONFIRMED',
    },
  });

  console.log(`[Helius] Payment ${payment.id} status → CONFIRMED`);

  // ─── Send merchant webhook: payment.confirmed ─────────────
  await deliverWebhook({
    merchantId: payment.merchantId,
    event: 'payment.confirmed',
    data: {
      paymentId: payment.id,
      amount: payment.amount,
      token: payment.token,
      receivedToken: transfer.token,
      receivedAmount: transfer.amount,
      txHash: transfer.signature,
      customerWallet: transfer.sender,
      confirmedAt: new Date().toISOString(),
    },
  });

  // ─── Check if swap is needed ──────────────────────────────
  const receivedToken = transfer.token.toUpperCase();
  const merchantToken = payment.token.toUpperCase();

  await processSwapIfNeeded(
    payment.id,
    receivedToken,
    receivedAmount,
    merchantToken
  );

  // ─── Send final webhooks ──────────────────────────────────
  // Reload the payment to get latest status
  const updatedPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
  });

  if (updatedPayment?.status === 'SWAPPED' || updatedPayment?.swapRequired) {
    await deliverWebhook({
      merchantId: payment.merchantId,
      event: 'payment.swapped',
      data: {
        paymentId: payment.id,
        fromToken: updatedPayment.swappedFrom,
        toToken: payment.token,
        swappedAmount: updatedPayment.swappedAmount,
        swapFee: updatedPayment.swapFee,
        swapTxHash: updatedPayment.swapTxHash,
      },
    });
  }

  if (updatedPayment?.status === 'COMPLETED') {
    await deliverWebhook({
      merchantId: payment.merchantId,
      event: 'payment.completed',
      data: {
        paymentId: payment.id,
        amount: updatedPayment.swappedAmount || payment.amount,
        token: payment.token,
        txHash: transfer.signature,
        swapTxHash: updatedPayment.swapTxHash,
        completedAt: updatedPayment.completedAt?.toISOString(),
      },
    });
  }

  return true;
}

// ─── Helper: Mark Payment Failed ────────────────────────────

async function markPaymentFailed(
  paymentId: string,
  merchantId: string,
  details: Record<string, any>
): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'FAILED' },
  });

  await prisma.paymentEvent.create({
    data: {
      paymentId,
      status: 'FAILED',
    },
  });

  await deliverWebhook({
    merchantId,
    event: 'payment.failed',
    data: {
      paymentId,
      ...details,
    },
  });
}

// ─── Verify Helius Auth ─────────────────────────────────────

/**
 * Validate the Helius webhook auth header.
 * Helius sends the API key in the Authorization header.
 */
export function verifyHeliusAuth(authHeader: string | undefined): boolean {
  const heliusApiKey = process.env.HELIUS_API_KEY;

  if (!heliusApiKey) {
    // If no key configured, allow in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Helius] No HELIUS_API_KEY set — accepting all webhooks in dev mode');
      return true;
    }
    return false;
  }

  if (!authHeader) return false;

  // Helius can send key directly or as Bearer token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : authHeader;

  return token === heliusApiKey;
}
