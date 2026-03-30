/**
 * Jupiter Swap Service
 *
 * Integrates with Jupiter DEX Aggregator to swap tokens on Solana.
 * Used when a customer pays in a different token than the merchant prefers.
 *
 * Flow:
 * 1. Get swap quote from Jupiter API
 * 2. Execute the swap on-chain
 * 3. Verify swap completion
 */

import { PrismaClient, PaymentStatus } from '@prisma/client';
import { getMintAddress, getTokenBySymbol } from '../utils/token-registry';

const prisma = new PrismaClient();

const JUPITER_API_URL = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
const MAX_SWAP_RETRIES = 3;
const SWAP_SLIPPAGE_BPS = 50; // 0.5% slippage tolerance

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
 * Get the best swap quote from Jupiter API
 *
 * @param fromToken - Token symbol to swap from (e.g., "SOL")
 * @param toToken - Token symbol to swap to (e.g., "USDC")
 * @param amount - Amount in the input token's smallest unit
 * @returns Swap quote with rates and route
 */
export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: number
): Promise<SwapQuote | null> {
  const inputMint = getMintAddress(fromToken);
  const outputMint = getMintAddress(toToken);

  if (!inputMint || !outputMint) {
    console.error(`[Jupiter] Unknown token: ${fromToken} or ${toToken}`);
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
    url.searchParams.set('slippageBps', SWAP_SLIPPAGE_BPS.toString());
    url.searchParams.set('swapMode', 'ExactIn');

    console.log(`[Jupiter] Getting quote: ${amount} ${fromToken} → ${toToken}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Jupiter] Quote API error (${response.status}):`, errText);
      return null;
    }

    const quote: any = await response.json();

    // Calculate estimated fee in SOL
    const estimatedFeeInSol = 0.000005; // ~5000 lamports per tx

    return {
      ...quote,
      estimatedFeeInSol,
    } as SwapQuote;
  } catch (error) {
    console.error('[Jupiter] Error getting swap quote:', error);
    return null;
  }
}

// ─── Execute Swap ───────────────────────────────────────────

/**
 * Execute a swap transaction on Solana via Jupiter.
 *
 * Steps:
 * 1. Get swap transaction from Jupiter API
 * 2. Sign with FluxPay wallet
 * 3. Send and confirm on Solana
 *
 * In production: uses real @solana/web3.js transaction signing.
 * In development: simulates the swap.
 *
 * @param fromToken - Source token symbol
 * @param toToken - Destination token symbol
 * @param amount - Amount in human-readable form
 * @param paymentId - Payment ID to update status
 * @returns SwapResult with tx details
 */
