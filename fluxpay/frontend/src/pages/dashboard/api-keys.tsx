import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Key, Eye, EyeOff, Copy, Plus, Trash2 } from 'lucide-react'
import { listApiKeys, createApiKey, revokeApiKey, type ApiKey } from '@/services/api/apiKeys'

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyMode, setNewKeyMode] = useState<'LIVE' | 'TEST'>('LIVE')
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listApiKeys()
      setKeys(result.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleCreate = async () => {
    if (!newKeyName) return
    setCreating(true)
    try {
      const result = await createApiKey(newKeyName, newKeyMode)
      setNewlyCreatedKey(result.key)
      setNewKeyName('')
      setNewKeyMode('LIVE')
      await fetchKeys()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return
    try {
      await revokeApiKey(keyId)
      await fetchKeys()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <DashboardLayout pageTitle="API Keys">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your API keys for payment integration</p>
          </div>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus size={16} />
            Create New Key
          </button>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Key size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Keep your API keys secure</p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">Never share your secret keys in publicly accessible areas. Use environment variables to store them.</p>
          </div>
        </div>

        {/* Newly created key */}
        {newlyCreatedKey && (
          <div className="bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">New API Key Created</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mb-2">Copy this key now. You won't be able to see it again.</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg flex-1 break-all">{newlyCreatedKey}</code>
              <button
                onClick={() => { copyToClipboard(newlyCreatedKey); setNewlyCreatedKey(null) }}
                className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 transition-colors cursor-pointer"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Create key modal */}
        {showNewKeyModal && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Create New API Key</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., Production)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
              <select
                value={newKeyMode}
                onChange={(e) => setNewKeyMode(e.target.value as 'LIVE' | 'TEST')}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors"
              >
                <option value="LIVE">Live Mode</option>
                <option value="TEST">Test Mode</option>
              </select>
              <button
                onClick={handleCreate}
                disabled={creating || !newKeyName}
                className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading API keys...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchKeys} className="mt-2 text-sm text-[#8B5CF6] hover:underline cursor-pointer">Retry</button>
          </div>
        ) : keys.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 text-center">
            <Key size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No API keys yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first API key to start integrating payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{k.name}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        k.mode === 'LIVE' 
                          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {k.mode}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        k.status === 'ACTIVE' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                      }`}>
                        {k.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        {showKeys[k.id] ? k.key : `${k.prefix}...`}
                      </code>
                      <button
                        onClick={() => setShowKeys(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer"
                      >
                        {showKeys[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(k.key)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Created {formatDate(k.createdAt)}
                      {k.lastUsedAt && ` · Last used ${formatDate(k.lastUsedAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {k.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
