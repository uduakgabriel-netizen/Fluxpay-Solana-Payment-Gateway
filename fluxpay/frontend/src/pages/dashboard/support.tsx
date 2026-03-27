import DashboardLayout from '@/components/dashboard/layout'
import { LifeBuoy, MessageCircle, BookOpen, Mail, ExternalLink } from 'lucide-react'

export default function SupportPage() {
  return (
    <DashboardLayout pageTitle="Support">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get help from our team</p>
        </div>

        {/* Quick help */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Documentation', desc: 'Browse guides & API docs', icon: BookOpen, href: '/dashboard/docs' },
            { title: 'Community', desc: 'Join our Discord server', icon: MessageCircle, href: '#' },
            { title: 'Status Page', desc: 'Check service status', icon: ExternalLink, href: '#' },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-[#8B5CF6]/40 transition-all"
            >
              <item.icon size={20} className="text-[#8B5CF6] mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#8B5CF6] transition-colors">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Contact Support</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subject</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none focus:border-[#8B5CF6]/40 transition-colors">
                <option>General Question</option>
                <option>Payment Issue</option>
                <option>API Integration</option>
                <option>Account & Billing</option>
                <option>Bug Report</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message</label>
              <textarea
                rows={5}
                placeholder="Describe your issue or question..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors resize-none"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
              <Mail size={14} />
              Send Message
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: 'How long do settlements take?', a: 'Settlements are typically processed within 24 hours on business days.' },
              { q: 'Which tokens are supported?', a: 'We support USDC, SOL, USDT, BONK, JUP, PYTH, JTO, WIF, RNDR, and HNT.' },
              { q: 'How do I rotate my API keys?', a: 'Go to API Keys page, click Rotate on the key you want to update. A new key will be generated.' },
              { q: 'Is there a transaction fee limit?', a: 'Fees depend on your plan. Starter: 1%, Pro: 0.5%, Enterprise: custom pricing.' },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 dark:border-white/[0.04] rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
