import { createContext, useContext, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface AuthContextType {
  isAuthenticated: boolean
  merchant: any | null
  loginWithWallet: () => Promise<void>
  loginWithPasskey: (wallet: string, passkey: string) => Promise<void>
  logout: () => void
  resetPasskey: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [merchant, setMerchant] = useState(null)
  const { publicKey, signMessage } = useWallet()

  const loginWithWallet = async () => {
    if (!publicKey || !signMessage) return
    
    try {
      const message = new TextEncoder().encode(
        'Sign this message to authenticate with FluxPay.\nThis will not trigger a blockchain transaction.'
      )
      const signature = await signMessage(message)
      
      // In real app: verify with backend
      // If new user -> create account
      // If existing -> login
      
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const loginWithPasskey = async (wallet: string, passkey: string) => {
    // In real app: verify passkey with backend
    console.log('Passkey login:', { wallet, passkey })
    setIsAuthenticated(true)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setMerchant(null)
  }

  const resetPasskey = async () => {
    if (!publicKey || !signMessage) return
    
    try {
      const message = new TextEncoder().encode(
        'Reset passkey for FluxPay account'
      )
      await signMessage(message)
      // In real app: allow passkey reset
    } catch (error) {
      console.error('Reset failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      merchant,
      loginWithWallet,
      loginWithPasskey,
      logout,
      resetPasskey
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