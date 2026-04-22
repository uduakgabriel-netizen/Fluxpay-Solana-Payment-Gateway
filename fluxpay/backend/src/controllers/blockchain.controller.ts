import { logger } from '../utils/logger';
/**
 * Blockchain Controller
 *
 * API endpoints for blockchain-related operations:
 * - Check wallet balances
 * - Verify transactions
 * - Get swap quotes
 * - Get supported tokens
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { getWalletBalance, verifyTransaction } from '../services/solana-wallet.service';
import { getSwapQuote } from '../services/jupiter.service';
import { TOKEN_REGISTRY, getAllTokenSymbols, getTokenBySymbol } from '../utils/token-registry';

/**
 * GET /api/blockchain/tokens
 * Get list of all supported tokens
 */
export async function getSupportedTokens(req: Request, res: Response): Promise<void> {
  const tokens = Object.values(TOKEN_REGISTRY).map((t) => ({
    symbol: t.symbol,
    name: t.name,
    mintAddress: t.mintAddress,
    decimals: t.decimals,
    isNative: t.isNative,
  }));

  res.status(200).json({ tokens });
}

/**
 * GET /api/blockchain/balance/:address
 * Get wallet balance for a Solana address
 */
export async function getBalance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { address } = req.params;

    if (!address || address.length < 32) {
      res.status(400).json({ error: 'Invalid Solana address' });
      return;
    }

    const balance = await getWalletBalance(address);
    res.status(200).json(balance);
  } catch (error: any) {
    logger.error('[Blockchain] Balance check error:', error);
    res.status(500).json({ error: 'Failed to check wallet balance' });
  }
}

/**
 * GET /api/blockchain/transaction/:signature
 * Verify and get details of a Solana transaction
 */
export async function getTransaction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { signature } = req.params;

    if (!signature || signature.length < 32) {
      res.status(400).json({ error: 'Invalid transaction signature' });
      return;
    }

    const tx = await verifyTransaction(signature);

    if (!tx) {
      res.status(404).json({ error: 'Transaction not found or has errors' });
      return;
    }

    res.status(200).json(tx);
  } catch (error: any) {
    logger.error('[Blockchain] Transaction verification error:', error);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
}

/**
 * GET /api/blockchain/swap-quote
 * Get a Jupiter swap quote
 * Query params: from, to, amount
 */
export async function getQuote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      res.status(400).json({ error: 'Missing required params: from, to, amount' });
      return;
    }

    const fromToken = getTokenBySymbol(from as string);
    const toToken = getTokenBySymbol(to as string);

    if (!fromToken) {
      res.status(400).json({ error: `Unsupported source token: ${from}` });
      return;
    }

    if (!toToken) {
      res.status(400).json({ error: `Unsupported destination token: ${to}` });
      return;
    }

    const amountNum = parseFloat(amount as string);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const quote = await getSwapQuote(from as string, to as string, amountNum);

    if (!quote) {
      res.status(404).json({ error: 'No swap route available' });
      return;
    }

    res.status(200).json({
      from: fromToken.symbol,
      to: toToken.symbol,
      inputAmount: amountNum,
      outputAmount: Number(quote.outAmount) / Math.pow(10, toToken.decimals),
      priceImpact: quote.priceImpactPct,
      slippageBps: quote.slippageBps,
      estimatedFee: quote.estimatedFeeInSol,
    });
  } catch (error: any) {
    logger.error('[Blockchain] Swap quote error:', error);
    res.status(500).json({ error: 'Failed to get swap quote' });
  }
}

/**
 * GET /api/blockchain/network
 * Get current network configuration
 */
export async function getNetworkInfo(req: Request, res: Response): Promise<void> {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = network === 'mainnet'
    ? process.env.SOLANA_RPC_URL
    : process.env.SOLANA_RPC_DEVNET;

  res.status(200).json({
    network,
    rpcUrl: rpcUrl ? rpcUrl.replace(/\/\/.*@/, '//***@') : 'not configured', // Hide credentials
    fluxpayWallet: process.env.FLUXPAY_WALLET_PUBLIC_KEY || 'not configured',
    heliusConfigured: !!process.env.HELIUS_API_KEY,
    jupiterApiUrl: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
    supportedTokens: getAllTokenSymbols(),
  });
}
