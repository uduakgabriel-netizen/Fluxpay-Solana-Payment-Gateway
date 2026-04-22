import { logger } from '../utils/logger';
/**
 * Jupiter Swap Service — PRODUCTION (Non-Custodial)
 *
 * Real integration with Jupiter DEX Aggregator v6 for token swaps on Solana.
 *
 * NON-CUSTODIAL FLOW:
 * 1. GET /quote — Get best swap route and price
 * 2. POST /swap — Get the serialized swap transaction with:
 *    - userPublicKey: customerWallet (customer pays from here)
 *    - destinationTokenAccount: merchantWallet (merchant receives here)
 *    - useSharedAccounts: true (auto-create ATA if missing)
 * 3. Customer signs the transaction on frontend
 * 4. FluxPay co-signs (for gas) and submits to Solana
 *
 * FluxPay NEVER holds customer funds.
 */

import {
  Keypair,
  VersionedTransaction,
  PublicKey,
} from '@solana/web3.js';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { getMintAddress, getTokenBySymbol } from '../utils/token-registry';
import { getConnection, getRecommendedPriorityFee, withFailover } from '../config/solana';
import { AlertService } from './alert.service';

const prisma = new PrismaClient();

const JUPITER_API_URL = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
const MAX_SWAP_RETRIES = 5;
const QUOTE_EXPIRY_SECONDS = 60;
const INITIAL_SLIPPAGE_BPS = 100; // 1%
const MAX_SLIPPAGE_BPS = 1000; // 10%

// Retry delays: 5s, 5s, 10s, 15s (between attempts)
const RETRY_DELAYS_MS = [5000, 5000, 10000, 15000];

// ─── Interfaces ─────────────────────────────────────────────

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
  estimatedFeeInSol: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  inputAmount: number;
  outputAmount: number;
  fee: number;
  error?: string;
}

// ─── Get Swap Quote ─────────────────────────────────────────

/**
 * Get the best swap quote from Jupiter API.
 *
 * @param fromToken - Token symbol to swap from (e.g., "SOL")
 * @param toToken - Token symbol to swap to (e.g., "USDC")
 * @param amount - Amount in the input token (human-readable)
 * @param slippageBps - Slippage tolerance in basis points
 * @returns Swap quote with rates and route, or null on failure
 */
export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: number,
  slippageBps: number = INITIAL_SLIPPAGE_BPS
): Promise<SwapQuote | null> {
  const inputMint = getMintAddress(fromToken);
  const outputMint = getMintAddress(toToken);

  if (!inputMint || !outputMint) {
    logger.error(`[Jupiter] Unknown token: ${fromToken} or ${toToken}`);
    return null;
  }

  const fromTokenInfo = getTokenBySymbol(fromToken);
  if (!fromTokenInfo) return null;

  // Convert human-readable amount to smallest unit
  const amountInSmallestUnit = Math.floor(amount * Math.pow(10, fromTokenInfo.decimals));

  try {
    const url = new URL(`${JUPITER_API_URL}/quote`);
    url.searchParams.set('inputMint', inputMint);
    url.searchParams.set('outputMint', outputMint);
    url.searchParams.set('amount', amountInSmallestUnit.toString());
    url.searchParams.set('slippageBps', slippageBps.toString());
    url.searchParams.set('swapMode', 'ExactIn');

    logger.info(`[Jupiter] Getting quote: ${amount} ${fromToken} → ${toToken} (slippage: ${slippageBps}bps)`);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error(`[Jupiter] Quote API error (${response.status}):`, errText);
      return null;
    }

    const quote: any = await response.json();

    // Calculate estimated fee in SOL
    const estimatedFeeInSol = 0.000005; // ~5000 lamports per tx

    return {
      ...quote,
      estimatedFeeInSol,
    } as SwapQuote;
  } catch (error: any) {
    logger.error('[Jupiter] Error getting swap quote:', error.message);
    return null;
  }
}

// ─── Helper: Calculate Increasing Slippage ──────────────────

