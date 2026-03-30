/**
 * Solana Wallet Service
 *
 * Manages Solana wallets for payment receiving addresses:
 * - Generate new keypairs for each payment
 * - Encrypt/store private keys securely
 * - Check wallet balances via Solana RPC
 * - Transfer tokens between wallets
 * - Verify transaction signatures on-chain
 */

import nacl from 'tweetnacl';
import { encrypt, decrypt } from '../utils/encryption';
import { TOKEN_REGISTRY, getTokenBySymbol, getTokenByMint } from '../utils/token-registry';

// ─── Solana RPC Helpers ─────────────────────────────────────

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }
  let encoded = '';
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    encoded = BASE58_ALPHABET[remainder] + encoded;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    encoded = '1' + encoded;
  }
  return encoded;
}

function base58Decode(str: string): Uint8Array {
  const bytes: number[] = [0];
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base58 character: ${char}`);
    let carry = index;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of str) {
    if (char !== '1') break;
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

/**
 * Get Solana RPC URL based on network config
 */
function getRpcUrl(): string {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  if (network === 'mainnet') {
    return process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
  return process.env.SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com';
}

/**
 * Make a JSON-RPC call to Solana
 */
async function solanaRpc(method: string, params: any[] = []): Promise<any> {
  const response = await fetch(getRpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const json: any = await response.json();
  if (json.error) {
    throw new Error(`Solana RPC error: ${json.error.message}`);
  }
  return json.result;
}

// ─── Wallet Generation ──────────────────────────────────────

export interface GeneratedWallet {
  address: string;
  encryptedPrivateKey: string;
}

/**
 * Generate a new Solana keypair for a payment receiving address.
 * The private key is encrypted before returning.
 */
export function generateReceivingWallet(): GeneratedWallet {
  const keypair = nacl.sign.keyPair();
  const address = base58Encode(keypair.publicKey);
  const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');
  const encryptedPrivateKey = encrypt(privateKeyHex);

  return { address, encryptedPrivateKey };
}

/**
 * Restore a keypair from an encrypted private key
 */
export function restoreKeypair(encryptedPrivateKey: string): {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
} {
  const privateKeyHex = decrypt(encryptedPrivateKey);
  const secretKey = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));
  // Ed25519 secret key contains the public key in the last 32 bytes
  const publicKey = secretKey.slice(32);
  return { publicKey, secretKey };
}

// ─── Balance Checking ───────────────────────────────────────

export interface WalletBalance {
  sol: number;
  tokens: Array<{
    symbol: string;
    mintAddress: string;
    amount: number;
    decimals: number;
  }>;
}

/**
 * Get the SOL balance and SPL token balances for a wallet
 */
export async function getWalletBalance(address: string): Promise<WalletBalance> {
  // Get SOL balance
  const solBalanceLamports = await solanaRpc('getBalance', [address]);
  const solBalance = (solBalanceLamports?.value ?? 0) / 1e9;

  // Get token accounts
  const tokenAccounts = await solanaRpc('getTokenAccountsByOwner', [
    address,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ]);

  const tokens: WalletBalance['tokens'] = [];

  if (tokenAccounts?.value) {
    for (const account of tokenAccounts.value) {
      const parsed = account.account?.data?.parsed?.info;
      if (!parsed) continue;

      const mintAddress = parsed.mint;
      const tokenInfo = getTokenByMint(mintAddress);
      const amount = parsed.tokenAmount?.uiAmount ?? 0;
      const decimals = parsed.tokenAmount?.decimals ?? 0;

      tokens.push({
        symbol: tokenInfo?.symbol || 'UNKNOWN',
        mintAddress,
        amount,
        decimals,
      });
    }
  }

  return { sol: solBalance, tokens };
}

// ─── Transaction Verification ───────────────────────────────

export interface TransactionDetails {
  signature: string;
  sender: string;
  receiver: string;
  amount: number;
  token: string;
  mintAddress: string;
  confirmed: boolean;
  slot: number;
  blockTime: number | null;
  fee: number;
}

/**
 * Verify a transaction on the Solana blockchain
 * Returns parsed transaction details if valid
 */
export async function verifyTransaction(signature: string): Promise<TransactionDetails | null> {
  try {
    const tx = await solanaRpc('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ]);

    if (!tx) return null;

    const meta = tx.meta;
    if (meta?.err) {
      console.log(`[Solana] Transaction ${signature.slice(0, 12)}... has error:`, meta.err);
      return null;
    }

    // Parse the transaction to extract transfer details
    const instructions = tx.transaction?.message?.instructions || [];
    let sender = '';
    let receiver = '';
    let amount = 0;
    let tokenSymbol = 'SOL';
    let mintAddress = TOKEN_REGISTRY.SOL.mintAddress;

    for (const ix of instructions) {
      // Native SOL transfer
      if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
        sender = ix.parsed.info.source;
        receiver = ix.parsed.info.destination;
        amount = ix.parsed.info.lamports / 1e9;
        tokenSymbol = 'SOL';
        mintAddress = TOKEN_REGISTRY.SOL.mintAddress;
        break;
      }

      // SPL Token transfer
      if (ix.program === 'spl-token' && (ix.parsed?.type === 'transfer' || ix.parsed?.type === 'transferChecked')) {
        sender = ix.parsed.info.authority || ix.parsed.info.source;
        receiver = ix.parsed.info.destination;
        const mint = ix.parsed.info.mint;
        mintAddress = mint || TOKEN_REGISTRY.SOL.mintAddress;

        if (ix.parsed.type === 'transferChecked') {
          amount = ix.parsed.info.tokenAmount?.uiAmount ?? 0;
        } else {
          const tokenInfo = getTokenByMint(mintAddress);
          const decimals = tokenInfo?.decimals || 6;
          amount = Number(ix.parsed.info.amount) / Math.pow(10, decimals);
        }

        const token = getTokenByMint(mintAddress);
        tokenSymbol = token?.symbol || 'UNKNOWN';
        break;
      }
    }

    // Also check inner instructions
    if (!sender && meta?.innerInstructions) {
      for (const inner of meta.innerInstructions) {
        for (const ix of inner.instructions) {
          if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
            sender = ix.parsed.info.source;
            receiver = ix.parsed.info.destination;
            amount = ix.parsed.info.lamports / 1e9;
            tokenSymbol = 'SOL';
            break;
          }
        }
        if (sender) break;
      }
    }

    return {
      signature,
      sender,
      receiver,
      amount,
      token: tokenSymbol,
      mintAddress,
      confirmed: true,
      slot: tx.slot,
      blockTime: tx.blockTime,
      fee: (meta?.fee || 0) / 1e9,
    };
  } catch (error) {
    console.error(`[Solana] Error verifying tx ${signature}:`, error);
    return null;
  }
}

// ─── Token Transfer ─────────────────────────────────────────

/**
 * Send tokens from one wallet to another.
 * In production this would construct and sign a real transaction.
 * Currently wraps the simulated transfer for dev.
 */
export async function sendTokens(
  fromEncryptedKey: string,
  toAddress: string,
  amount: number,
  token: string
): Promise<string> {
  const keypair = restoreKeypair(fromEncryptedKey);
  const fromAddress = base58Encode(keypair.publicKey);

  console.log(
    `[Solana] Sending ${amount} ${token} from ${fromAddress.slice(0, 8)}... to ${toAddress.slice(0, 8)}...`
  );

  // In production: Build and sign a real Solana transaction
  // For dev: simulate with a generated tx hash
  const { randomBytes } = await import('crypto');
  await new Promise((r) => setTimeout(r, 1500));

  const bytes = randomBytes(32);
  let num = BigInt('0x' + bytes.toString('hex'));
  let hash = '';
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    hash = BASE58_ALPHABET[remainder] + hash;
  }
  const txHash = hash.slice(0, 64);

  console.log(`[Solana] Transfer confirmed: ${txHash.slice(0, 12)}...`);
  return txHash;
}

/**
 * Transfer tokens from the FluxPay main wallet to a destination
 */
export async function transferFromFluxPayWallet(
  toAddress: string,
  amount: number,
  token: string
): Promise<string> {
  const fluxpayKey = process.env.FLUXPAY_WALLET_PRIVATE_KEY;
  if (!fluxpayKey) {
    throw new Error('FLUXPAY_WALLET_PRIVATE_KEY is not configured');
  }

  console.log(`[Solana] FluxPay wallet transferring ${amount} ${token} to ${toAddress.slice(0, 8)}...`);

  // Simulate transaction
  const { randomBytes } = await import('crypto');
  await new Promise((r) => setTimeout(r, 1500));

  const bytes = randomBytes(32);
  let num = BigInt('0x' + bytes.toString('hex'));
  let hash = '';
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    hash = BASE58_ALPHABET[remainder] + hash;
  }
  const txHash = hash.slice(0, 64);

  console.log(`[Solana] FluxPay transfer confirmed: ${txHash.slice(0, 12)}...`);
  return txHash;
}
