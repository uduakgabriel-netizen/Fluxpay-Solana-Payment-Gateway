export interface Merchant {
  id: string
  wallet_address: string
  passkey_hash?: string
  preferred_token: string
  settlement_wallet: string
  subscription_plan: 'starter' | 'pro' | 'enterprise'
  created_at: Date
}

export interface AuthResponse {
  token: string
  merchant: Merchant
  isNewUser: boolean
}

export interface PasskeyLoginRequest {
  wallet_address: string
  passkey: string
}

export interface SignatureVerificationRequest {
  wallet_address: string
  signature: string
  message: string
}