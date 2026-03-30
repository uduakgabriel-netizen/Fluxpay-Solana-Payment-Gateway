import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { listSettlements, type Settlement, type SettlementListResponse } from '@/services/api/settlements'

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  PROCESSING: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  PENDING: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [summary, setSummary] = useState<SettlementListResponse['summary'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettlements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listSettlements({ page: 1, limit: 20 })
      setSettlements(result.data)
      setSummary(result.summary)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load settlements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettlements()
  }, [fetchSettlements])

  const formatAmount = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'

  return (
    <DashboardLayout pageTitle="Settlements">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settlements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track settlement batches and payouts</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Settled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary ? formatAmount(summary.totalSettled) : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Settlement</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary ? formatAmount(summary.totalPending) : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fees</p>
            <p className="text-2xl font-bold text-[#8B5CF6]">
              {summary ? formatAmount(summary.totalFees) : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading settlements...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={fetchSettlements} className="mt-2 text-sm text-[#8B5CF6] hover:underline cursor-pointer">Retry</button>
            </div>
          ) : settlements.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No settlements yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Settlements are created automatically when payments are processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Batch ID</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Period</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Payments</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Settled At</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-[#8B5CF6]">{s.id.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(s.netAmount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{s.paymentCount} txns</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[s.status] || statusStyles['PENDING']}`}>
                          {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(s.settledAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
