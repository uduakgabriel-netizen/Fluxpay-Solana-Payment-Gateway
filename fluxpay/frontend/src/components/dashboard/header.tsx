import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTheme } from '@/contexts/ThemeContext'
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  User,
  Settings,
  LifeBuoy,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
  pageTitle: string
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/payments': 'Payments',
  '/dashboard/refunds': 'Refunds',
  '/dashboard/settlements': 'Settlements',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/api-keys': 'API Keys',
  '/dashboard/webhooks': 'Webhooks',
  '/dashboard/docs': 'Documentation',
  '/dashboard/team': 'Team',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
  '/dashboard/support': 'Support',
}

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { merchant } = useAuth()
  const notifications: any[] = []
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const title = routeTitles[router.pathname] || pageTitle

  // Close menus on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Fallback if logout fails
      router.push('/login')
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06] flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-transparent focus-within:border-[#8B5CF6]/40 transition-colors w-64">
          <Search size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none w-full"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all hover:scale-105 cursor-pointer"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/[0.06]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-gray-100 dark:border-white/[0.03] ${
                      !notif.read ? 'bg-purple-50/50 dark:bg-purple-500/[0.03]' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-white/[0.06]">
                <button className="w-full text-center text-xs font-semibold text-[#8B5CF6] hover:text-[#14B8A6] transition-colors cursor-pointer">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] flex items-center justify-center text-white text-xs font-bold shadow-md">
              {merchant?.businessName?.charAt(0) || 'M'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {merchant?.businessName || 'Merchant'}
            </span>
            <ChevronDown size={14} className="hidden md:block text-gray-400 dark:text-gray-500" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/[0.06]">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{merchant?.businessName || 'Merchant'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{merchant?.email || ''}</p>
              </div>
              <div className="py-1">
                {[
                  { label: 'Profile', icon: User, href: '/dashboard/settings' },
                  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
                  { label: 'Support', icon: LifeBuoy, href: '/dashboard/support' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setUserMenuOpen(false)
                      router.push(item.href)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-white/[0.06] py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
