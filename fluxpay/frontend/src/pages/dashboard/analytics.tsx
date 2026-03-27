import DashboardLayout from '@/components/dashboard/layout'
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deep insights into your payment performance</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue (30d)', value: '$45,200', icon: DollarSign, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Volume Growth', value: '+23%', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Avg Transaction', value: '$194', icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            { label: 'Total Volume', value: '$128K', icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
              <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                <card.icon size={18} className={card.color} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Chart placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/[0.06] rounded-xl">
              <div className="text-center">
                <BarChart3 size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Revenue chart will appear here</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Connect to API for live data</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Payment Volume</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/[0.06] rounded-xl">
              <div className="text-center">
                <Activity size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Volume chart will appear here</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Connect to API for live data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token breakdown */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Token Distribution Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { token: 'USDC', pct: '45%', vol: '$57,600', color: 'from-blue-500 to-blue-600' },
              { token: 'SOL', pct: '30%', vol: '$38,400', color: 'from-purple-500 to-purple-600' },
              { token: 'USDT', pct: '15%', vol: '$19,200', color: 'from-teal-500 to-teal-600' },
              { token: 'BONK', pct: '10%', vol: '$12,800', color: 'from-amber-500 to-amber-600' },
            ].map((t) => (
              <div key={t.token} className="border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 text-center">
                <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} items-center justify-center mb-3`}>
                  <span className="text-white text-xs font-bold">{t.token.charAt(0)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.token}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{t.pct}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.vol}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
