import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Settlement {
  id: string
  amount: number
  fee: number
  netAmount: number
  status: string
  txHash: string | null
  paymentCount: number
  periodStart: string
  periodEnd: string
  settledAt: string | null
  createdAt: string
}

export interface SettlementListResponse {
  data: Settlement[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  summary: {
    totalSettled: number
    totalPending: number
    totalFees: number
  }
}

export interface SettlementFilters {
  page?: number
  limit?: number
  status?: string
}

// ─── API Functions ──────────────────────────────────────────

export async function listSettlements(filters: SettlementFilters = {}): Promise<SettlementListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)

  const { data } = await apiClient.get<SettlementListResponse>(`/settlements?${params.toString()}`)
  return data
}

export async function getSettlement(id: string): Promise<Settlement> {
  const { data } = await apiClient.get<Settlement>(`/settlements/${id}`)
  return data
}
