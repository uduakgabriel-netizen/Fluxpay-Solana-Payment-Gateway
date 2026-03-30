import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface TokenInfo {
  symbol: string
  name: string
  mintAddress: string
  decimals: number
  isNative: boolean
}

export interface NetworkInfo {
  network: string
  rpcUrl: string
  fluxpayWallet: string
  heliusConfigured: boolean
  jupiterApiUrl: string
  supportedTokens: string[]
}

export interface WalletBalance {
  sol: number
  tokens: Array<{
    symbol: string
    mintAddress: string
    amount: number
    decimals: number
  }>
}

// ─── API Functions ──────────────────────────────────────────

export async function listTokens(): Promise<{ tokens: TokenInfo[] }> {
  const { data } = await apiClient.get<{ tokens: TokenInfo[] }>('/blockchain/tokens')
  return data
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const { data } = await apiClient.get<NetworkInfo>('/blockchain/network')
  return data
}

export async function getWalletBalance(address: string): Promise<WalletBalance> {
  const { data } = await apiClient.get<WalletBalance>(`/blockchain/balance/${address}`)
  return data
}

export async function getSwapQuote(from: string, to: string, amount: number) {
  const { data } = await apiClient.get('/blockchain/swap-quote', {
    params: { from, to, amount },
  })
  return data
}
