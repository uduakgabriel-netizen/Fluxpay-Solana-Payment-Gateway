const TOKEN_KEY = 'sessionToken'
const MERCHANT_KEY = 'merchant'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export interface StoredMerchant {
  id: string
  walletAddress: string
  email: string
  businessName: string
  emailVerified?: boolean
  createdAt?: string
  preferredTokenMint?: string
  preferredTokenSymbol?: string
  preferredTokenDecimals?: number
  hasSelectedToken?: boolean
  preferredTokenUpdatedAt?: string
}

export function getMerchant(): StoredMerchant | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(MERCHANT_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setMerchant(merchant: StoredMerchant): void {
  localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant))
}

export function removeMerchant(): void {
  localStorage.removeItem(MERCHANT_KEY)
}

export function clearAuth(): void {
  removeToken()
  removeMerchant()
}
