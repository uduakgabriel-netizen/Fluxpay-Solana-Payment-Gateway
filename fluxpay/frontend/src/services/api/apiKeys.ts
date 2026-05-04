import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface ApiKeyInfo {
  prefix: string
  lastChars: string
  rotatedAt: string
}

export interface GeneratedCredentials {
  apiKey: {
    fullKey: string
    prefix: string
    lastChars: string
  }
  webhookSecret: {
    fullSecret: string
    prefix: string
    lastChars: string
  }
  rotatedAt: string
  warning: string
}

// ─── API Functions ──────────────────────────────────────────

export async function getApiKeyInfo(): Promise<ApiKeyInfo | null> {
  const { data } = await apiClient.get<{ apiKey: ApiKeyInfo | null }>('/merchants/api-key')
  return data.apiKey
}

/**
 * Generate BOTH API key + webhook secret together.
 * Returns plaintext credentials exactly ONCE.
 */
export async function rollApiKey(mode: 'live' | 'test' = 'live'): Promise<GeneratedCredentials> {
  const { data } = await apiClient.post<GeneratedCredentials>('/merchants/api-key/roll', { mode })
  return data
}

export async function revokeApiKey(): Promise<void> {
  await apiClient.post('/merchants/api-key/revoke')
}
