import React, { createContext, useContext } from 'react'

interface PasskeyContextType {
  registerPasskey: (walletAddress: string) => Promise<boolean>
  authenticateWithPasskey: () => Promise<boolean>
  isPasskeySupported: () => boolean
}

const PasskeyContext = createContext<PasskeyContextType | undefined>(undefined)

export const PasskeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPasskeySupported = () => {
    if (typeof window === 'undefined') return false
    return (
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined &&
      navigator.credentials.create !== undefined &&
      navigator.credentials.get !== undefined
    )
  }

  const registerPasskey = async (walletAddress: string): Promise<boolean> => {
    if (!isPasskeySupported()) {
      console.error('Passkey is not supported in this browser')
      return false
    }

    try {
      const name = await new Promise<string>(resolve => {
        const input = prompt('Enter a name for this device (e.g., "My Laptop")')
        resolve(input || 'FluxPay Device')
      })

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'FluxPay',
            id: typeof window !== 'undefined' ? window.location.hostname : 'fluxpay.io',
          },
          user: {
            id: new TextEncoder().encode(walletAddress),
            name: walletAddress,
            displayName: `FluxPay - ${name}`,
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential

      if (!credential) {
        console.error('Failed to register passkey')
        return false
      }

      // Store passkey info in localStorage
      localStorage.setItem(
        `passkey_${walletAddress}`,
        JSON.stringify({
          id: credential.id,
          name,
          walletAddress,
          registeredAt: new Date().toISOString(),
        })
      )

      return true
    } catch (error) {
      console.error('Passkey registration error:', error)
      return false
    }
  }

  const authenticateWithPasskey = async (): Promise<boolean> => {
    if (!isPasskeySupported()) {
      console.error('Passkey is not supported in this browser')
      return false
    }

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'preferred',
        },
      }) as PublicKeyCredential

      if (!assertion) {
        console.error('Authentication failed')
        return false
      }

      return true
    } catch (error) {
      console.error('Passkey authentication error:', error)
      return false
    }
  }

  return (
    <PasskeyContext.Provider value={{ registerPasskey, authenticateWithPasskey, isPasskeySupported }}>
      {children}
    </PasskeyContext.Provider>
  )
}

export const usePasskey = () => {
  const context = useContext(PasskeyContext)
  if (context === undefined) {
    throw new Error('usePasskey must be used within a PasskeyProvider')
  }
  return context
}
