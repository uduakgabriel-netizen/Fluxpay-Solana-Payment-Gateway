import type { NextPage } from 'next'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const Login: NextPage = () => {
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      localStorage.setItem('sessionToken', 'demo-session-token')
      router.push('/dashboard')
    }
  }, [connected, router])

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

            <div className="space-y-5">
              {/* Wallet Button Container */}
              <div className="flex justify-center flex-col [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:bg-gradient-to-r [&_.wallet-adapter-button]:from-[#8B5CF6] [&_.wallet-adapter-button]:to-[#14B8A6] [&_.wallet-adapter-button]:text-white [&_.wallet-adapter-button]:font-semibold [&_.wallet-adapter-button]:px-6 [&_.wallet-adapter-button]:py-3 [&_.wallet-adapter-button]:rounded-xl [&_.wallet-adapter-button]:flex [&_.wallet-adapter-button]:items-center [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button:hover]:opacity-90 [&_.wallet-adapter-button]:transition-opacity [&_.wallet-adapter-button]:h-auto">
                <WalletMultiButton />
              </div>

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

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl hover:border-[#14B8A6] flex items-center justify-center gap-2 transition-colors text-[14px]">
                  <i className="ri-github-line text-lg"></i>
                  Continue with GitHub
                </button>
                <button className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl hover:border-[#14B8A6] flex items-center justify-center gap-2 transition-colors text-[14px]">
                  <i className="ri-discord-line text-lg text-indigo-400"></i>
                  Continue with Discord
                </button>
              </div>

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