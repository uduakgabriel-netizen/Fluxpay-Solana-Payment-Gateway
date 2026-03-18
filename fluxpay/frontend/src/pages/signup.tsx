import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { usePasskey } from '@/contexts/PasskeyContext'
import AnimatedAuthBackground from '@/components/ui/AnimatedAuthBackground'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const SignUp: NextPage = () => {
  const { connected, publicKey } = useWallet()
  const { registerPasskey, isPasskeySupported } = usePasskey()
  const [step, setStep] = useState<'wallet' | 'passkey' | 'complete'>('wallet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegisterPasskey = async () => {
    if (!publicKey) return
    setLoading(true)
    setError(null)
    try {
      const success = await registerPasskey(publicKey.toBase58())
      if (success) {
        setStep('complete')
      } else {
        setError('Failed to register passkey. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while registering passkey.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const skipPasskey = () => {
    setStep('complete')
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {step === 'wallet' && 'Connect Your Wallet'}
              {step === 'passkey' && 'Set Up Passkey'}
              {step === 'complete' && 'Account Created'}
            </h1>
            <p className="text-sm text-slate-400">
              {step === 'wallet' && 'Connect your Solana wallet to get started'}
              {step === 'passkey' && 'Secure your account with a passkey'}
              {step === 'complete' && 'Welcome to FluxPay'}
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm transition-all duration-300 ${
              step === 'wallet' || step === 'passkey' || step === 'complete'
                ? 'step-dot-active' : 'step-dot-inactive'
            }`}>
              <i className="ri-wallet-line"></i>
            </div>
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
              step === 'passkey' || step === 'complete'
                ? 'step-line-active' : 'step-line-inactive'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm transition-all duration-300 ${
              step === 'passkey' || step === 'complete'
                ? 'step-dot-active' : 'step-dot-inactive'
            }`}>
              <i className="ri-fingerprint-line"></i>
            </div>
          </div>

          {/* Step 1: Connect Wallet */}
          {step === 'wallet' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <div className="glass-info glass-info-blue">
                <p className="text-sm text-blue-300">
                  <i className="ri-information-line mr-2"></i>
                  We support Phantom, Solflare, Torus, and Ledger wallets
                </p>
              </div>

              <div className="flex justify-center">
                <WalletMultiButton />
              </div>

              {connected && publicKey && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-info glass-info-green"
                >
                  <p className="text-sm font-semibold text-emerald-300 mb-1">
                    <i className="ri-check-circle-line mr-2"></i>
                    Wallet Connected
                  </p>
                  <p className="text-xs text-emerald-400/80 font-mono break-all">
                    {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                  </p>
                </motion.div>
              )}

              {connected && publicKey && (
                <motion.button
                  onClick={() => setStep('passkey')}
                  className="btn-gradient"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue to Passkey Setup</span>
                  <i className="ri-arrow-right-line"></i>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Step 2: Set Up Passkey */}
          {step === 'passkey' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <div className="glass-info glass-info-purple">
                <h3 className="font-semibold text-purple-300 mb-1.5">
                  <i className="ri-shield-check-line mr-2"></i>
                  What is a Passkey?
                </h3>
                <p className="text-sm text-purple-300/80">
                  A passkey uses your device&apos;s biometric authentication (fingerprint, face, PIN) to secure your account. It&apos;s more secure than passwords and easier to use.
                </p>
              </div>

              {error && (
                <div className="glass-info glass-info-red">
                  <p className="text-sm text-red-300">
                    <i className="ri-alert-circle-line mr-2"></i>
                    {error}
                  </p>
                </div>
              )}

              {isPasskeySupported() ? (
                <motion.button
                  onClick={handleRegisterPasskey}
                  disabled={loading}
                  className="btn-gradient"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{loading ? 'Setting Up Passkey...' : 'Register Passkey'}</span>
                  {!loading && <i className="ri-fingerprint-line"></i>}
                </motion.button>
              ) : (
                <div className="glass-info glass-info-yellow">
                  <p className="text-sm text-yellow-300">
                    <i className="ri-alert-line mr-2"></i>
                    Passkeys are not supported in your browser. You can skip this step.
                  </p>
                </div>
              )}

              <button
                onClick={skipPasskey}
                className="btn-glass-outline"
              >
                Skip for Now
              </button>
            </motion.div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && connected && publicKey && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.1))',
                    border: '1px solid rgba(16,185,129,0.2)',
                    boxShadow: '0 0 30px rgba(16,185,129,0.15)',
                  }}
                >
                  <i className="ri-check-line text-4xl text-emerald-400"></i>
                </div>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  You&apos;re All Set!
                </h2>
                <p className="text-slate-400 mb-4 text-sm">
                  Your FluxPay account has been created with wallet:
                </p>
                <div className="glass-card-inner p-3">
                  <p className="text-sm font-mono text-slate-300 break-all">
                    {publicKey.toBase58()}
                  </p>
                </div>
              </div>

              <Link href="/dashboard">
                <motion.button
                  className="btn-gradient"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Go to Dashboard</span>
                  <i className="ri-arrow-right-line"></i>
                </motion.button>
              </Link>

              <p className="text-sm text-slate-500">
                <Link href="/">
                  <span className="text-teal-400 hover:text-teal-300 hover:underline cursor-pointer transition-colors">
                    Back to Home
                  </span>
                </Link>
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-slate-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account?{' '}
          <Link href="/login">
            <span className="text-teal-400 hover:text-teal-300 hover:underline cursor-pointer transition-colors">
              Sign In
            </span>
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default SignUp
