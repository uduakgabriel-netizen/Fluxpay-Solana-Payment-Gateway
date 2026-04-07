import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Webhook, Save, Copy, Check, AlertCircle } from 'lucide-react'
import apiClient from '@/services/api/client'

const webhookEvents = [
  { id: 'payment.completed', label: 'Payment Completed', desc: 'When a payment is successfully processed' },
  { id: 'payment.failed', label: 'Payment Failed', desc: 'When a payment attempt fails' },
  { id: 'refund.created', label: 'Refund Created', desc: 'When a refund is initiated' },
  { id: 'refund.completed', label: 'Refund Completed', desc: 'When a refund is processed' },
  { id: 'settlement.completed', label: 'Settlement Completed', desc: 'When funds are settled' },
  { id: 'subscription.created', label: 'Subscription Created', desc: 'When a new subscription starts' },
]

interface WebhookConfig {
  url: string
  events: string[]
  secret: string
  active: boolean
  lastDeliveredAt?: string
}

export default function WebhooksPage() {
  const [config, setConfig] = useState<WebhookConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const fetchWebhookConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<WebhookConfig>('/webhooks')
      setConfig(response.data)
      setUrl(response.data.url)
      setSelectedEvents(response.data.events)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load webhook configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhookConfig()
  }, [fetchWebhookConfig])

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const handleSave = async () => {
    if (!url || selectedEvents.length === 0) {
      setError('Please enter a URL and select at least one event')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await apiClient.put<WebhookConfig>('/webhooks', {
        url,
        events: selectedEvents,
      })
      setConfig(response.data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save webhook configuration')
    } finally {
      setSaving(false)
    }
  }

  const copySecret = () => {
    if (config?.secret) {
      navigator.clipboard.writeText(config.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DashboardLayout pageTitle="Webhooks">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure webhooks to receive real-time payment events</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading webhook configuration...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                <button onClick={fetchWebhookConfig} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer">
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Configuration */}
            {config && (
              <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Current Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Webhook URL
                    </label>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg px-4 py-3">
                      {config.url || 'Not configured'}
                    </p>
                  </div>

                  {config.secret && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Signing Secret
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={config.secret}
                          disabled
                          className="flex-1 text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg px-4 py-3 cursor-not-allowed"
                        />
                        <button
                          onClick={copySecret}
                          className="px-4 py-3 bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.06] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Use this secret to verify webhook signatures (X-FluxPay-Signature header)
                      </p>
                    </div>
                  )}

                  {config.lastDeliveredAt && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Last Delivery
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(config.lastDeliveredAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit Configuration */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Configure Webhook</h3>
              
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check size={16} />
                    Webhook configuration saved successfully
                  </p>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-app.com/webhooks/fluxpay"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Must be a valid HTTPS endpoint that can receive POST requests
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Events to Listen
                </label>
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

              <button
                onClick={handleSave}
                disabled={saving || !url || selectedEvents.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

            {/* Documentation */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Webhook Documentation</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li>• Each webhook will be signed with your secret key in the <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">X-FluxPay-Signature</code> header</li>
                <li>• Webhooks are retried up to 5 times with exponential backoff</li>
                <li>• Your endpoint should respond with a 2xx status code within 30 seconds</li>
                <li>• Check the Webhook Logs in the dashboard to monitor delivery status</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
