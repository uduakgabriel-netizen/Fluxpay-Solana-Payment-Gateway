import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
require('@solana/wallet-adapter-react-ui/styles.css')

// Cast to any to bypass the ReactNode/bigint incompatibility
const Connection = ConnectionProvider as any
const Wallet = WalletProvider as any
const WalletModal = WalletModalProvider as any

interface SolanaWalletProviderProps {
  children: React.ReactNode
}

export const SolanaWalletProvider: React.FC<SolanaWalletProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=5e93742e-974f-47a4-a053-c60784b5c0c5',
    []
  )

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  )

  return (
    <Connection endpoint={endpoint}>
      <Wallet wallets={wallets} autoConnect>
        <WalletModal>
          {children}
        </WalletModal>
      </Wallet>
    </Connection>
  )
}