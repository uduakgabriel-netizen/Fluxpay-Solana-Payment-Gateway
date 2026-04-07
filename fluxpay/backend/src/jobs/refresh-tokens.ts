import TokenService from '../services/token.service'

let tokenRefreshJobId: NodeJS.Timeout | null = null

/**
 * Start the token refresh job
 * Runs every 12 hours to update the token cache from Jupiter
 */
export function startTokenRefreshJob() {
  console.log('⚡ Starting token refresh job...')

  // Run immediately on startup
  TokenService.refreshTokenCache().catch((error) => {
    console.error('Initial token refresh failed:', error)
  })

  // Then run every 12 hours (12 * 60 * 60 * 1000 milliseconds)
  tokenRefreshJobId = setInterval(
    () => {
      console.log('Running scheduled token refresh...')
      TokenService.refreshTokenCache().catch((error) => {
        console.error('Scheduled token refresh failed:', error)
      })
    },
    12 * 60 * 60 * 1000, // 12 hours
  )

  console.log('✓ Token refresh job started (runs every 12 hours)')
}

/**
 * Stop the token refresh job (useful for cleanup)
 */
export function stopTokenRefreshJob() {
  if (tokenRefreshJobId) {
    clearInterval(tokenRefreshJobId)
    tokenRefreshJobId = null
    console.log('Token refresh job stopped')
  }
}
