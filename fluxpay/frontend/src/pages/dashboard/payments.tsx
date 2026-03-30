import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Search, Download, CreditCard } from 'lucide-react'
import { listPayments, exportPayments, type Payment, type PaymentListResponse } from '@/services/api/payments'

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PENDING: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  FAILED: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
  EXPIRED: 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400',
  CONFIRMED: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SETTLING: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [meta, setMeta] = useState<PaymentListResponse['meta'] | null>(null)
  const [summary, setSummary] = useState<PaymentListResponse['summary'] | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listPayments({
        page: 1,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      })
      setPayments(result.data)
      setMeta(result.meta)
      setSummary(result.summary)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleExport = async () => {
    try {
      const csv = await exportPayments({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fluxpay-payments-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail
    }
  }

  const formatAmount = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatWallet = (wallet: string | null) => wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : '—'

  return (
    <DashboardLayout pageTitle="Payments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {summary ? `${summary.totalPayments} total · $${summary.totalAmount.toLocaleString()} volume` : 'Manage and track all your payment transactions'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
            <CreditCard size={16} />
            Create Payment
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] flex-1 max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'PENDING', 'COMPLETED', 'FAILED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white'
                    : 'bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer"
          >
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading payments...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={fetchPayments} className="mt-2 text-sm text-[#8B5CF6] hover:underline cursor-pointer">Retry</button>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No payments found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payments will appear here once created</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Payment ID</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Token</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-[#8B5CF6]">{p.id.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{formatWallet(p.customerWallet)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(p.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{p.token}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[p.status] || statusStyles['PENDING']}`}>
                          {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 dark:border-white/[0.04] flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {meta.page} of {meta.totalPages}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
