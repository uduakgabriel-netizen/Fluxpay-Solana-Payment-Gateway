import type { NextPage } from 'next'
import { motion } from 'framer-motion'

const Pricing: NextPage = () => {
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
            Pricing Plans
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your Solana SPL payment needs
          </p>
        </motion.div>
        <p className="text-center text-gray-500">Pricing page content coming soon...</p>
      </div>
    </div>
  )
}

export default Pricing
