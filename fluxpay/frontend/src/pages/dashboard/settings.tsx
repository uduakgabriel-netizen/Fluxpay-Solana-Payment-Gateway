import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { User, Bell, Shield, DollarSign } from 'lucide-react'
import TokenSelector from '@/components/token-selector/TokenSelector'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/api/auth'
import apiClient from '@/services/api/client'
import { SUPPORTED_TOKENS, type Token, getTokenByMint } from '@/config/tokens'

export default function SettingsPage() {
  const { merchant, refreshMerchant } = useAuth()
  const [businessName, setBusinessName] = useState(merchant?.businessName || '')
  const [email, setEmail] = useState(merchant?.email || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  
  // Token preference state
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [savingToken, setSavingToken] = useState(false)
  const [tokenMsg, setTokenMsg] = useState('')

  // Notification toggle states
  const [notifs, setNotifs] = useState({
    paymentReceived: true,
    settlementCompleted: true,
    refundRequests: false,
    weeklyReports: true,
  })

  useEffect(() => {
    // Load current token preference
    if (merchant?.preferredTokenMint) {
      const token = getTokenByMint(merchant.preferredTokenMint);
      if (token) {
        setCurrentToken(token);
        setSelectedToken(token);
      }
    }
  }, [merchant])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await updateProfile({ businessName, email })
      await refreshMerchant()
      setSaveMsg('Profile updated successfully!')
    } catch (err: any) {
      setSaveMsg(err?.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleSaveToken = async () => {
    if (!selectedToken) {
      setTokenMsg('Please select a token')
      return
    }

    setSavingToken(true)
    setTokenMsg('')

    try {
      const response = await apiClient.put('/merchants/preferred-token', {
        preferredTokenMint: selectedToken.mint,
        preferredTokenSymbol: selectedToken.symbol,
        preferredTokenDecimals: selectedToken.decimals,
      })

      setCurrentToken(selectedToken)
      setTokenMsg('Token preference updated successfully!')
      await refreshMerchant()
    } catch (err: any) {
      console.error('Error saving token preference:', err)
      setTokenMsg(err.response?.data?.error || err.message || 'Failed to save preference')
    } finally {
      setSavingToken(false)
      setTimeout(() => setTokenMsg(''), 3000)
    }
  }

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        {/* Profile */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Wallet Address</label>
              <input
                type="text"
                value={merchant?.walletAddress || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMsg && (
                <p className={`text-sm font-medium ${saveMsg.includes('success') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payment Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Settlement Token</label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Select which token you want to receive payments in. Customers can pay with any token, and we'll automatically swap it to your preference.
              </p>
              
              {currentToken && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Current: {currentToken.name} ({currentToken.symbol})
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Choose New Token</label>
                <TokenSelector
                  selectedToken={selectedToken}
                  onSelect={setSelectedToken}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveToken}
                  disabled={savingToken || selectedToken?.mint === currentToken?.mint}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {savingToken ? 'Saving...' : 'Save Token Preference'}
                </button>
                {tokenMsg && (
                  <p className={`text-sm font-medium ${tokenMsg.includes('success') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {tokenMsg}
                  </p>
                )}
              </div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                💡 Changes apply to new payments only. Existing payments will complete with their original settlement token.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-white/10 my-4"></div>

            <div className="space-y-3">
              {([
                { key: 'paymentReceived' as const, label: 'Send payment confirmations to email', desc: 'Get notified for every payment' },
                { key: 'settlementCompleted' as const, label: 'Send settlement reports to email', desc: 'When funds are settled' },
                { key: 'refundRequests' as const, label: 'Send security alerts to email', desc: 'New login or wallet connections' },
                { key: 'weeklyReports' as const, label: 'Send marketing updates', desc: 'News and updates' },
              ]).map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(pref.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${notifs[pref.key] ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]' : 'bg-gray-200 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notifs[pref.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-white/10 my-4"></div>

            <div className="bg-transparent border border-blue-500/30 rounded-xl p-3 my-2">
              <p className="text-[13px] text-blue-500 flex flex-col items-start">
                <span>Email is used only for notifications.</span>
                <span>You will always log in with your wallet.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/[0.04]">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8B5CF6] border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-colors cursor-pointer">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Passkey</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Configured ✓</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 transition-colors cursor-pointer">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
