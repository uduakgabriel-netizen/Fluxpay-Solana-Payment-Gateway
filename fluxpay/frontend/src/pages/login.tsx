import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import AnimatedAuthBackground from '@/components/ui/AnimatedAuthBackground'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const Login: NextPage = () => {
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      router.push('/dashboard')
    }
  }, [connected, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Animated Web3 Background */}
      <AnimatedAuthBackground />

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glass Card */}
        <div className="glass-card p-8 sm:p-10">
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="h-11 w-11 bg-gradient-to-br from-purple-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <i className="ri-flashlight-line text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FluxPay</span>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-400">Sign in to your FluxPay account</p>
          </motion.div>

          <div className="space-y-5">
            {/* Info */}
            <motion.div
              className="glass-info glass-info-green"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-sm text-emerald-300">
                <i className="ri-information-line mr-2"></i>
                Connect your Solana wallet to sign in
              </p>
            </motion.div>

            {/* Wallet Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WalletMultiButton />
            </motion.div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="glass-divider"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-4 text-xs text-slate-500 bg-transparent"
                  style={{ background: 'rgba(15,23,42,0.55)' }}
                >
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Auth Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button className="btn-glass-outline">
                <i className="ri-github-line text-lg"></i>
                Continue with GitHub
              </button>
              <button className="btn-glass-outline">
                <i className="ri-discord-line text-lg text-indigo-400"></i>
                Continue with Discord
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              className="text-center pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup">
                  <span className="text-teal-400 font-semibold hover:text-teal-300 hover:underline cursor-pointer transition-colors">
                    Create one
                  </span>
                </Link>
              </p>
            </motion.div>

            {/* Terms */}
            <div className="glass-divider mt-4"></div>
            <motion.p
              className="text-xs text-slate-600 text-center pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              By signing in, you agree to our{' '}
              <a href="#" className="text-teal-400/70 hover:text-teal-300 hover:underline transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-teal-400/70 hover:text-teal-300 hover:underline transition-colors">
                Privacy Policy
              </a>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
