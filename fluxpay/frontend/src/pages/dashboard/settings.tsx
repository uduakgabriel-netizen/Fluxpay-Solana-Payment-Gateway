import DashboardLayout from '@/components/dashboard/layout'
import { Settings as SettingsIcon, User, Bell, Shield, Globe } from 'lucide-react'

export default function SettingsPage() {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
                <input type="text" defaultValue="FluxPay Labs" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" defaultValue="merchant@fluxpay.io" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Wallet Address</label>
              <input type="text" defaultValue="9Bv8RkPYhFh2CW..." disabled className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Website</label>
              <input type="url" placeholder="https://your-website.com" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors" />
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Payment received', desc: 'Get notified for every payment', enabled: true },
              { label: 'Settlement completed', desc: 'When funds are settled', enabled: true },
              { label: 'Refund requests', desc: 'New refund requests from customers', enabled: false },
              { label: 'Weekly reports', desc: 'Summary of weekly performance', enabled: true },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pref.desc}</p>
                </div>
                <button className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${pref.enabled ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]' : 'bg-gray-200 dark:bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${pref.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
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
