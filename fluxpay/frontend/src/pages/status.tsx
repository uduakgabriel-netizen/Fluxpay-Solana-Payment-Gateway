import type { NextPage } from 'next'
import { motion } from 'framer-motion'

const Status: NextPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            System Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            All systems operational
          </p>
        </motion.div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold">All Systems Operational</p>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">99.9% Uptime SLA - Last 30 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Status