function getSlippageForAttempt(attempt: number): number {
  // Attempt 1: 1%, 2: 2%, 3: 3%, 4: 5%, 5: 10%
  const slippageMap: Record<number, number> = {
    1: 100,
    2: 200,
    3: 300,
    4: 500,
    5: 1000,
  };
  return slippageMap[attempt] || MAX_SLIPPAGE_BPS;
}

// ─── Build Non-Custodial Swap Transaction ───────────────────

/**
 * Build a swap transaction for non-custodial execution.
 * Sets up the transaction so:
 * - Customer's wallet is the source
 * - Merchant's wallet receives the output tokens
 * - useSharedAccounts auto-creates ATAs
 */
export async function buildNonCustodialSwapTx(
  quote: SwapQuote,
  customerWallet: string,
  merchantWallet: string
): Promise<string | null> {
  try {
    const swapResponse = await fetch(`${JUPITER_API_URL}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: customerWallet,           // Customer pays from here
        destinationTokenAccount: merchantWallet, // Merchant receives here
        useSharedAccounts: true,                 // Auto-create ATA if missing
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!swapResponse.ok) {
      const errText = await swapResponse.text();
      logger.error(`[Jupiter] Swap API error (${swapResponse.status}):`, errText);
      return null;
    }

    const swapData: any = await swapResponse.json();
    return swapData.swapTransaction || null;
  } catch (error: any) {
    logger.error('[Jupiter] Error building swap transaction:', error.message);
    return null;
  }
}

// ─── Swap Status ────────────────────────────────────────────

/**
 * Check the status of a swap by its transaction hash using real RPC.
 */
export async function getSwapStatus(txHash: string): Promise<{
  confirmed: boolean;
  slot?: number;
  error?: string;
}> {
  try {
    return await withFailover(async (connection) => {
      const status = await connection.getSignatureStatus(txHash, {
        searchTransactionHistory: true,
      });

      const value = status?.value;

      if (!value) {
        return { confirmed: false, error: 'Transaction not found' };
      }

      if (value.err) {
        return { confirmed: false, error: `Transaction failed: ${JSON.stringify(value.err)}` };
      }

      const isConfirmed =
        value.confirmationStatus === 'confirmed' || value.confirmationStatus === 'finalized';

      return {
        confirmed: isConfirmed,
        slot: value.slot,
      };
    });
  } catch (error: any) {
    return { confirmed: false, error: error.message };
  }
}

// ─── Process Swap If Needed (Non-Custodial) ─────────────────

/**
 * Check if a payment needs a swap and process it.
 * In non-custodial mode, the swap goes directly from customer to merchant.
 *
 * @param paymentId - The payment ID
 * @param receivedToken - The token actually received
 * @param receivedAmount - The amount actually received
 * @param merchantPreferredToken - What the merchant wants
 * @param customerWallet - Customer's wallet address
 * @param merchantWallet - Merchant's wallet address
 */
export async function processSwapIfNeeded(
  paymentId: string,
  receivedToken: string,
  receivedAmount: number,
  merchantPreferredToken: string,
  customerWallet?: string,
  merchantWallet?: string
): Promise<void> {
  if (receivedToken.toUpperCase() === merchantPreferredToken.toUpperCase()) {
    // No swap needed — mark as COMPLETED
    logger.info(`[Jupiter] No swap needed for payment ${paymentId}: ${receivedToken} matches merchant preference`);

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await prisma.paymentEvent.create({
      data: {
        paymentId,
        status: 'COMPLETED',
      },
    });

    return;
  }

  // Swap is needed
  logger.info(
    `[Jupiter] Swap needed for payment ${paymentId}: ${receivedToken} → ${merchantPreferredToken}`
  );

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      swapRequired: true,
      swappedFrom: receivedToken,
    },
  });

  // In non-custodial mode, we need customer to initiate the swap
  // The swap transaction will be built and sent to the customer for signing
  // Mark as CONFIRMED (waiting for swap execution)
  logger.info(`[Jupiter] Payment ${paymentId} marked as needing swap. Customer must approve.`);
}

// ─── Utility ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
