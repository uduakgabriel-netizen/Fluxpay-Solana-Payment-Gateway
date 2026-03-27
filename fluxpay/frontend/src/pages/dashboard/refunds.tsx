import DashboardLayout from '@/components/dashboard/layout'
import { ArrowLeftRight, Check, X, Search } from 'lucide-react'

const mockRefunds = [
  { id: 'ref_001', paymentId: 'pay_1a2b3c4d', amount: '$50.00', token: 'USDC', reason: 'Customer request', status: 'pending', date: 'Mar 26, 2026' },
  { id: 'ref_002', paymentId: 'pay_5e6f7g8h', amount: '$200.00', token: 'SOL', reason: 'Duplicate payment', status: 'approved', date: 'Mar 25, 2026' },
  { id: 'ref_003', paymentId: 'pay_3m4n5o6p', amount: '$1,000.00', token: 'USDC', reason: 'Service not provided', status: 'rejected', date: 'Mar 24, 2026' },
  { id: 'ref_004', paymentId: 'pay_2u3v4w5x', amount: '$75.00', token: 'USDT', reason: 'Overcharged', status: 'pending', date: 'Mar 24, 2026' },
]

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  approved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
}

export default function RefundsPage() {
  return (
    <DashboardLayout pageTitle="Refunds">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Refunds</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage refund requests</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] flex-1 max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Search refunds..." className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Refund ID</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Payment ID</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Reason</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRefunds.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#8B5CF6]">{r.id}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{r.paymentId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{r.amount} <span className="text-gray-400 text-xs">{r.token}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{r.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer">
                            <Check size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
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
