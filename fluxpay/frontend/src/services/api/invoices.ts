import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface Invoice {
  id: string
  invoiceNumber: string
  customer: string
  customerEmail: string | null
  amount: number
  token: string
  description: string | null
  status: string
  dueDate: string
  paidAt: string | null
  sentAt: string | null
  createdAt: string
}

export interface InvoiceListResponse {
  data: Invoice[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  summary: {
    totalPaid: number
    totalPending: number
    totalOverdue: number
  }
}

export interface InvoiceFilters {
  page?: number
  limit?: number
  status?: string
}

export interface CreateInvoiceInput {
  customer: string
  customerEmail?: string
  amount: number
  token?: string
  description?: string
  dueDate: string
}

// ─── API Functions ──────────────────────────────────────────

export async function listInvoices(filters: InvoiceFilters = {}): Promise<InvoiceListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)

  const { data } = await apiClient.get<InvoiceListResponse>(`/invoices?${params.toString()}`)
  return data
}

export async function createInvoice(input: CreateInvoiceInput) {
  const { data } = await apiClient.post('/invoices', input)
  return data
}

export async function updateInvoiceStatus(id: string, status: string) {
  const { data } = await apiClient.patch(`/invoices/${id}/status`, { status })
  return data
}

export async function deleteInvoice(id: string) {
  const { data } = await apiClient.delete(`/invoices/${id}`)
  return data
}
