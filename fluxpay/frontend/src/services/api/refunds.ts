import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Refund {
  id: string
  paymentId: string
  amount: number
  reason: string
  status: string
  txHash: string | null
  createdAt: string
  processedAt: string | null
}

export interface RefundListResponse {
  data: Refund[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface RefundFilters {
  page?: number
  limit?: number
  status?: string
}

// ─── API Functions ──────────────────────────────────────────

export async function listRefunds(filters: RefundFilters = {}): Promise<RefundListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)

  const { data } = await apiClient.get<RefundListResponse>(`/refunds?${params.toString()}`)
  return data
}

export async function requestRefund(paymentId: string, amount: number, reason: string) {
  const { data } = await apiClient.post('/refunds', { paymentId, amount, reason })
  return data
}

export async function approveRefund(refundId: string) {
  const { data } = await apiClient.post(`/refunds/${refundId}/approve`)
  return data
}

export async function rejectRefund(refundId: string) {
  const { data } = await apiClient.post(`/refunds/${refundId}/reject`)
  return data
}