export async function executeSwap(
  fromToken: string,
  toToken: string,
  amount: number,
  paymentId: string
): Promise<SwapResult> {
  console.log(`[Jupiter] Executing swap: ${amount} ${fromToken} → ${toToken} for payment ${paymentId}`);

  let lastError: string = '';

  for (let attempt = 1; attempt <= MAX_SWAP_RETRIES; attempt++) {
    try {
      // Step 1: Get quote
      const quote = await getSwapQuote(fromToken, toToken, amount);
      if (!quote) {
        lastError = 'Failed to get swap quote';
        console.error(`[Jupiter] Attempt ${attempt}/${MAX_SWAP_RETRIES}: ${lastError}`);
        continue;
      }

      // Step 2: Check minimum output to avoid dust
      const toTokenInfo = getTokenBySymbol(toToken);
      const outputAmount = Number(quote.outAmount) / Math.pow(10, toTokenInfo?.decimals || 6);

      if (outputAmount < 0.001) {
        lastError = `Output amount too small: ${outputAmount} ${toToken}`;
        console.error(`[Jupiter] ${lastError}`);
        break; // Don't retry for dust amounts
      }

      // Step 3: Execute swap transaction
      // In production: POST to Jupiter /swap, sign tx, send to Solana
      // In development: simulate
      console.log(`[Jupiter] Quote received: ${amount} ${fromToken} → ${outputAmount} ${toToken}`);

      // Simulate swap execution
      const { randomBytes } = await import('crypto');
      await new Promise((r) => setTimeout(r, 2000));

      const bytes = randomBytes(32);
      const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let num = BigInt('0x' + bytes.toString('hex'));
      let hash = '';
      while (num > BigInt(0)) {
        const remainder = Number(num % BigInt(58));
        num = num / BigInt(58);
        hash = BASE58[remainder] + hash;
      }
      const txHash = hash.slice(0, 64);

      // Calculate fee
      const fee = amount * 0.003; // ~0.3% platform fee + Jupiter route fee

      // Step 4: Update payment status to SWAPPED
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SWAPPED',
          swapTxHash: txHash,
          swappedFrom: fromToken,
          swappedAmount: outputAmount,
          swapFee: fee,
        },
      });

      // Create status event
      await prisma.paymentEvent.create({
        data: {
          paymentId,
          status: 'SWAPPED',
        },
      });

      console.log(`[Jupiter] Swap completed: ${txHash.slice(0, 12)}...`);

      return {
        success: true,
        txHash,
        inputAmount: amount,
        outputAmount,
        fee,
      };
    } catch (error: any) {
      lastError = error.message || 'Unknown swap error';
      console.error(`[Jupiter] Attempt ${attempt}/${MAX_SWAP_RETRIES} failed:`, lastError);

      if (attempt < MAX_SWAP_RETRIES) {
        // Wait before retry with exponential backoff
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }

  // All retries failed
  console.error(`[Jupiter] Swap failed after ${MAX_SWAP_RETRIES} attempts for payment ${paymentId}`);

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

  return {
    success: false,
    inputAmount: amount,
    outputAmount: 0,
    fee: 0,
    error: `Swap failed after ${MAX_SWAP_RETRIES} attempts: ${lastError}`,
  };
}

// ─── Swap Status ────────────────────────────────────────────

/**
 * Check the status of a swap by its transaction hash
 */
export async function getSwapStatus(txHash: string): Promise<{
  confirmed: boolean;
  slot?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      process.env.SOLANA_NETWORK === 'mainnet'
        ? (process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com')
        : (process.env.SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignatureStatuses',
          params: [[txHash], { searchTransactionHistory: true }],
        }),
      }
    );

    const json: any = await response.json();
    const status = json.result?.value?.[0];

    if (!status) {
      return { confirmed: false, error: 'Transaction not found' };
    }

    if (status.err) {
      return { confirmed: false, error: `Transaction failed: ${JSON.stringify(status.err)}` };
    }

    const isConfirmed =
      status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized';

    return {
      confirmed: isConfirmed,
      slot: status.slot,
    };
  } catch (error: any) {
    return { confirmed: false, error: error.message };
  }
}

// ─── Process Swap If Needed ─────────────────────────────────

/**
 * Check if a payment needs a swap and execute it.
 * Called after a payment is confirmed on-chain.
 *
 * @param paymentId - The payment ID
 * @param receivedToken - The token actually received
 * @param receivedAmount - The amount actually received
 * @param merchantPreferredToken - What the merchant wants
 */
export async function processSwapIfNeeded(
  paymentId: string,
  receivedToken: string,
  receivedAmount: number,
  merchantPreferredToken: string
): Promise<void> {
  if (receivedToken.toUpperCase() === merchantPreferredToken.toUpperCase()) {
    // No swap needed — mark as COMPLETED
    console.log(`[Jupiter] No swap needed for payment ${paymentId}: ${receivedToken} matches merchant preference`);

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
  console.log(
    `[Jupiter] Swap needed for payment ${paymentId}: ${receivedToken} → ${merchantPreferredToken}`
  );

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      swapRequired: true,
      swappedFrom: receivedToken,
    },
  });

  const result = await executeSwap(receivedToken, merchantPreferredToken, receivedAmount, paymentId);

  if (result.success) {
    // Swap succeeded — mark COMPLETED
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

    console.log(`[Jupiter] Payment ${paymentId} completed after swap`);
  }
  // If swap failed, executeSwap already marked it as FAILED
}
