import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="FluxPay - Accept Solana SPL Payments In Minutes, Not Months" />
        <meta property="og:title" content="FluxPay - Solana SPL Payment Infrastructure" />
        <meta property="og:description" content="Production-ready SPL payment infrastructure for Solana. One API key, instant settlement, zero custody risk." />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
