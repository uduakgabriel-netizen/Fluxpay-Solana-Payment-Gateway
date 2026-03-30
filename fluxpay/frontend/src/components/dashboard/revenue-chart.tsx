import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { getPaymentStats } from '@/services/api/payments'
import { useTheme } from '@/contexts/ThemeContext'

interface ChartDataPoint {
  date: string
  amount: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RevenueChart() {
  const { isDark } = useTheme()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPaymentStats()
      .then((stats) => {
        setChartData(
          stats.dailyRevenue.map((d) => ({
            date: formatDateLabel(d.date),
            amount: d.amount,
          }))
        )
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Revenue (USD)</span>
        </div>
      </div>

      <div className="h-64 md:h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          </div>
        ) : chartData.length === 0 || chartData.every((d) => d.amount === 0) ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No revenue data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
