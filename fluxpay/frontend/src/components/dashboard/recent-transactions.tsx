import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { mockTransactions } from '@/lib/mock-data'

const statusStyles = {
  completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  failed: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-200 dark:border-red-500/20',
}

export default function RecentTransactions() {
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
            {mockTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-medium text-[#8B5CF6] cursor-pointer hover:underline">
                    {tx.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{tx.customer}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">${tx.amount}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">{tx.token}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyles[tx.status]}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</span>
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
        {mockTransactions.map((tx) => (
          <div
            key={tx.id}
            className="border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-[#8B5CF6]">{tx.id}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[tx.status]}`}>
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ${tx.amount} <span className="text-gray-400 text-xs">{tx.token}</span>
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{tx.date}</span>
            </div>
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{tx.customer}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
