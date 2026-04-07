/**
 * Token Registry
 *
 * All supported SPL tokens with their Solana mint addresses.
 * Used for token validation, swap routing, and payment verification.
 */

export interface TokenInfo {
  symbol: string;
  name: string;
  mintAddress: string;
  decimals: number;
  isNative: boolean; // true for SOL
}

export const TOKEN_REGISTRY: Record<string, TokenInfo> = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    isNative: true,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    isNative: false,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    isNative: false,
  },
  BONK: {
    symbol: 'BONK',
    name: 'Bonk',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    isNative: false,
  },
  WIF: {
    symbol: 'WIF',
    name: 'dogwifhat',
    mintAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    isNative: false,
  },
  JTO: {
    symbol: 'JTO',
    name: 'Jito Token',
    mintAddress: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    decimals: 9,
    isNative: false,
  },
  JUP: {
    symbol: 'JUP',
    name: 'Jupiter',
    mintAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    isNative: false,
  },
  PYTH: {
    symbol: 'PYTH',
    name: 'Pyth Network',
    mintAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    decimals: 6,
    isNative: false,
  },
  KMNO: {
    symbol: 'KMNO',
    name: 'Kamino',
    mintAddress: 'KMNo3nJsBXfcpJTVhZcXLW7RmTwTtLGVqmNmELvkaLz',
    decimals: 6,
    isNative: false,
  },
  HNT: {
    symbol: 'HNT',
    name: 'Helium',
    mintAddress: 'hntyVP6YjsFW236yaSrJij9btQsrn5QJFn3TA9hRVnZ',
    decimals: 8,
    isNative: false,
  },
};

/**
 * Get token info by symbol (case-insensitive)
 */
export function getTokenBySymbol(symbol: string): TokenInfo | null {
  return TOKEN_REGISTRY[symbol.toUpperCase()] || null;
}

/**
 * Get token info by mint address
 */
export function getTokenByMint(mintAddress: string): TokenInfo | null {
  return Object.values(TOKEN_REGISTRY).find((t) => t.mintAddress === mintAddress) || null;
}

/**
 * Check if a token symbol is supported
 */
export function isSupportedToken(symbol: string): boolean {
  return symbol.toUpperCase() in TOKEN_REGISTRY;
}

/**
 * Get mint address for a token symbol
 */
export function getMintAddress(symbol: string): string | null {
  const token = getTokenBySymbol(symbol);
  return token ? token.mintAddress : null;
}

/**
 * Get all supported token symbols
 */
export function getAllTokenSymbols(): string[] {
  return Object.keys(TOKEN_REGISTRY);
}
