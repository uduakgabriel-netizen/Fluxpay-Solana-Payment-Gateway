import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { mockTokenDistribution } from '@/lib/mock-data'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        {payload[0].name}: {payload[0].value}%
      </p>
    </div>
  )
}

export default function TokenDistribution() {
  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 md:p-6 h-full">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Token Distribution</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By payment volume</p>
      </div>

      <div className="h-48 md:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockTokenDistribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {mockTokenDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {mockTokenDistribution.map((token) => (
          <div key={token.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: token.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {token.name}{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{token.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
