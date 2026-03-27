import { useRouter } from 'next/router'
import { Link as LinkIcon, Key, Webhook, BookOpen } from 'lucide-react'

const actions = [
  {
    title: 'Create Payment Link',
    description: 'Generate a shareable payment link for your customers',
    icon: LinkIcon,
    href: '/dashboard/payments',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'View API Keys',
    description: 'Manage your API keys for payment integration',
    icon: Key,
    href: '/dashboard/api-keys',
    gradient: 'from-[#8B5CF6] to-purple-600',
  },
  {
    title: 'Setup Webhook',
    description: 'Configure webhooks for real-time payment events',
    icon: Webhook,
    href: '/dashboard/webhooks',
    gradient: 'from-[#14B8A6] to-emerald-600',
  },
  {
    title: 'Documentation',
    description: 'Explore our API docs and integration guides',
    icon: BookOpen,
    href: '/dashboard/docs',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export default function QuickActions() {
  const router = useRouter()

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get started quickly</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="group flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 dark:border-white/[0.04] hover:border-gray-200 dark:hover:border-white/[0.08] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all duration-200 text-left cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg shadow-black/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#8B5CF6] dark:group-hover:text-[#14B8A6] transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
