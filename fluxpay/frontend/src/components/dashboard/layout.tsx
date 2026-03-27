import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'
import LoadingSkeleton from '@/components/dashboard/loading-skeleton'
import Footer from '@/components/layout/Footer'

interface DashboardLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export default function DashboardLayout({ children, pageTitle = 'Dashboard' }: DashboardLayoutProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loading, setLoading] = useState(true)

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('sessionToken')
    if (!token) {
      router.push('/login')
      return
    }
    setAuthChecked(true)
    // Simulate loading delay for skeleton
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [router])

  // Responsive: auto-collapse sidebar on tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [router.pathname])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-[3px] border-[#8B5CF6]/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-[3px] border-transparent border-t-[#8B5CF6] rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 flex flex-col">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {loading ? <LoadingSkeleton /> : children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
