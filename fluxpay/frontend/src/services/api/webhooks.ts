import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Webhook {
  id: string
  url: string
  events: string[]
  status: string
  secret: string
  lastDeliveredAt: string | null
  createdAt: string
}

export interface WebhookListResponse {
  data: Webhook[]
}

export interface CreateWebhookInput {
  url: string
  events: string[]
}

// ─── API Functions ──────────────────────────────────────────

export async function listWebhooks(): Promise<WebhookListResponse> {
  const { data } = await apiClient.get<WebhookListResponse>('/webhooks')
  return data
}

export async function createWebhook(input: CreateWebhookInput): Promise<Webhook> {
  const { data } = await apiClient.post<Webhook>('/webhooks', input)
  return data
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await apiClient.delete(`/webhooks/${webhookId}`)
}

export async function testWebhook(webhookId: string): Promise<{ success: boolean }> {
  const { data } = await apiClient.post<{ success: boolean }>(`/webhooks/${webhookId}/test`)
  return data
}
