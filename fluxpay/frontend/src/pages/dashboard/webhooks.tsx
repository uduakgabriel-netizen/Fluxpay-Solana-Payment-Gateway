import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Webhook, Plus, Check, Copy } from 'lucide-react'

const webhookEvents = [
  { id: 'payment.completed', label: 'Payment Completed', desc: 'When a payment is successfully processed' },
  { id: 'payment.failed', label: 'Payment Failed', desc: 'When a payment attempt fails' },
  { id: 'refund.created', label: 'Refund Created', desc: 'When a refund is initiated' },
  { id: 'refund.completed', label: 'Refund Completed', desc: 'When a refund is processed' },
  { id: 'settlement.completed', label: 'Settlement Completed', desc: 'When funds are settled' },
  { id: 'subscription.created', label: 'Subscription Created', desc: 'When a new subscription starts' },
]

const mockWebhooks = [
  { id: 1, url: 'https://myapp.com/webhooks/fluxpay', events: 3, status: 'active', lastDelivered: '2 mins ago' },
  { id: 2, url: 'https://staging.myapp.com/webhooks', events: 6, status: 'active', lastDelivered: '1 hour ago' },
]

export default function WebhooksPage() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['payment.completed', 'payment.failed'])

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  return (
    <DashboardLayout pageTitle="Webhooks">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure webhooks for real-time payment events</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
            <Plus size={16} />
            Add Endpoint
          </button>
        </div>

        {/* Existing webhooks */}
        <div className="space-y-3">
          {mockWebhooks.map((wh) => (
            <div key={wh.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Webhook size={16} className="text-[#8B5CF6]" />
                    <code className="text-sm font-mono text-gray-900 dark:text-white">{wh.url}</code>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{wh.events} events · Last delivered {wh.lastDelivered}</p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add new webhook */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Add Webhook Endpoint</h3>
          
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Endpoint URL</label>
            <input
              type="url"
              placeholder="https://your-app.com/webhooks/fluxpay"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Events to Listen</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {webhookEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => toggleEvent(evt.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedEvents.includes(evt.id)
                      ? 'border-[#8B5CF6]/40 bg-purple-50/50 dark:bg-purple-500/[0.05]'
                      : 'border-gray-100 dark:border-white/[0.04] hover:border-gray-200 dark:hover:border-white/[0.08]'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                    selectedEvents.includes(evt.id)
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]'
                      : 'border border-gray-300 dark:border-white/20'
                  }`}>
                    {selectedEvents.includes(evt.id) && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{evt.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{evt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
