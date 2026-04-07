import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/dashboard/layout'
import TokenPreferenceBanner from '@/components/dashboard/TokenPreferenceBanner'
import StatsCards from '@/components/dashboard/stats-cards'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import QuickActions from '@/components/dashboard/quick-actions'
import { useAuth } from '@/contexts/AuthContext'

const RevenueChart = dynamic(() => import('@/components/dashboard/revenue-chart'), { ssr: false })
const TokenDistribution = dynamic(() => import('@/components/dashboard/token-distribution'), { ssr: false })

export default function DashboardPage() {
  const { merchant, loading } = useAuth()

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Token preference banner for existing merchants */}
        {!loading && merchant && (
          <TokenPreferenceBanner
            preferredTokenMint={merchant.preferredTokenMint}
            preferredTokenSymbol={merchant.preferredTokenSymbol}
            hasSelectedToken={merchant.hasSelectedToken}
          />
        )}

        {/* Welcome header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {loading ? '...' : merchant?.businessName || 'Merchant'}! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your business today
          </p>
        </div>

        {/* Stats cards */}
        <StatsCards />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <TokenDistribution />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
