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
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  listSubscriptions,
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  type Subscription,
  type SubscriptionListResponse,
} from '@/services/api/subscriptions'

type SubStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PAST_DUE'

const statusConfig: Record<SubStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10', icon: CheckCircle2 },
  PAUSED: { label: 'Paused', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10', icon: Clock },
  CANCELLED: { label: 'Cancelled', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10', icon: XCircle },
  PAST_DUE: { label: 'Past Due', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10', icon: Clock },
}

const filterTabs: { label: string; value: SubStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Past Due', value: 'PAST_DUE' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<SubStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState({ activeCount: 0, mrr: 0, totalCustomers: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ customer: '', customerEmail: '', plan: '', amount: '', token: 'USDC', interval: 'MONTHLY' as 'MONTHLY' | 'YEARLY' })

  const fetchSubscriptions = async () => {
    try {
      const res = await listSubscriptions({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      })
      setSubscriptions(res.data)
      setStats(res.stats)
    } catch {
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubscriptions() }, [filter, search])

  const handleCreate = async () => {
    if (!form.customer || !form.customerEmail || !form.plan || !form.amount) return
    setCreating(true)
    try {
      await createSubscription({
        customer: form.customer,
        customerEmail: form.customerEmail,
        plan: form.plan,
        amount: parseFloat(form.amount),
        token: form.token,
        interval: form.interval,
      })
      setForm({ customer: '', customerEmail: '', plan: '', amount: '', token: 'USDC', interval: 'MONTHLY' })
      setShowCreate(false)
      fetchSubscriptions()
    } catch {
      // handle error
    } finally {
      setCreating(false)
    }
  }

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      if (action === 'pause') await pauseSubscription(id)
      else if (action === 'resume') await resumeSubscription(id)
      else await cancelSubscription(id)
      fetchSubscriptions()
    } catch {
      // handle error
    }
  }

  const formatDate = (dateStr: string) => {
    if (dateStr === '—') return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus size={16} />
            New Subscription
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Subscription</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <input type="text" placeholder="Customer name *" value={form.customer} onChange={(e) => setForm(f => ({ ...f, customer: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              <input type="email" placeholder="Customer email *" value={form.customerEmail} onChange={(e) => setForm(f => ({ ...f, customerEmail: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              <input type="text" placeholder="Plan name *" value={form.plan} onChange={(e) => setForm(f => ({ ...f, plan: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              <input type="number" placeholder="Amount *" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              <select value={form.interval} onChange={(e) => setForm(f => ({ ...f, interval: e.target.value as any }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
              <select value={form.token} onChange={(e) => setForm(f => ({ ...f, token: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none">
                <option>USDC</option>
                <option>SOL</option>
                <option>USDT</option>
              </select>
            </div>
            <button onClick={handleCreate} disabled={creating} className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Active Subscriptions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <Repeat size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.activeCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Monthly Recurring Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <DollarSign size={16} className="text-[#8B5CF6]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '...' : `$${stats.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Subscribers</span>
              <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                <Users size={16} className="text-[#14B8A6]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalCustomers}</p>
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
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-400 animate-pulse">Loading subscriptions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    {['Customer', 'Plan', 'Amount', 'Interval', 'Status', 'Next Billing', ''].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const st = statusConfig[sub.status as SubStatus] || statusConfig['ACTIVE']
                    const StatusIcon = st.icon
                    return (
                      <tr key={sub.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.customer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{sub.customerEmail}</p>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-gray-700 dark:text-gray-300">{sub.plan}</span></td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">${sub.amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">{sub.token}</span>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-gray-600 dark:text-gray-400">{sub.interval === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span></td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                            <StatusIcon size={12} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(sub.nextBillingDate)}</span></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {sub.status === 'ACTIVE' && (
                              <button title="Pause" onClick={() => handleAction(sub.id, 'pause')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"><Pause size={14} /></button>
                            )}
                            {sub.status === 'PAUSED' && (
                              <button title="Resume" onClick={() => handleAction(sub.id, 'resume')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"><Play size={14} /></button>
                            )}
                            {sub.status !== 'CANCELLED' && (
                              <button title="Cancel" onClick={() => handleAction(sub.id, 'cancel')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {subscriptions.length === 0 && (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
