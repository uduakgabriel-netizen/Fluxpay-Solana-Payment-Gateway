/**
 * Solana Transfer Utilities
 *
 * On-chain transfer functions for refunds and settlements.
 * In production, these would use @solana/web3.js with real keypairs.
 * Currently stubbed with simulated transaction hashes for development.
 */

import { randomBytes } from 'crypto';

const SIMULATED_DELAY_MS = parseInt(process.env.SOLANA_TX_DELAY_MS || '1500', 10);

/**
 * Simulate a Solana base58 transaction hash
 */
function generateTxHash(): string {
  const bytes = randomBytes(32);
  const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = '';
  let num = BigInt('0x' + bytes.toString('hex'));
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    hash = BASE58[remainder] + hash;
  }
  return hash.slice(0, 64);
}

/**
 * Transfer tokens from FluxPay wallet to a merchant wallet (settlement)
 *
 * @param merchantAddress - Merchant's Solana wallet address
 * @param amount - Amount to transfer
 * @param token - Token symbol (USDC, SOL, etc.)
 * @returns Transaction hash
 */
export async function transferToMerchant(
  merchantAddress: string,
  amount: number,
  token: string
): Promise<string> {
  console.log(
    `[Solana] Transferring ${amount} ${token} to merchant ${merchantAddress.slice(0, 8)}...`
  );

  // Simulate on-chain transaction time
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  // In production:
  // 1. Load FluxPay hot wallet keypair from env/HSM
  // 2. Create transfer instruction (SOL) or token transfer (SPL)
  // 3. Sign and send transaction
  // 4. Wait for confirmation
  // 5. Return confirmed tx signature

  const txHash = generateTxHash();
  console.log(`[Solana] Settlement tx confirmed: ${txHash.slice(0, 12)}...`);

  return txHash;
}

/**
 * Process a refund — send tokens back to the customer
 *
 * @param customerAddress - Customer's Solana wallet address
 * @param amount - Amount to refund
 * @param token - Token symbol
 * @returns Transaction hash
 */
export async function processRefundOnChain(
  customerAddress: string,
  amount: number,
  token: string
): Promise<string> {
  console.log(
    `[Solana] Refunding ${amount} ${token} to customer ${customerAddress.slice(0, 8)}...`
  );

  // Simulate on-chain transaction time
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  // In production:
  // 1. Load the receiving address private key (decrypt from payment record)
  // 2. Create refund transfer instruction
  // 3. Sign and send
  // 4. Confirm
  // 5. Return signature

  const txHash = generateTxHash();
  console.log(`[Solana] Refund tx confirmed: ${txHash.slice(0, 12)}...`);

  return txHash;
}
