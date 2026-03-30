import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const Login: NextPage = () => {
  const { connected } = useWallet()
  const { isAuthenticated, loginWithWallet, loginWithEmail, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // When wallet connects, attempt wallet login
  useEffect(() => {
    if (connected && !isAuthenticated && !loading && !authLoading) {
      handleWalletLogin()
    }
  }, [connected])

  const handleWalletLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await loginWithWallet()
      router.push('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Login failed. Please try again.'
      // If merchant doesn't exist, suggest signup
      if (message.includes('No nonce found') || err?.response?.status === 400) {
        setError('Please sign the message in your wallet to authenticate.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      await loginWithEmail(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Invalid email or password.'
      setError(message)
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-[24px] font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-[14px] text-gray-500 dark:text-slate-400">Sign in to your FluxPay account</p>
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

            <div className="space-y-5">
              {/* Wallet Button Container */}
              <div className="flex justify-center flex-col [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:bg-gradient-to-r [&_.wallet-adapter-button]:from-[#8B5CF6] [&_.wallet-adapter-button]:to-[#14B8A6] [&_.wallet-adapter-button]:text-white [&_.wallet-adapter-button]:font-semibold [&_.wallet-adapter-button]:px-6 [&_.wallet-adapter-button]:py-3 [&_.wallet-adapter-button]:rounded-xl [&_.wallet-adapter-button]:flex [&_.wallet-adapter-button]:items-center [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button:hover]:opacity-90 [&_.wallet-adapter-button]:transition-opacity [&_.wallet-adapter-button]:h-auto">
                <WalletMultiButton />
              </div>

              {loading && (
                <div className="text-center">
                  <p className="text-[14px] text-gray-500 dark:text-slate-400 animate-pulse">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Authenticating...
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-[12px] text-gray-400 dark:text-slate-500 bg-white dark:bg-[#0B0F19]">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Email Login */}
              {!showEmailLogin ? (
                <button
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl hover:border-[#14B8A6] flex items-center justify-center gap-2 transition-colors text-[14px] cursor-pointer"
                >
                  <i className="ri-mail-line text-lg"></i>
                  Continue with Email
                </button>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#8B5CF6]/40 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Sign Up Link */}
              <div className="text-center pt-2">
                <p className="text-[14px] text-gray-500 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup">
                    <span className="text-[#14B8A6] font-semibold hover:underline cursor-pointer transition-colors">
                      Create one
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Login