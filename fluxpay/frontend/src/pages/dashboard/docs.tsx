import DashboardLayout from '@/components/dashboard/layout'
import { BookOpen, Copy, ExternalLink } from 'lucide-react'

export default function DocsPage() {
  return (
    <DashboardLayout pageTitle="Documentation">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quick start guides and API reference</p>
        </div>

        {/* Quick start */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-[#8B5CF6]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Start</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">1. Install the SDK</p>
              <div className="relative bg-gray-900 dark:bg-black/40 rounded-xl p-4 font-mono text-sm">
                <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
                  <Copy size={14} />
                </button>
                <code className="text-teal-400">npm install @fluxpay/sdk</code>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">2. Initialize FluxPay</p>
              <div className="relative bg-gray-900 dark:bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
                  <Copy size={14} />
                </button>
                <pre className="text-gray-300">
                  <span className="text-purple-400">import</span> {'{ FluxPay }'} <span className="text-purple-400">from</span> <span className="text-teal-400">&apos;@fluxpay/sdk&apos;</span>{'\n\n'}
                  <span className="text-purple-400">const</span> fluxpay = <span className="text-purple-400">new</span> <span className="text-yellow-300">FluxPay</span>({'{\n'}
                  {'  '}apiKey: <span className="text-teal-400">&apos;sk_live_your_api_key&apos;</span>,{'\n'}
                  {'  '}network: <span className="text-teal-400">&apos;mainnet-beta&apos;</span>{'\n'}
                  {'}'})
                </pre>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">3. Create a Payment</p>
              <div className="relative bg-gray-900 dark:bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
                  <Copy size={14} />
                </button>
                <pre className="text-gray-300">
                  <span className="text-purple-400">const</span> payment = <span className="text-purple-400">await</span> fluxpay.<span className="text-yellow-300">payments</span>.<span className="text-yellow-300">create</span>({'{\n'}
                  {'  '}token: <span className="text-teal-400">&apos;USDC&apos;</span>,{'\n'}
                  {'  '}amount: <span className="text-teal-400">&apos;100.00&apos;</span>,{'\n'}
                  {'  '}recipient: <span className="text-teal-400">&apos;YOUR_WALLET_ADDRESS&apos;</span>,{'\n'}
                  {'  '}metadata: {'{ '}orderId: <span className="text-teal-400">&apos;order_123&apos;</span>{' }'}{'\n'}
                  {'}'})
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'API Reference', desc: 'Complete API documentation', href: '#' },
            { title: 'SDKs & Libraries', desc: 'JavaScript, Python, Go SDKs', href: '#' },
            { title: 'Changelog', desc: 'Latest updates and releases', href: '#' },
          ].map((res) => (
            <a
              key={res.title}
              href={res.href}
              className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-[#8B5CF6]/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#8B5CF6] transition-colors">{res.title}</h4>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-[#8B5CF6] transition-colors" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{res.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
