import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getPaymentStats, type PaymentStats } from '@/services/api/payments'

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  PENDING: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  FAILED: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-200 dark:border-red-500/20',
  CONFIRMED: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  EXPIRED: 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
}

function formatWallet(wallet: string | null): string {
  return wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : '—'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<PaymentStats['recentTransactions']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPaymentStats()
      .then((stats) => setTransactions(stats.recentTransactions))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 md:p-6 pb-0">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest payment activity</p>
        </div>
        <Link href="/dashboard/payments">
          <span className="text-xs font-semibold text-[#8B5CF6] hover:text-[#14B8A6] transition-colors cursor-pointer flex items-center gap-1">
            View all
            <ExternalLink size={12} />
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payments will appear here once created</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Payment ID</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Customer</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-[#8B5CF6] cursor-pointer hover:underline">
                        {tx.id.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{formatWallet(tx.customerWallet)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">{tx.token}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyles[tx.status] || statusStyles['PENDING']}`}>
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{timeAgo(tx.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-semibold text-[#8B5CF6] hover:text-[#14B8A6] transition-colors cursor-pointer">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium text-[#8B5CF6]">{tx.id.slice(0, 12)}...</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[tx.status] || statusStyles['PENDING']}`}>
                    {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-gray-400 text-xs">{tx.token}</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(tx.createdAt)}</span>
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{formatWallet(tx.customerWallet)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
