import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/dashboard/layout'
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { getPaymentStats, type PaymentStats } from '@/services/api/payments'
import { useTheme } from '@/contexts/ThemeContext'

const AreaChartComponent = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } = mod
      return function Chart({ data, isDark }: { data: { date: string; amount: number }[]; isDark: boolean }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="analyticsLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} width={45} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">${payload[0].value?.toLocaleString()}</p>
                    </div>
                  ) : null
                }
              />
              <Area type="monotone" dataKey="amount" stroke="url(#analyticsLine)" strokeWidth={2.5} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )
      }
    }),
  { ssr: false }
)

const BarChartComponent = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } = mod
      return function Chart({ data, isDark }: { data: { date: string; count: number }[]; isDark: boolean }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{payload[0].value} txns</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="count" fill="url(#analyticsLine)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    }),
  { ssr: false }
)

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AnalyticsPage() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPaymentStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const revenueData = stats?.dailyRevenue.map((d) => ({ date: formatDateLabel(d.date), amount: d.amount })) || []
  const volumeData = stats?.dailyRevenue.map((d) => ({ date: formatDateLabel(d.date), count: Math.round(d.amount / (stats?.totalTransactions > 0 ? stats.totalRevenue / stats.totalTransactions : 100)) })) || []

  const summaryCards = [
    { label: 'Revenue (30d)', value: stats ? formatCurrency(stats.totalRevenue) : '$0', icon: DollarSign, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Volume Growth', value: stats && stats.totalTransactions > 0 ? `${stats.totalTransactions} txns` : '—', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Avg Transaction', value: stats && stats.totalTransactions > 0 ? formatCurrency(stats.totalRevenue / stats.totalTransactions) : '$0', icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '100%', icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ]

  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deep insights into your payment performance</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
              <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                <card.icon size={18} className={card.color} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? <span className="animate-pulse">...</span> : card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                </div>
              ) : revenueData.length === 0 || revenueData.every(d => d.amount === 0) ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No revenue data yet</p>
                  </div>
                </div>
              ) : (
                <AreaChartComponent data={revenueData} isDark={isDark} />
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Payment Volume</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                </div>
              ) : volumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Activity size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No volume data yet</p>
                  </div>
                </div>
              ) : (
                <BarChartComponent data={volumeData} isDark={isDark} />
              )}
            </div>
          </div>
        </div>

        {/* Token breakdown — live from API */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Token Distribution Breakdown</h3>
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
            </div>
          ) : !stats?.tokenDistribution?.length ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No token data yet — process payments to see breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.tokenDistribution.map((t) => {
                const colors: Record<string, string> = {
                  SOL: 'from-purple-500 to-purple-600',
                  USDC: 'from-blue-500 to-blue-600',
                  USDT: 'from-teal-500 to-teal-600',
                  BONK: 'from-amber-500 to-amber-600',
                  JUP: 'from-indigo-500 to-indigo-600',
                }
                return (
                  <div key={t.token} className="border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 text-center">
                    <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${colors[t.token] || 'from-gray-500 to-gray-600'} items-center justify-center mb-3`}>
                      <span className="text-white text-xs font-bold">{t.token.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.token}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{t.percentage}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(t.amount)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
