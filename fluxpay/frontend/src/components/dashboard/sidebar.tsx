import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Key,
  Webhook,
  BookOpen,
  Users,
  FileText,
  Receipt,
  Repeat,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const navSections = [
  {
    label: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
      { name: 'Refunds', href: '/dashboard/refunds', icon: ArrowLeftRight },
      { name: 'Settlements', href: '/dashboard/settlements', icon: Banknote },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'DEVELOPERS',
    items: [
      { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
      { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
      { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { name: 'Team', href: '/dashboard/team', icon: Users },
      { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
      { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Repeat },
      { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    ],
  },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/dashboard') return router.pathname === '/dashboard'
    return router.pathname.startsWith(href)
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('walletAddress')
    router.push('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-white dark:bg-[#0B0F19] border-r border-gray-200 dark:border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
          <div className="h-9 w-9 min-w-[36px] bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white text-sm font-bold">⚡</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
              FluxPay
            </span>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                          transition-all duration-200 relative
                          ${active
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white shadow-lg shadow-purple-500/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon size={20} className={`flex-shrink-0 ${active ? 'text-white' : ''}`} />
                        {!collapsed && (
                          <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                        )}
                        {active && !collapsed && (
                          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-gray-200 dark:border-white/[0.06] space-y-2">
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
              transition-all duration-200 cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
