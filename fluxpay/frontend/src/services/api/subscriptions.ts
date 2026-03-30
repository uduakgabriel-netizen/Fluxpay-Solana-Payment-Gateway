import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Subscription {
  id: string
  customer: string
  customerEmail: string
  plan: string
  amount: number
  token: string
  interval: string
  status: string
  nextBillingDate: string
  lastBilledAt: string | null
  cancelledAt: string | null
  createdAt: string
}

export interface SubscriptionListResponse {
  data: Subscription[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  stats: {
    activeCount: number
    mrr: number
    totalCustomers: number
  }
}

export interface SubscriptionFilters {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface CreateSubscriptionInput {
  customer: string
  customerEmail: string
  plan: string
  amount: number
  token?: string
  interval?: 'MONTHLY' | 'YEARLY'
}

// ─── API Functions ──────────────────────────────────────────

export async function listSubscriptions(filters: SubscriptionFilters = {}): Promise<SubscriptionListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  const { data } = await apiClient.get<SubscriptionListResponse>(`/subscriptions?${params.toString()}`)
  return data
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const { data } = await apiClient.post('/subscriptions', input)
  return data
}

export async function pauseSubscription(id: string) {
  const { data } = await apiClient.patch(`/subscriptions/${id}/pause`)
  return data
}

export async function resumeSubscription(id: string) {
  const { data } = await apiClient.patch(`/subscriptions/${id}/resume`)
  return data
}

export async function cancelSubscription(id: string) {
  const { data } = await apiClient.patch(`/subscriptions/${id}/cancel`)
  return data
}
