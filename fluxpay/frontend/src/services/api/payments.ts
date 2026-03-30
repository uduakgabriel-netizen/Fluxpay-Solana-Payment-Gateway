import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Payment {
  id: string
  amount: number
  token: string
  status: string
  customerWallet: string | null
  customerEmail: string | null
  txHash: string | null
  createdAt: string
  completedAt: string | null
}

export interface PaymentListResponse {
  data: Payment[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  summary: {
    totalAmount: number
    totalPayments: number
    averageAmount: number
  }
}

export interface PaymentDetail {
  id: string
  amount: number
  token: string
  status: string
  customerWallet: string | null
  customerEmail: string | null
  receivingAddress: string
  txHash: string | null
  metadata: any
  swapDetails: any
  timeline: { status: string; timestamp: string }[]
  refunds: any[]
  confirmedAt: string | null
  createdAt: string
  completedAt: string | null
  expiresAt: string
}

export interface CreatePaymentInput {
  amount: number
  token: string
  customerEmail?: string
  customerWallet?: string
  metadata?: Record<string, any>
}

export interface PaymentFilters {
  page?: number
  limit?: number
  status?: string
  token?: string
  fromDate?: string
  toDate?: string
  search?: string
}

// ─── API Functions ──────────────────────────────────────────

export async function listPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)
  if (filters.token) params.set('token', filters.token)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  if (filters.search) params.set('search', filters.search)

  const { data } = await apiClient.get<PaymentListResponse>(`/payments?${params.toString()}`)
  return data
}

export async function getPayment(id: string): Promise<PaymentDetail> {
  const { data } = await apiClient.get<PaymentDetail>(`/payments/${id}`)
  return data
}

export async function createPayment(input: CreatePaymentInput) {
  const { data } = await apiClient.post('/payments', input)
  return data
}

export async function exportPayments(filters: Omit<PaymentFilters, 'page' | 'limit' | 'search'>): Promise<string> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.token) params.set('token', filters.token)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)

  const { data } = await apiClient.get(`/payments/export?${params.toString()}`, {
    responseType: 'text',
  })
  return data
}

// ─── Dashboard Stats ────────────────────────────────────────

export interface PaymentStats {
  totalRevenue: number
  totalTransactions: number
  completedTransactions: number
  pendingSettlementAmount: number
  pendingSettlementCount: number
  successRate: number
  tokenDistribution: Array<{
    token: string
    amount: number
    count: number
    percentage: number
  }>
  dailyRevenue: Array<{
    date: string
    amount: number
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    token: string
    status: string
    customerWallet: string | null
    createdAt: string
  }>
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const { data } = await apiClient.get<PaymentStats>('/payments/stats')
  return data
}

