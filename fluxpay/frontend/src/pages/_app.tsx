import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SolanaWalletProvider } from '@/contexts/SolanaWalletContext'
import { PasskeyProvider } from '@/contexts/PasskeyContext'
import '@/styles/globals.css'
import '@/styles/wallet-adapter.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <PasskeyProvider>
          <Component {...pageProps} />
        </PasskeyProvider>
      </SolanaWalletProvider>
    </ThemeProvider>
  )
}
