import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Key, Eye, EyeOff, Copy, Plus, RotateCw } from 'lucide-react'

const mockKeys = [
  { id: 1, name: 'Production Key', key: 'sk_live_4eC39HqLyjW...', created: 'Mar 10, 2026', lastUsed: '2 mins ago', status: 'active' },
  { id: 2, name: 'Test Key', key: 'sk_test_51MqLyjW...', created: 'Feb 20, 2026', lastUsed: '1 hour ago', status: 'active' },
  { id: 3, name: 'Legacy Key', key: 'sk_live_9xR27hNpQ...', created: 'Jan 5, 2026', lastUsed: 'Mar 1, 2026', status: 'revoked' },
]

export default function ApiKeysPage() {
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({})

  return (
    <DashboardLayout pageTitle="API Keys">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your API keys for payment integration</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
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

        {/* Keys list */}
        <div className="space-y-3">
          {mockKeys.map((k) => (
            <div key={k.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{k.name}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      k.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                    }`}>
                      {k.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      {showKeys[k.id] ? k.key.replace('...', 'DmK8xPqR2sT') : k.key}
                    </code>
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer"
                    >
                      {showKeys[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Created {k.created} · Last used {k.lastUsed}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer">
                    <RotateCw size={12} />
                    Rotate
                  </button>
                  {k.status === 'active' && (
                    <button className="px-3 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
