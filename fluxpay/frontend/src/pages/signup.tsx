import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/contexts/AuthContext'
import TokenSelector from '@/components/token-selector/TokenSelector'
import { SUPPORTED_TOKENS, type Token } from '@/config/tokens'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const SignUp: NextPage = () => {
  const { connected, publicKey } = useWallet()
  const { registerPasskey, isPasskeySupported } = usePasskey()
  const { isAuthenticated, signupWithWallet, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'wallet' | 'details' | 'token' | 'passkey' | 'complete'>('wallet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [password, setPassword] = useState('')
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // When wallet connects, move to details step
  useEffect(() => {
    if (connected && publicKey && step === 'wallet') {
      setStep('details')
    }
  }, [connected, publicKey, step])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !email || !businessName) return
    setError(null)
    // Move to token selection step
    setStep('token')
  }

  const handleTokenSelect = async () => {
    if (!selectedToken) {
      setError('Please select a settlement token to continue')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signupWithWallet(email, businessName, selectedToken.symbol, password || undefined)
      setStep('passkey')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Signup failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const goBackToDetails = () => {
    setStep('details')
    setError(null)
  }

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F19] transition-colors font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-12 relative">
        <div className="w-full max-w-[400px]">
          <div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-[1rem] p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-11 w-11 bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-flashlight-line text-white text-xl"></i>
              </div>
              <span className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">FluxPay</span>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-[24px] font-bold text-gray-900 dark:text-white mb-2">
                {step === 'wallet' && 'Connect Your Wallet'}
                {step === 'details' && 'Business Details'}
                {step === 'token' && 'Choose Settlement Token'}
                {step === 'passkey' && 'Set Up Passkey'}
                {step === 'complete' && 'Account Created'}
              </h1>
              <p className="text-[14px] text-gray-500 dark:text-slate-400">
                {step === 'wallet' && 'Connect your Solana wallet to get started'}
                {step === 'details' && 'Tell us about your business'}
                {step === 'token' && 'Select which token you want to receive payments in'}
                {step === 'passkey' && 'Secure your account with a passkey'}
                {step === 'complete' && 'Welcome to FluxPay'}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {/* Step 1: Wallet */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                step === 'wallet' || step === 'details' || step === 'token' || step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-white/10'
              }`}>
                <i className="ri-wallet-line"></i>
              </div>
              <div className={`flex-1 h-0.5 rounded-full ${
                step === 'details' || step === 'token' || step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]' 
                  : 'bg-gray-200 dark:bg-white/10'
              }`}></div>
              
              {/* Step 2: Details */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                step === 'details' || step === 'token' || step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-white/10'
              }`}>
                <i className="ri-briefcase-line"></i>
              </div>
              <div className={`flex-1 h-0.5 rounded-full ${
                step === 'token' || step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]' 
                  : 'bg-gray-200 dark:bg-white/10'
              }`}></div>

              {/* Step 3: Token */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                step === 'token' || step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-white/10'
              }`}>
                <i className="ri-coin-line"></i>
              </div>
              <div className={`flex-1 h-0.5 rounded-full ${
                step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6]' 
                  : 'bg-gray-200 dark:bg-white/10'
              }`}></div>

              {/* Step 4: Passkey */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                step === 'passkey' || step === 'complete'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-white/10'
              }`}>
                <i className="ri-fingerprint-line"></i>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-transparent border border-[#F75A68]/30 rounded-xl p-4">
                <p className="text-[14px] text-[#F75A68] flex items-center">
                  <i className="ri-alert-circle-line mr-2"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Step 1: Connect Wallet */}
            {step === 'wallet' && (
              <div className="space-y-5">
                <div className="bg-transparent border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-information-line text-gray-400 dark:text-slate-400 mt-0.5"></i>
                  <p className="text-[14px] text-gray-500 dark:text-slate-400">
                    We support Phantom, Solflare, Torus, and Ledger wallets
                  </p>
                </div>

                <div className="flex justify-center flex-col [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:bg-gradient-to-r [&_.wallet-adapter-button]:from-[#8B5CF6] [&_.wallet-adapter-button]:to-[#14B8A6] [&_.wallet-adapter-button]:text-white [&_.wallet-adapter-button]:font-semibold [&_.wallet-adapter-button]:px-6 [&_.wallet-adapter-button]:py-3 [&_.wallet-adapter-button]:rounded-xl [&_.wallet-adapter-button]:flex [&_.wallet-adapter-button]:items-center [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button:hover]:opacity-90 [&_.wallet-adapter-button]:transition-opacity [&_.wallet-adapter-button]:h-auto">
                  <WalletMultiButton />
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 'details' && connected && publicKey && (
              <div className="space-y-5">
                <div className="bg-transparent border border-[#00B37E]/30 rounded-xl p-4">
                  <p className="text-[14px] font-semibold text-[#00B37E] mb-1 flex items-center">
                    <i className="ri-check-circle-line mr-2"></i>
                    Wallet Connected
                  </p>
                  <p className="text-[12px] text-[#00B37E]/80 font-mono break-all ml-6">
                    {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Business Name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password <span className="text-gray-400 dark:text-gray-600 normal-case">(optional)</span></label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password for email login"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white font-semibold flex items-center justify-center px-6 py-3 rounded-xl hover:opacity-90 transition-opacity gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    {!loading && <i className="ri-arrow-right-line"></i>}
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Select Settlement Token */}
            {step === 'token' && (
              <div className="space-y-5">
                <div className="bg-transparent border border-[#14B8A6]/30 rounded-xl p-4">
                  <p className="text-[14px] text-[#14B8A6] flex items-start gap-2">
                    <i className="ri-information-line mt-0.5 flex-shrink-0"></i>
                    <span>Customers can pay with any token. We'll automatically swap it to your preferred choice.</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Supported Settlement Tokens</label>
                  <TokenSelector
                    selectedToken={selectedToken}
                    onSelect={setSelectedToken}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleTokenSelect}
                    disabled={loading || !selectedToken}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white font-semibold flex items-center justify-center px-6 py-3 rounded-xl hover:opacity-90 transition-opacity gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Continuing...' : 'Continue to Security'}</span>
                    {!loading && <i className="ri-arrow-right-line"></i>}
                  </button>
                  <button
                    onClick={goBackToDetails}
                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl hover:border-[#14B8A6] flex items-center justify-center gap-2 transition-colors text-[14px] cursor-pointer"
                  >
                    <i className="ri-arrow-left-line"></i>
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Set Up Passkey */}
            {step === 'passkey' && (
              <div className="space-y-5">
                <div className="bg-transparent border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold text-[#14B8A6] mb-1.5 flex items-center text-[14px]">
                    <i className="ri-shield-check-line mr-2"></i>
                    What is a Passkey?
                  </h3>
                  <p className="text-[14px] text-gray-500 dark:text-slate-400">
                    A passkey uses your device&apos;s biometric authentication (fingerprint, face, PIN) to secure your account. It&apos;s more secure than passwords and easier to use.
                  </p>
                </div>

                {isPasskeySupported() ? (
                  <button
                    onClick={handleRegisterPasskey}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white font-semibold flex items-center justify-center px-6 py-3 rounded-xl hover:opacity-90 transition-opacity gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Setting Up...' : 'Register Passkey'}</span>
                    {!loading && <i className="ri-fingerprint-line"></i>}
                  </button>
                ) : (
                  <div className="bg-transparent border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-[14px] text-yellow-500 flex items-center">
                      <i className="ri-alert-line mr-2"></i>
                      Passkeys are not supported by your browser. You can skip this step.
                    </p>
                  </div>
                )}

                <button
                  onClick={skipPasskey}
                  className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl hover:border-[#14B8A6] flex items-center justify-center gap-2 transition-colors text-[14px] cursor-pointer"
                >
                  Skip for Now
                </button>
              </div>
            )}

            {/* Step 5: Complete */}
            {step === 'complete' && connected && publicKey && (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#00B37E]/10 border border-[#00B37E]/30">
                    <i className="ri-check-line text-4xl text-[#00B37E]"></i>
                  </div>
                </div>

                <div>
                  <h2 className="text-[24px] font-bold text-gray-900 dark:text-white mb-2">
                    You&apos;re All Set!
                  </h2>
                  <p className="text-gray-500 dark:text-slate-400 mb-4 text-[14px]">
                    Your FluxPay account has been created with wallet:
                  </p>
                  <div className="bg-transparent border border-gray-200 dark:border-white/10 rounded-xl p-4">
                    <p className="text-[14px] font-mono text-gray-600 dark:text-slate-300 break-all">
                      {publicKey.toBase58()}
                    </p>
                  </div>
                </div>

                <Link href="/dashboard">
                  <button className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white font-semibold flex items-center justify-center px-6 py-3 rounded-xl hover:opacity-90 transition-opacity gap-2 cursor-pointer">
                    <span>Go to Dashboard</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </Link>

                <p className="text-[14px] text-gray-500 dark:text-slate-500">
                  <Link href="/">
                    <span className="text-[#14B8A6] hover:underline cursor-pointer transition-colors">
                      Back to Home
                    </span>
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <p className="text-center text-[14px] text-gray-500 dark:text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login">
              <span className="text-[#14B8A6] hover:underline cursor-pointer transition-colors">
                Sign In
              </span>
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SignUp