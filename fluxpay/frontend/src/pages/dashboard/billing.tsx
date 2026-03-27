import DashboardLayout from '@/components/dashboard/layout'
import { Receipt, Check, Zap, Building2 } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    features: ['USDC, SOL, USDT', 'Up to $10K volume', '1% fee', 'Basic API'],
    current: false,
    gradient: '',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    features: ['All 10 SPL tokens', 'Up to $500K volume', '0.5% fee', 'Full API + Webhooks', 'Analytics', 'Priority support'],
    current: true,
    gradient: 'from-[#8B5CF6] to-[#14B8A6]',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['All SPL + custom', 'Unlimited volume', 'Custom fee', 'Dedicated support', 'SLA guarantee'],
    current: false,
    gradient: '',
  },
]

export default function BillingPage() {
  return (
    <DashboardLayout pageTitle="Billing">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your subscription plan and billing</p>
        </div>

        {/* Current plan */}
        <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#14B8A6]/10 dark:from-[#8B5CF6]/[0.06] dark:to-[#14B8A6]/[0.06] border border-[#8B5CF6]/20 dark:border-[#8B5CF6]/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className="text-[#8B5CF6]" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pro Plan</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6]">CURRENT</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next billing date: April 1, 2026</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$49<span className="text-sm font-normal text-gray-500">/mo</span></p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-gray-900/50 border rounded-xl p-6 transition-all ${
                plan.current
                  ? 'border-[#8B5CF6]/40 shadow-lg shadow-purple-500/10'
                  : 'border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10'
              }`}
            >
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Current Plan
                </div>
              )}
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {plan.price}<span className="text-sm font-normal text-gray-500">{plan.period}</span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check size={14} className="text-[#14B8A6] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  plan.current
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 cursor-default'
                    : 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white hover:opacity-90'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
