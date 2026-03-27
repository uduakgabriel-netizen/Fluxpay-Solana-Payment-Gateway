import DashboardLayout from '@/components/dashboard/layout'
import { Banknote, Search } from 'lucide-react'

const mockSettlements = [
  { id: 'stl_001', amount: '$4,200.00', txCount: 18, status: 'completed', settledAt: 'Mar 26, 2026', period: 'Mar 20-26' },
  { id: 'stl_002', amount: '$3,850.00', txCount: 15, status: 'processing', settledAt: 'Pending', period: 'Mar 13-19' },
  { id: 'stl_003', amount: '$5,100.00', txCount: 22, status: 'completed', settledAt: 'Mar 19, 2026', period: 'Mar 6-12' },
  { id: 'stl_004', amount: '$2,900.00', txCount: 12, status: 'completed', settledAt: 'Mar 12, 2026', period: 'Feb 27-Mar 5' },
]

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  processing: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

export default function SettlementsPage() {
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$16,050</p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Settlement</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">$3,850</p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Settlement</p>
            <p className="text-2xl font-bold text-[#8B5CF6]">Mar 27</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Batch ID</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Period</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transactions</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Settled At</th>
                </tr>
              </thead>
              <tbody>
                {mockSettlements.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#8B5CF6]">{s.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{s.period}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{s.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{s.txCount} txns</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[s.status]}`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{s.settledAt}</td>
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
