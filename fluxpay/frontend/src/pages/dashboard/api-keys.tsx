import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Key, Copy, RefreshCw, Trash2, ShieldCheck, AlertTriangle, Check, Webhook } from 'lucide-react'
import { getApiKeyInfo, rollApiKey, revokeApiKey, type ApiKeyInfo, type GeneratedCredentials } from '@/services/api/apiKeys'

export default function ApiKeysPage() {
  const [keyInfo, setKeyInfo] = useState<ApiKeyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [newKeyMode, setNewKeyMode] = useState<'live' | 'test'>('live')

  // Credentials modal state
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)
  const [copiedWebhookSecret, setCopiedWebhookSecret] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const fetchKeyInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getApiKeyInfo()
      setKeyInfo(result)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load API key information')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeyInfo()
  }, [fetchKeyInfo])

  const handleGenerateKeys = async () => {
    setRolling(true)
    try {
      const result = await rollApiKey(newKeyMode)
      setCredentials(result)
      setShowGenerateModal(false)
      setShowCredentialsModal(true)
      setCopiedApiKey(false)
      setCopiedWebhookSecret(false)
      setConfirmed(false)
      // Update key info display
      setKeyInfo({
        prefix: result.apiKey.prefix,
        lastChars: result.apiKey.lastChars,
        rotatedAt: result.rotatedAt,
      })
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to generate credentials')
    } finally {
      setRolling(false)
    }
  }

  const handleCloseCredentialsModal = () => {
    if (!confirmed) {
      if (!window.confirm('Are you sure? You will NOT be able to see these keys again. Make sure you have copied them.')) {
        return
      }
    }
    setShowCredentialsModal(false)
    setCredentials(null)
  }

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this API key? Your integration will immediately stop working until a new key is generated.')) return
    try {
      await revokeApiKey()
      setKeyInfo(null)
      setCredentials(null)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string, type: 'apiKey' | 'webhookSecret') => {
    navigator.clipboard.writeText(text)
    if (type === 'apiKey') {
      setCopiedApiKey(true)
      setTimeout(() => setCopiedApiKey(false), 2000)
    } else {
      setCopiedWebhookSecret(true)
      setTimeout(() => setCopiedWebhookSecret(false), 2000)
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardLayout pageTitle="API Keys">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your API key and webhook secret for FluxPay integrations.</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <RefreshCw size={16} />
            {keyInfo ? 'Regenerate Keys' : 'Generate API Keys'}
          </button>
        </div>

        {/* Security Warning */}
        <div className="bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Key size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Keep your credentials secure</p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">Never share your API key or webhook secret in publicly accessible areas. Use environment variables on your backend server.</p>
          </div>
        </div>

        {/* ── Credentials Modal (shown ONCE after generation) ── */}
        {showCredentialsModal && credentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                  <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Credentials</h3>
                  <p className="text-xs text-red-500 font-semibold">⚠️ Save these now. You will NOT see them again.</p>
                </div>
              </div>

              {/* API Key */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  <Key size={12} /> API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-lg flex-1 break-all border border-gray-200 dark:border-white/10">
                    {credentials.apiKey.fullKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(credentials.apiKey.fullKey, 'apiKey')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${copiedApiKey ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}
                  >
                    {copiedApiKey ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Use this in your <code className="text-[10px]">Authorization: Bearer {'<key>'}</code> header or in <code className="text-[10px]">{'<fluxpay-button api-key="...">'}</code></p>
              </div>

              {/* Webhook Secret */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  <Webhook size={12} /> Webhook Secret
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-lg flex-1 break-all border border-gray-200 dark:border-white/10">
                    {credentials.webhookSecret.fullSecret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(credentials.webhookSecret.fullSecret, 'webhookSecret')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${copiedWebhookSecret ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}
                  >
                    {copiedWebhookSecret ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Use this in your <code className="text-[10px]">FLUXPAY_WEBHOOK_SECRET</code> env variable to verify incoming webhooks.</p>
              </div>

              {/* .env example */}
              <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg p-3 mb-5">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Add to your .env file:</p>
                <code className="text-[11px] font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {`FLUXPAY_API_KEY="${credentials.apiKey.fullKey}"\nFLUXPAY_WEBHOOK_SECRET="${credentials.webhookSecret.fullSecret}"`}
                </code>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  I have saved my API key and webhook secret in a secure location. I understand I will not be able to view them again.
                </span>
              </label>

              {/* Close button */}
              <button
                onClick={handleCloseCredentialsModal}
                disabled={!confirmed}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${confirmed ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white hover:opacity-90 shadow-lg shadow-purple-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'}`}
              >
                {confirmed ? 'Done — Close this dialog' : 'Check the box above to continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── Generate/Roll Key Confirmation ── */}
        {showGenerateModal && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {keyInfo ? 'Regenerate Credentials' : 'Generate Credentials'}
            </h3>
            <p className="text-xs text-gray-500 mb-1">
              {keyInfo ? 'This will immediately invalidate your current API key and webhook secret. Make sure to update your integration.' : 'Generate your API key and webhook secret to start accepting payments.'}
            </p>
            {keyInfo && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/[0.06] border border-red-200 dark:border-red-500/20 rounded-lg p-2.5 mb-3">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">Your current integration will break until you update your keys.</p>
              </div>
            )}
            <div className="flex gap-3">
              <select
                value={newKeyMode}
                onChange={(e) => setNewKeyMode(e.target.value as 'live' | 'test')}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors"
              >
                <option value="live">Live Mode</option>
                <option value="test">Test Mode</option>
              </select>
              <button
                onClick={handleGenerateKeys}
                disabled={rolling}
                className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {rolling ? 'Generating...' : 'Generate Keys'}
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Keys Display ── */}
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading API keys...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchKeyInfo} className="mt-2 text-sm text-[#8B5CF6] hover:underline cursor-pointer">Retry</button>
          </div>
        ) : !keyInfo ? (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 text-center">
            <Key size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No credentials generated yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Generate API Keys" above to create your API key and webhook secret.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">API Key</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
                    {keyInfo.prefix}••••••••••••••••{keyInfo.lastChars}
                  </code>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Last rotated {formatDate(keyInfo.rotatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRevoke}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  Revoke
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
