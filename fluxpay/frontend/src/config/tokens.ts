/**
 * Token Configuration
 * These are the ONLY 10 tokens supported by FluxPay for settlement.
 * Other tokens can be added here manually later.
 * Jupiter is used ONLY for swap quotes and execution, NOT for determining supported tokens.
 */

export interface Token {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  rank: number;
}

// Hardcoded list of supported tokens (source of truth)
export const SUPPORTED_TOKENS: Token[] = [
  {
    id: 'solana',
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    rank: 1,
  },
  {
    id: 'usdc',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    rank: 2,
  },
  {
    id: 'usdt',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    rank: 3,
  },
  {
    id: 'bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
    rank: 4,
  },
  {
    id: 'wif',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png',
    rank: 5,
  },
  {
    id: 'jto',
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    symbol: 'JTO',
    name: 'Jito Token',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.png',
    rank: 6,
  },
  {
    id: 'jup',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
    rank: 7,
  },
  {
    id: 'pyth',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png',
    rank: 8,
  },
  {
    id: 'kmno',
    mint: 'KMNo3nJsBXfcpJTVhZcXLW7RmTwTtLGVqmNmELvkaLz',
    symbol: 'KMNO',
    name: 'Kamino',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/KMNo3nJsBXfcpJTVhZcXLW7RmTwTtLGVqmNmELvkaLz/logo.png',
    rank: 9,
  },
  {
    id: 'hnt',
    mint: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknEdujVe75Xh',
    symbol: 'HNT',
    name: 'Helium Network Token',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknEdujVe75Xh/logo.png',
    rank: 10,
  },
];

// Helper functions
export function getTokenBySymbol(symbol: string): Token | undefined {
  return SUPPORTED_TOKENS.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
}

export function getTokenByMint(mint: string): Token | undefined {
  return SUPPORTED_TOKENS.find((t) => t.mint === mint);
}

export function getDefaultToken(): Token {
  return SUPPORTED_TOKENS[0]; // SOL is the default
}

export function getAllTokens(): Token[] {
  return SUPPORTED_TOKENS;
}
