import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Webhook as WebhookIcon, Settings, Copy, RefreshCw, Key } from 'lucide-react'
import { getWebhookInfo, updateWebhookUrl, rollWebhookSecret, type WebhookInfo } from '@/services/api/webhooks'

export default function WebhooksPage() {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  
  const [rollingSecret, setRollingSecret] = useState(false)
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null)

  const fetchWebhookInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWebhookInfo()
      setWebhookInfo(result)
      setUrlInput(result.webhookUrl || '')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load webhook configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhookInfo()
  }, [fetchWebhookInfo])

  const handleSaveUrl = async () => {
    setSavingUrl(true)
    try {
      await updateWebhookUrl(urlInput || null)
      setWebhookInfo(prev => prev ? { ...prev, webhookUrl: urlInput || null } : null)
      setEditingUrl(false)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update webhook URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const handleRollSecret = async () => {
    if (!confirm('Are you sure you want to roll your webhook secret? Any webhooks currently in transit might fail signature validation until you update your backend.')) return
    
    setRollingSecret(true)
    try {
      const result = await rollWebhookSecret()
      setNewlyCreatedSecret(result.fullSecret)
      setWebhookInfo(prev => prev ? { 
        ...prev, 
        secretInfo: { prefix: result.prefix, lastChars: result.lastChars, rotatedAt: result.rotatedAt } 
      } : null)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to roll webhook secret')
    } finally {
      setRollingSecret(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardLayout pageTitle="Webhooks">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive real-time notifications when events happen in your account.</p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-4 flex items-start gap-3">
          <WebhookIcon size={18} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#8B5CF6]">Event Subscriptions</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">When configured, FluxPay will automatically push the following events to your webhook URL: <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1">payment.completed</code>, <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1">payment.failed</code>, and <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1">payment.expired</code>.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading webhook configuration...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchWebhookInfo} className="mt-2 text-sm text-[#8B5CF6] hover:underline cursor-pointer">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Webhook URL Config */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={18} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Webhook URL Endpoint</h3>
              </div>
              
              {!editingUrl ? (
                <div className="space-y-4">
                  {webhookInfo?.webhookUrl ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Configured URL</p>
                      <code className="block w-full px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-gray-800 dark:text-gray-200 break-all">
                        {webhookInfo.webhookUrl}
                      </code>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-400">No webhook URL is currently configured.</p>
                    </div>
                  )}
                  <button
                    onClick={() => setEditingUrl(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-medium text-gray-900 dark:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {webhookInfo?.webhookUrl ? 'Edit Endpoint URL' : 'Add Webhook URL'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://api.yourdomain.com/webhooks/fluxpay"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">Leave empty to disable webhooks entirely.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveUrl}
                      disabled={savingUrl}
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                      {savingUrl ? 'Saving...' : 'Save Endpoint'}
                    </button>
                    <button
                      onClick={() => { setEditingUrl(false); setUrlInput(webhookInfo?.webhookUrl || ''); }}
                      className="px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Secret Config */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Signing Secret</h3>
                </div>
                <button
                  onClick={handleRollSecret}
                  disabled={rollingSecret}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-medium text-gray-900 dark:text-white rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  {rollingSecret ? 'Rolling...' : 'Roll Secret'}
                </button>
              </div>

              <div className="flex-1">
                {newlyCreatedSecret && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">New Webhook Secret Generated</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mb-2">Please copy this secret immediately. It will not be shown again.</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg flex-1 break-all">
                        {newlyCreatedSecret}
                      </code>
                      <button
                        onClick={() => { copyToClipboard(newlyCreatedSecret); }}
                        className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 transition-colors cursor-pointer"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  FluxPay uses this secret to cryptographically sign all webhook payloads it sends to your endpoint. You can use it to verify that the webhook came from us using the <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">X-FluxPay-Signature</code> header.
                </p>

                {webhookInfo?.secretInfo ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Active Secret</p>
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg">
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200 flex items-center justify-between">
                        <span>{webhookInfo.secretInfo.prefix}••••••••••••••••••••••••••••••••{webhookInfo.secretInfo.lastChars}</span>
                      </code>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                      Last rotated on {formatDate(webhookInfo.secretInfo.rotatedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <Key size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No signing secret active</p>
                    <button
                      onClick={handleRollSecret}
                      disabled={rollingSecret}
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Generate Secret
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
