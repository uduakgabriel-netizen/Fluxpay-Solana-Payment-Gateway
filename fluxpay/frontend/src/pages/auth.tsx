import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import AnimatedAuthBackground from '@/components/ui/AnimatedAuthBackground'
import 'remixicon/fonts/remixicon.css'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

type AuthMode = 'wallet' | 'passkey' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('wallet')
  const [walletAddress, setWalletAddress] = useState('')
  const [passkey, setPasskey] = useState('')
  const [confirmPasskey, setConfirmPasskey] = useState('')
  const [step, setStep] = useState<'connect' | 'sign' | 'passkey'>('connect')
  const [error, setError] = useState('')

  const { connected, publicKey, signMessage } = useWallet()

  const handlePasskeyLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login with passkey:', { walletAddress, passkey })
  }

  const handleCreatePasskey = (e: React.FormEvent) => {
    e.preventDefault()
    if (passkey !== confirmPasskey) {
      setError('Passkeys do not match')
      return
    }
    console.log('Passkey created:', passkey)
  }

  const handleSignMessage = async () => {
    if (!publicKey || !signMessage) return

    try {
      const message = new TextEncoder().encode(
        'Sign this message to authenticate with FluxPay.\nThis will not trigger a blockchain transaction.'
      )
      const signature = await signMessage(message)
      console.log('Signature:', signature)
      setStep('passkey')
    } catch (err) {
      setError('Failed to sign message')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Animated Web3 Background */}
      <AnimatedAuthBackground />

      {/* Main Auth Card */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
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
            <h1 className="text-2xl font-bold text-white mb-2">
              Start Accepting Solana Payments
            </h1>
            <p className="text-sm text-slate-400">
              Connect your wallet to get started with SPL payments
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* === Wallet Connect Mode === */}
            {mode === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!connected ? (
                  <>
                    {/* Wallet Connect Button */}
                    <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-teal-500 !w-full !py-4 !px-6 !rounded-xl !text-white !font-semibold !text-base hover:!scale-105 transition-transform !border-0" />

                    {/* Supported Wallets */}
                    <div className="mt-6">
                      <p className="text-xs text-center text-slate-500 mb-3">
                        Supported wallets
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        {['Phantom', 'Solflare', 'Backpack'].map((wallet, i) => (
                          <motion.div
                            key={wallet}
                            className="glass-card-inner flex items-center gap-2 px-3 py-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.1 }}
                          >
                            <i className={`text-lg ${
                              wallet === 'Phantom' ? 'ri-ghost-line' :
                              wallet === 'Solflare' ? 'ri-sun-line' :
                              'ri-backpack-line'
                            } text-purple-400`}></i>
                            <span className="text-xs font-medium text-slate-300">
                              {wallet}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : step === 'connect' ? (
                  // Connected - Ready to sign
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                        style={{
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          boxShadow: '0 0 25px rgba(16,185,129,0.1)',
                        }}
                      >
                        <i className="ri-wallet-3-line text-3xl text-emerald-400"></i>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Connected as</p>
                      <div className="glass-card-inner p-2">
                        <p className="text-sm font-mono text-slate-300">
                          {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      className="btn-gradient"
                      onClick={handleSignMessage}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Sign Message to Authenticate</span>
                      <i className="ri-edit-line"></i>
                    </motion.button>

                    <p className="text-xs text-slate-500 mt-4">
                      This signature proves you own the wallet
                    </p>
                  </motion.div>
                ) : step === 'sign' ? (
                  // Signing in progress
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"
                      style={{ boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
                    ></div>
                    <p className="text-white font-medium">Verifying signature...</p>
                    <p className="text-xs text-slate-500 mt-2">Please wait a moment</p>
                  </motion.div>
                ) : (
                  // Create Passkey
                  <motion.form
                    key="create-passkey"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleCreatePasskey}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-white text-center mb-2">
                      Create a Passkey
                    </h3>
                    <p className="text-sm text-slate-400 text-center mb-4">
                      Set a passkey for faster logins without connecting your wallet each time
                    </p>

                    <div>
                      <label className="glass-label">Passkey</label>
                      <input
                        type="password"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="glass-input"
                        placeholder="Enter passkey"
                        required
                      />
                    </div>

                    <div>
                      <label className="glass-label">Confirm Passkey</label>
                      <input
                        type="password"
                        value={confirmPasskey}
                        onChange={(e) => setConfirmPasskey(e.target.value)}
                        className="glass-input"
                        placeholder="Confirm passkey"
                        required
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      className="btn-gradient"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Create Passkey & Continue</span>
                      <i className="ri-arrow-right-line"></i>
                    </motion.button>
                  </motion.form>
                )}

                {/* Divider to Passkey Login */}
                {!connected && (
                  <>
                    <div className="relative my-8">
                      <div className="glass-divider"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-4 text-xs text-slate-500"
                          style={{ background: 'rgba(15,23,42,0.55)' }}
                        >
                          or
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMode('passkey')}
                      className="w-full text-center text-sm text-teal-400 hover:text-teal-300 hover:underline focus:outline-none transition-colors"
                    >
                      Login with Passkey
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* === Passkey Login Mode === */}
            {mode === 'passkey' && (
              <motion.div
                key="passkey-login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handlePasskeyLogin} className="space-y-4">
                  <div>
                    <label className="glass-label">Wallet Address</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="glass-input"
                      placeholder="Enter your wallet address"
                      required
                    />
                  </div>

                  <div>
                    <label className="glass-label">Passkey</label>
                    <input
                      type="password"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      className="glass-input"
                      placeholder="Enter your passkey"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-gradient"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Login with Passkey</span>
                    <i className="ri-key-2-line"></i>
                  </motion.button>
                </form>

                <div className="mt-5 text-center space-y-2">
                  <button
                    onClick={() => setMode('forgot')}
                    className="text-sm text-teal-400 hover:text-teal-300 hover:underline focus:outline-none transition-colors"
                  >
                    Forgot Passkey?
                  </button>
                  <div>
                    <button
                      onClick={() => setMode('wallet')}
                      className="text-sm text-slate-500 hover:text-slate-300 hover:underline focus:outline-none transition-colors"
                    >
                      ← Back to Wallet Connect
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === Forgot Passkey Mode === */}
            {mode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    boxShadow: '0 0 25px rgba(139,92,246,0.1)',
                  }}
                >
                  <i className="ri-key-2-line text-3xl text-purple-400"></i>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  Reset Passkey
                </h3>

                <p className="text-sm text-slate-400 mb-6">
                  Connect your wallet and sign a message to reset your passkey
                </p>

                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-teal-500 !w-full !py-4 !px-6 !rounded-xl !text-white !font-semibold !text-base hover:!scale-105 transition-transform !border-0" />

                <button
                  onClick={() => setMode('passkey')}
                  className="mt-6 text-sm text-slate-500 hover:text-slate-300 hover:underline focus:outline-none transition-colors"
                >
                  ← Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-xs text-slate-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By continuing, you agree to FluxPay&apos;s{' '}
          <a href="/terms" className="text-teal-400/70 hover:text-teal-300 hover:underline transition-colors">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-teal-400/70 hover:text-teal-300 hover:underline transition-colors">Privacy Policy</a>
        </motion.p>
      </motion.div>
    </div>
  )
}