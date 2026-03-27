import DashboardLayout from '@/components/dashboard/layout'
import {
  Repeat,
  Plus,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'

type SubStatus = 'active' | 'paused' | 'cancelled' | 'past_due'

interface Subscription {
  id: string
  customer: string
  email: string
  plan: string
  amount: string
  token: string
  interval: string
  status: SubStatus
  nextBilling: string
  created: string
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_001',
    customer: 'Acme Corp',
    email: 'billing@acme.com',
    plan: 'Enterprise API',
    amount: '499.00',
    token: 'USDC',
    interval: 'Monthly',
    status: 'active',
    nextBilling: 'Apr 1, 2026',
    created: 'Jan 15, 2026',
  },
  {
    id: 'sub_002',
    customer: 'DevStudio',
    email: 'pay@devstudio.io',
    plan: 'Pro Plan',
    amount: '149.00',
    token: 'USDC',
    interval: 'Monthly',
    status: 'active',
    nextBilling: 'Apr 3, 2026',
    created: 'Feb 3, 2026',
  },
  {
    id: 'sub_003',
    customer: 'BlockTech Labs',
    email: 'finance@blocktech.dev',
    plan: 'Starter',
    amount: '29.00',
    token: 'SOL',
    interval: 'Monthly',
    status: 'paused',
    nextBilling: '—',
    created: 'Dec 10, 2025',
  },
  {
    id: 'sub_004',
    customer: 'NFT Marketplace',
    email: 'admin@nftmarket.xyz',
    plan: 'Enterprise API',
    amount: '999.00',
    token: 'USDT',
    interval: 'Yearly',
    status: 'active',
    nextBilling: 'Dec 1, 2026',
    created: 'Dec 1, 2025',
  },
  {
    id: 'sub_005',
    customer: 'SolWallet Inc',
    email: 'billing@solwallet.com',
    plan: 'Pro Plan',
    amount: '149.00',
    token: 'USDC',
    interval: 'Monthly',
    status: 'past_due',
    nextBilling: 'Mar 20, 2026',
    created: 'Nov 20, 2025',
  },
  {
    id: 'sub_006',
    customer: 'DeFi Protocol',
    email: 'treasury@defi.pro',
    plan: 'Enterprise API',
    amount: '499.00',
    token: 'USDC',
    interval: 'Monthly',
    status: 'cancelled',
    nextBilling: '—',
    created: 'Oct 5, 2025',
  },
  {
    id: 'sub_007',
    customer: 'GameFi Studio',
    email: 'payments@gamefi.gg',
    plan: 'Pro Plan',
    amount: '149.00',
    token: 'BONK',
    interval: 'Monthly',
    status: 'active',
    nextBilling: 'Apr 8, 2026',
    created: 'Mar 8, 2026',
  },
]

const statusConfig: Record<SubStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10', icon: CheckCircle2 },
  paused: { label: 'Paused', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10', icon: XCircle },
  past_due: { label: 'Past Due', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10', icon: Clock },
}

const filterTabs: { label: string; value: SubStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Past Due', value: 'past_due' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<SubStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = mockSubscriptions.filter((sub) => {
    const matchesFilter = filter === 'all' || sub.status === filter
    const matchesSearch =
      sub.customer.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.plan.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeSubs = mockSubscriptions.filter((s) => s.status === 'active').length
  const mrr = mockSubscriptions
    .filter((s) => s.status === 'active' && s.interval === 'Monthly')
    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
  const totalCustomers = new Set(mockSubscriptions.map((s) => s.customer)).size

  return (
    <DashboardLayout pageTitle="Subscriptions">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage recurring payment subscriptions
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
            <Plus size={16} />
            New Subscription
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Active Subscriptions
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <Repeat size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSubs}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={12} />
              <span>+2 this month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Monthly Recurring Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <DollarSign size={16} className="text-[#8B5CF6]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={12} />
              <span>+12.5% vs last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Subscribers
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                <Users size={16} className="text-[#14B8A6]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
              <ArrowDownRight size={12} />
              <span>1 churned this month</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === tab.value
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/50 transition-all"
            />
          </div>
        </div>

        {/* Subscriptions table */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  {['Customer', 'Plan', 'Amount', 'Interval', 'Status', 'Next Billing', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 px-5 py-3"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const st = statusConfig[sub.status]
                  const StatusIcon = st.icon
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.customer}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sub.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{sub.plan}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${sub.amount}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{sub.token}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {sub.interval}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}
                        >
                          <StatusIcon size={12} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {sub.nextBilling}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {sub.status === 'active' && (
                            <button
                              title="Pause"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                            >
                              <Pause size={14} />
                            </button>
                          )}
                          {sub.status === 'paused' && (
                            <button
                              title="Resume"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"
                            >
                              <Play size={14} />
                            </button>
                          )}
                          {sub.status !== 'cancelled' && (
                            <button
                              title="Cancel"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button
                            title="More"
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Repeat size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No subscriptions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
