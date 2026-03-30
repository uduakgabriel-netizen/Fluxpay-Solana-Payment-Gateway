import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  status: string
  mode: 'LIVE' | 'TEST'
  lastUsedAt: string | null
  createdAt: string
}

export interface ApiKeyListResponse {
  data: ApiKey[]
}

// ─── API Functions ──────────────────────────────────────────

export async function listApiKeys(): Promise<ApiKeyListResponse> {
  const { data } = await apiClient.get<ApiKeyListResponse>('/api-keys')
  return data
}

export async function createApiKey(name: string, mode: 'LIVE' | 'TEST' = 'LIVE'): Promise<{ key: string; id: string }> {
  const { data } = await apiClient.post('/api-keys', { name, mode })
  return data
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await apiClient.delete(`/api-keys/${keyId}`)
}
