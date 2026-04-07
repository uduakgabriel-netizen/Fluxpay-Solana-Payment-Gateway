import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import * as authApi from '@/services/api/auth'
import { getToken, setToken, removeToken, setMerchant, getMerchant, removeMerchant, clearAuth } from '@/utils/token'
import bs58 from 'bs58'

interface MerchantInfo {
  id: string
  walletAddress: string
  email: string
  businessName: string
  emailVerified?: boolean
  createdAt?: string
  preferredTokenMint?: string
  preferredTokenSymbol?: string
  preferredTokenDecimals?: number
  hasSelectedToken?: boolean
  preferredTokenUpdatedAt?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  merchant: MerchantInfo | null
  loading: boolean
  loginWithWallet: () => Promise<void>
  signupWithWallet: (email: string, businessName: string, preferredTokenSymbol: string, password?: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshMerchant: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public pages that don't require auth
const PUBLIC_PAGES = ['/', '/login', '/signup', '/auth', '/features', '/pricing', '/docs', '/contact', '/status']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [merchant, setMerchantState] = useState<MerchantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { publicKey, signMessage, disconnect } = useWallet()
  const router = useRouter()

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await authApi.getMe()
        setMerchantState(me)
        setMerchant(me)
        setIsAuthenticated(true)
      } catch {
        // Token invalid or expired
        clearAuth()
        setIsAuthenticated(false)
        setMerchantState(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Protect dashboard routes
  useEffect(() => {
    if (loading) return
    const isPublic = PUBLIC_PAGES.some((p) => router.pathname === p || router.pathname.startsWith('/pay/'))
    if (!isAuthenticated && !isPublic && router.pathname.startsWith('/dashboard')) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router.pathname])

  const loginWithWallet = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or signing not supported')
    }

    const walletAddress = publicKey.toBase58()

    // 1. Request nonce from backend
    const { nonce } = await authApi.requestNonce(walletAddress)

    // 2. Construct the message the backend expects
    const message = `Sign this message to verify your wallet: ${nonce}`
    const encodedMessage = new TextEncoder().encode(message)

    // 3. Sign the message with wallet
    const signatureBytes = await signMessage(encodedMessage)
    const signature = Buffer.from(signatureBytes).toString('base64')

    // 4. Verify with backend
    const result = await authApi.verifyWallet({
      walletAddress,
      message,
      signature,
    })

    // 5. Store session
    setToken(result.sessionToken)
    setMerchantState(result.merchant)
    setMerchant(result.merchant)
    setIsAuthenticated(true)
  }, [publicKey, signMessage])

  const signupWithWallet = useCallback(async (email: string, businessName: string, preferredTokenSymbol: string, password?: string) => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or signing not supported')
    }

    const walletAddress = publicKey.toBase58()

    // 1. Request nonce
    const { nonce } = await authApi.requestNonce(walletAddress)

    // 2. Construct and sign message
    const message = `Sign this message to verify your wallet: ${nonce}`
    const encodedMessage = new TextEncoder().encode(message)
    const signatureBytes = await signMessage(encodedMessage)
    const signature = Buffer.from(signatureBytes).toString('base64')

    // 3. Signup with backend
    const result = await authApi.signup({
      walletAddress,
      email,
      businessName,
      preferredTokenSymbol,
      password,
      message,
      signature,
    })

    // 4. Store session
    setToken(result.sessionToken)
    setMerchantState(result.merchant)
    setMerchant(result.merchant)
    setIsAuthenticated(true)
  }, [publicKey, signMessage])

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    setToken(result.sessionToken)
    setMerchant(result.merchant)
    setMerchantState(result.merchant)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if API fails, clear local state
    }
    clearAuth()
    setIsAuthenticated(false)
    setMerchantState(null)
    try {
      await disconnect()
    } catch {
      // Wallet disconnect may fail if not connected
    }
    router.push('/')
  }, [disconnect, router])

  const refreshMerchant = useCallback(async () => {
    try {
      const me = await authApi.getMe()
      setMerchantState(me)
      setMerchant(me)
    } catch {
      // Silently fail
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      merchant,
      loading,
      loginWithWallet,
      signupWithWallet,
      loginWithEmail,
      logout,
      refreshMerchant,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}