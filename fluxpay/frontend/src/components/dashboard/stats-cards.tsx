import { useState, useEffect } from 'react'
import { DollarSign, ArrowUpDown, Clock, CheckCircle, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { getPaymentStats, type PaymentStats } from '@/services/api/payments'

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  ArrowUpDown,
  Clock,
  CheckCircle,
}

const themeMap: Record<string, { bg: string; iconBg: string; iconColor: string; glowColor: string }> = {
  'Total Revenue': {
    bg: 'from-blue-500/10 to-blue-600/5 dark:from-blue-500/[0.08] dark:to-blue-600/[0.03]',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    glowColor: 'from-blue-400/20',
  },
  Transactions: {
    bg: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/[0.08] dark:to-emerald-600/[0.03]',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    glowColor: 'from-emerald-400/20',
  },
  'Pending Settlements': {
    bg: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/[0.08] dark:to-amber-600/[0.03]',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    glowColor: 'from-amber-400/20',
  },
  'Success Rate': {
    bg: 'from-purple-500/10 to-purple-600/5 dark:from-purple-500/[0.08] dark:to-purple-600/[0.03]',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconColor: 'text-purple-600 dark:text-purple-400',
    glowColor: 'from-purple-400/20',
  },
}

function formatCurrency(amount: number = 0): string {
  return `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function StatsCards() {
  const [stats, setStats] = useState<PaymentStats | null>(null)

  useEffect(() => {
    getPaymentStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const cards = [
    {
      label: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '$0',
      change: stats && (stats.completedTransactions || 0) > 0 ? `${stats.completedTransactions} completed` : '—',
      trend: 'up' as const,
      icon: 'DollarSign',
    },
    {
      label: 'Transactions',
      value: stats ? (stats.totalTransactions || 0).toLocaleString() : '0',
      change: stats && (stats.completedTransactions || 0) > 0 ? `${stats.completedTransactions} completed` : '—',
      trend: 'up' as const,
      icon: 'ArrowUpDown',
    },
    {
      label: 'Pending Settlements',
      value: stats ? formatCurrency((stats as any).pendingSettlementAmount || 0) : '$0',
      change: stats && ((stats as any).pendingSettlementCount || 0) > 0 ? `${(stats as any).pendingSettlementCount} pending` : '—',
      trend: 'down' as const,
      icon: 'Clock',
    },
    {
      label: 'Success Rate',
      value: stats ? `${stats.successRate || 0}%` : '100%',
      change: stats && (stats.totalTransactions || 0) > 0 ? `${stats.totalTransactions} total` : '—',
      trend: 'up' as const,
      icon: 'CheckCircle',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      {cards.map((stat) => {
        const Icon = iconMap[stat.icon] || DollarSign
        const theme = themeMap[stat.label] || themeMap['Total Revenue']

        return (
          <div
            key={stat.label}
            className={`
              group relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.06]
              bg-gradient-to-br ${theme.bg}
              bg-white dark:bg-gray-900/50
              p-5 transition-all duration-300
              hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20
              hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-white/10
              cursor-default
            `}
          >
            {/* Subtle glow on hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.glowColor} to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} className={theme.iconColor} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.trend === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                }`}
              >
                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}
