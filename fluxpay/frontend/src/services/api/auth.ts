import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface NonceResponse {
  nonce: string
  expiresAt: string
}

export interface AuthResponse {
  sessionToken: string
  merchant: {
    id: string
    walletAddress: string
    email: string
    businessName: string
    preferredTokenMint?: string
    preferredTokenSymbol?: string
    preferredTokenDecimals?: number
    hasSelectedToken?: boolean
    preferredTokenUpdatedAt?: string
  }
}

export interface MeResponse {
  id: string
  walletAddress: string
  email: string
  businessName: string
  emailVerified: boolean
  createdAt: string
  preferredTokenMint?: string
  preferredTokenSymbol?: string
  preferredTokenDecimals?: number
  hasSelectedToken?: boolean
  preferredTokenUpdatedAt?: string
}

export interface SignupData {
  walletAddress: string
  email: string
  businessName: string
  password?: string
  message: string
  signature: string
  preferredTokenSymbol: string
}

export interface VerifyData {
  walletAddress: string
  message: string
  signature: string
}

// ─── API Functions ──────────────────────────────────────────

export async function requestNonce(walletAddress: string): Promise<NonceResponse> {
  const { data } = await apiClient.post<NonceResponse>('/auth/nonce', { walletAddress })
  return data
}

export async function verifyWallet(payload: VerifyData): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/verify', payload)
  return data
}

export async function signup(payload: SignupData): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me')
  return data
}

export async function updateProfile(payload: { businessName?: string; email?: string }): Promise<MeResponse> {
  const { data } = await apiClient.patch<MeResponse>('/auth/profile', payload)
  return data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
