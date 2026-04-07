import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hardcoded fallback tokens in case Jupiter API fails
const FALLBACK_TOKENS = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    name: 'Solana',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.svg',
    rank: 1,
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.svg',
    rank: 2,
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    rank: 3,
  },
  {
    symbol: 'BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    decimals: 5,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.svg',
    rank: 4,
  },
  {
    symbol: 'WIF',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    name: 'Dog with hat',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.svg',
    rank: 5,
  },
  {
    symbol: 'JTO',
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    name: 'Jito Token',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.svg',
    rank: 6,
  },
  {
    symbol: 'JUP',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    name: 'Jupiter',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.svg',
    rank: 7,
  },
  {
    symbol: 'PYTH',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    name: 'Pyth Network',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.svg',
    rank: 8,
  },
  {
    symbol: 'KMNO',
    mint: 'KMNo3nJsBXfcpJTVhZcXLW7RmTwTtLGVqmNmELvkaLz',
    name: 'Kamino',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/KMNo3nJsBXfcpJTVhZcXLW7RmTwTtLGVqmNmELvkaLz/logo.svg',
    rank: 9,
  },
  {
    symbol: 'HNT',
    mint: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknEdujVe75Xh',
    name: 'Helium Network Token',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknEdujVe75Xh/logo.svg',
    rank: 10,
  },
]

export class TokenService {
  /**
   * Get all supported tokens from cache
   */
  static async getSupportedTokens() {
    try {
      const tokens = await (prisma as any).supportedToken.findMany({
        where: { isActive: true },
        orderBy: { rank: 'asc' },
      })

      if (tokens.length === 0) {
        console.warn('No tokens in cache, using fallback list')
        return FALLBACK_TOKENS
      }

      return tokens
    } catch (error) {
      console.error('Error fetching supported tokens:', error)
      return FALLBACK_TOKENS
    }
  }

  /**
   * Get a specific token by mint address
   */
  static async getTokenByMint(mint: string) {
    try {
      const token = await (prisma as any).supportedToken.findUnique({
        where: { mint },
      })
      return token
    } catch (error) {
      console.error('Error fetching token by mint:', error)
      const fallback = FALLBACK_TOKENS.find((t) => t.mint === mint)
      return fallback || null
    }
  }

  /**
   * Get a specific token by symbol
   */
  static async getTokenBySymbol(symbol: string) {
    try {
      const token = await (prisma as any).supportedToken.findFirst({
        where: { symbol: symbol.toUpperCase() },
      })
      return token
    } catch (error) {
      console.error('Error fetching token by symbol:', error)
      const fallback = FALLBACK_TOKENS.find((t) => t.symbol === symbol.toUpperCase())
      return fallback || null
    }
  }

  /**
   * Refresh token cache from Jupiter API
   * Fetches top tokens and updates database
   */
  static async refreshTokenCache() {
    try {
      console.log('Starting token cache refresh from Jupiter...')

      // Fetch token list from Jupiter
      const fetchResponse = await Promise.race([
        fetch('https://token.jup.ag/all'),
        new Promise<globalThis.Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        ),
      ]) as globalThis.Response

      if (!fetchResponse.ok) {
        throw new Error(`Jupiter API error: ${fetchResponse.status} ${fetchResponse.statusText}`)
      }

      const jupiterTokens = (await fetchResponse.json()) as Array<any>

      if (!Array.isArray(jupiterTokens)) {
        throw new Error('Invalid response format from Jupiter')
      }

      // Sort by some heuristic (for now, we'll use the order from Jupiter)
      // You can enhance this to fetch trading volume from Birdeye API or similar
      const topTokens = jupiterTokens
        .filter((t) => FALLBACK_TOKENS.some((ft) => ft.mint === (t.address || t.mint)))
        .slice(0, 10)

      // If Jupiter doesn't have our preferred tokens, use fallback
      let tokensToUpdate = topTokens.length > 0 ? topTokens : FALLBACK_TOKENS

      // Map to our schema and assign rank
      const tokensWithRank = tokensToUpdate.map((token, index) => ({
        mint: (token as any).address || (token as any).mint || '',
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoUrl: (token as any).logoURI || (token as any).logoUrl || '',
        rank: index + 1,
        isActive: true,
      }))

      // Upsert tokens into database
      for (const token of tokensWithRank) {
        await (prisma as any).supportedToken.upsert({
          where: { mint: token.mint },
          update: {
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoUrl: token.logoUrl,
            rank: token.rank,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoUrl: token.logoUrl,
            rank: token.rank,
            isActive: true,
          },
        })
      }

      console.log(`✓ Successfully updated ${tokensWithRank.length} tokens in cache`)
      return tokensWithRank
    } catch (error) {
      console.error('Error refreshing token cache from Jupiter:', error)
      console.log('Using fallback token list')

      // Fallback: ensure fallback tokens exist in database
      for (const token of FALLBACK_TOKENS) {
        await (prisma as any).supportedToken.upsert({
          where: { mint: token.mint },
          update: {
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoUrl: token.logoUrl,
            rank: token.rank,
            isActive: true,
          },
        })
      }

      return FALLBACK_TOKENS
    }
  }

  /**
   * Validate a token mint address exists in supported tokens
   */
  static async isTokenSupported(mint: string): Promise<boolean> {
    const token = await this.getTokenByMint(mint)
    return token ? true : false
  }
}

export default TokenService
