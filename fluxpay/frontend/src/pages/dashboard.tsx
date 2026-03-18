import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'

const WalletDisconnectButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false }
)
import Link from 'next/link'

const Dashboard: NextPage = () => {
  const { connected, publicKey } = useWallet()

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors flex items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Please Connect Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to connect your Solana wallet to access the dashboard.
          </p>
          <Link href="/signup">
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg text-white font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              Go to Sign Up
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors">
      {/* Navigation */}
      <nav className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg flex items-center justify-center">
              <i className="ri-flashlight-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FluxPay</span>
          </div>
          <WalletDisconnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your SPL payment infrastructure
            </p>
          </div>

          {/* Wallet Info Card */}
          <div className="bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-6 mb-8 border border-purple-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connected Wallet
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Wallet Address</p>
              <p className="font-mono text-gray-900 dark:text-white break-all">
                {publicKey.toBase58()}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: 'ri-key-line',
                title: 'API Keys',
                description: 'Create and manage your API keys for payment processing',
              },
              {
                icon: 'ri-file-chart-line',
                title: 'Transactions',
                description: 'View and monitor all SPL payment transactions',
              },
              {
                icon: 'ri-settings-line',
                title: 'Settings',
                description: 'Configure your account and payment preferences',
              },
              {
                icon: 'ri-webhook-line',
                title: 'Webhooks',
                description: 'Set up webhooks for real-time payment updates',
              },
              {
                icon: 'ri-bar-chart-line',
                title: 'Analytics',
                description: 'Track payment metrics and performance',
              },
              {
                icon: 'ri-customer-service-line',
                title: 'Support',
                description: 'Get help from our support team',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg hover:shadow-teal-500/10 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg flex items-center justify-center">
                    <i className={`${feature.icon} text-white text-xl`}></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <i className="ri-lightbulb-line text-3xl text-blue-600 dark:text-blue-400 mb-2 block"></i>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Dashboard Features Coming Soon
            </h3>
            <p className="text-blue-800 dark:text-blue-400 text-sm">
              We're building these features to help you manage your SPL payments. Check back soon!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
