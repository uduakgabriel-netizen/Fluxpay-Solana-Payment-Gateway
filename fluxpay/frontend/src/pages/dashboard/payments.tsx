import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Search, Filter, Download, CreditCard, ArrowUpDown } from 'lucide-react'

const mockPayments = [
  { id: 'pay_1a2b3c4d', customer: '9Bv8...whFB', amount: '$250.00', token: 'USDC', status: 'completed', date: 'Mar 26, 2026' },
  { id: 'pay_5e6f7g8h', customer: '4Kx2...mN9P', amount: '$1,200.00', token: 'SOL', status: 'completed', date: 'Mar 26, 2026' },
  { id: 'pay_9i0j1k2l', customer: '7Ht5...pQ3R', amount: '$89.50', token: 'USDT', status: 'pending', date: 'Mar 25, 2026' },
  { id: 'pay_3m4n5o6p', customer: '2Ws6...vX8Y', amount: '$5,000.00', token: 'USDC', status: 'completed', date: 'Mar 25, 2026' },
  { id: 'pay_7q8r9s0t', customer: '6Lm1...kJ4H', amount: '$450.00', token: 'BONK', status: 'failed', date: 'Mar 24, 2026' },
  { id: 'pay_2u3v4w5x', customer: '8Pn3...tR7S', amount: '$320.00', token: 'SOL', status: 'completed', date: 'Mar 24, 2026' },
  { id: 'pay_6y7z8a9b', customer: '1Qo4...uS8T', amount: '$780.00', token: 'USDC', status: 'completed', date: 'Mar 23, 2026' },
  { id: 'pay_0c1d2e3f', customer: '5Vr7...wU0V', amount: '$150.00', token: 'USDT', status: 'pending', date: 'Mar 23, 2026' },
]

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  failed: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all' ? mockPayments : mockPayments.filter(p => p.status === statusFilter)

  return (
    <DashboardLayout pageTitle="Payments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all your payment transactions</p>
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
            <input type="text" placeholder="Search payments..." className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'completed', 'pending', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white'
                    : 'bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer">
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
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
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#8B5CF6]">{p.id}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{p.customer}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{p.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{p.token}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[p.status]}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
