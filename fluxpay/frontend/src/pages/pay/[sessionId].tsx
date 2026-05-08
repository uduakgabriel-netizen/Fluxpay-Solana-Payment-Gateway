import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, VersionedTransaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Wallet, ExternalLink, Clock, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenSelector, { Token } from '../../components/TokenSelector';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://api.fluxpay.com/api';

interface SessionData {
  id: string;
  merchantName: string;
  merchantWallet: string;
  merchantPreferredToken: string;
  merchantTokenMint: string;
  merchantTokenDecimals: number;
  orderId: string | null;
  amount: number;
  token: string;
  status: string;
  customerWallet: string | null;
  transactionHash: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
  errorMessage: string | null;
  expiresAt: string;
  createdAt: string;
}

// Token type is now WalletToken from useWalletTokens hook

export default function CheckoutPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, wallet, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state: idle -> processing -> confirming -> completed / failed
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'confirming' | 'completed' | 'failed'>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Manual token selection
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Quote State
  const [inputAmount, setInputAmount] = useState<number | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteReady, setQuoteReady] = useState(false);
  const [jupiterQuote, setJupiterQuote] = useState<any>(null); // Store full quote for swap

  // Fetch Session
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/checkout/sessions/${sessionId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Checkout session not found or expired');
      }
      const data: SessionData = await res.json();
      setSession(data);

      if (data.status === 'COMPLETED') {
        setPaymentState('completed');
        setTxSignature(data.transactionHash);
      } else if (data.status === 'FAILED') {
        setPaymentState('failed');
        setError(data.errorMessage || 'Payment failed');
      } else if (data.status === 'EXPIRED') {
        setError('This checkout session has expired.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // Set initial selected token when session loads
  useEffect(() => {
    if (!session) return;
    if (!selectedToken) {
      setSelectedToken({
        symbol: session.token || 'USDC',
        name: session.token || 'USD Coin',
        mint: session.merchantTokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: session.merchantTokenDecimals || 6,
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      });
    }
  }, [session]);

  // Fetch Quote — calls Jupiter Swap API V2 directly from the browser
  useEffect(() => {
    async function fetchQuote() {
      if (!session || !selectedToken) { setQuoteReady(false); return; }

      setQuoteReady(false);
      setJupiterQuote(null);

      // If paying in the same token (by mint)
      if (session.merchantTokenMint === selectedToken.mint || session.token === selectedToken.symbol) {
        setInputAmount(session.amount);
        setQuoteError(null);
        setQuoteReady(true);
        return;
      }

      try {
        setIsQuoting(true);
        setQuoteError(null);

        const outDecimals = session.merchantTokenDecimals || 6;
        const outAmountLamports = Math.floor(session.amount * Math.pow(10, outDecimals));
        const outputMint = session.merchantTokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

        // Use Jupiter /order endpoint because /build does not properly support ExactOut mode.
        // We use this for quoting even though it might return 'Insufficient funds' for the taker.
        const quoteUrl = `https://api.jup.ag/swap/v2/order?inputMint=${selectedToken.mint}&outputMint=${outputMint}&amount=${outAmountLamports}&swapMode=ExactOut&slippageBps=50&taker=${publicKey?.toBase58() || '11111111111111111111111111111111'}`;
        
        console.log('[FluxPay] Fetching Jupiter quote (order endpoint):', { inputMint: selectedToken.mint, outputMint, amount: outAmountLamports, swapMode: 'ExactOut' });
        
        const res = await fetch(quoteUrl);
        
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.error('[FluxPay] Jupiter API error:', res.status, errText);
          setInputAmount(null);
          setQuoteError(`Jupiter API error (${res.status}): ${errText || 'Unknown error'}`);
          return;
        }

        const quote = await res.json();
        console.log('[FluxPay] Jupiter quote response:', quote);

        // /order returns error: "Insufficient funds" if the taker doesn't have the balance,
        // but it STILL returns the correct inAmount and outAmount which is all we need for the quote display!
        const isInsufficientFunds = quote.error === 'Insufficient funds' || quote.errorCode === 1;
        const hasValidAmount = quote && quote.inAmount;

        if (hasValidAmount && (!quote.error || isInsufficientFunds)) {
          setInputAmount(Number(quote.inAmount) / Math.pow(10, selectedToken.decimals));
          setJupiterQuote(quote); // Store for swap execution
          setQuoteReady(true);
          
          if (isInsufficientFunds && publicKey) {
            setQuoteError(`Insufficient ${selectedToken.symbol} balance. You need more to complete this payment.`);
          } else {
            setQuoteError(null);
          }
        } else {
          setInputAmount(null);
          setJupiterQuote(null);
          if (quote.error) {
            setQuoteError(`Jupiter error: ${typeof quote.error === 'string' ? quote.error : JSON.stringify(quote.error)}`);
          } else {
            setQuoteError(`No swap route found for ${selectedToken.symbol} → ${session.token}. Try another token.`);
          }
        }
      } catch (err: any) {
        console.error('[FluxPay] Quote fetch failed:', err);
        setInputAmount(null);
        setJupiterQuote(null);
        setQuoteError(`Network error: ${err.message || 'Failed to reach Jupiter API'}`);
      } finally {
        setIsQuoting(false);
      }
    }
    fetchQuote();
  }, [session, selectedToken, publicKey]);

  // Status Polling
  useEffect(() => {
    if (!sessionId || !session) return;
    if (paymentState === 'completed' || paymentState === 'failed') return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/checkout/sessions/${sessionId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          setPaymentState('completed');
          setTxSignature(data.transactionHash);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (data.status === 'FAILED') {
          setPaymentState('failed');
          setError(data.errorMessage || 'Payment failed');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch { /* silent */ }
    }, 2000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessionId, session, paymentState]);

  // Redirect Countdown
  useEffect(() => {
    if (paymentState !== 'completed' || !session?.successUrl) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = session.successUrl!;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentState, session?.successUrl]);

  // Execute Payment
  const executePayment = async () => {
    if (!publicKey || !sessionId || !wallet || !quoteReady || !selectedToken || !session) return;

    try {
      setPaymentState('processing');
      setError(null);

      const swapNeeded = selectedToken.mint !== session.merchantTokenMint && selectedToken.symbol !== session.token;

      let signature = '';

      if (swapNeeded && jupiterQuote) {
        // ─── SWAP PATH: Use Jupiter /order endpoint for best pricing ───
        console.log('[FluxPay] Getting swap order from Jupiter...');

        const outDecimals = session.merchantTokenDecimals || 6;
        const outAmountLamports = Math.floor(session.amount * Math.pow(10, outDecimals));
        const outputMint = session.merchantTokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

        // 1. Call Jupiter /order to get a pre-built transaction with best routing
        const orderUrl = `https://api.jup.ag/swap/v2/order?inputMint=${selectedToken.mint}&outputMint=${outputMint}&amount=${outAmountLamports}&swapMode=ExactOut&slippageBps=50&taker=${publicKey.toBase58()}`;
        
        const orderRes = await fetch(orderUrl);

        if (!orderRes.ok) {
          const errText = await orderRes.text().catch(() => '');
          console.error('[FluxPay] Jupiter order failed:', errText);
          throw new Error(`Failed to get swap order: ${errText}`);
        }

        const orderData = await orderRes.json();
        
        if (!orderData.transaction) {
          throw new Error('Jupiter returned no transaction');
        }

        console.log('[FluxPay] Swap order received, requesting wallet signature...', {
          inAmount: orderData.inAmount,
          outAmount: orderData.outAmount,
        });

        // 2. Notify backend that swap is in progress
        await fetch(`${API_BASE}/checkout/sessions/${sessionId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerWallet: publicKey.toBase58(),
            inputToken: selectedToken.mint,
            inputAmount: inputAmount,
          }),
        }).catch(() => {}); // Non-critical, just for status tracking

        // 3. Deserialize and sign the transaction
        setPaymentState('confirming');
        const txBuffer = Buffer.from(orderData.transaction, 'base64');

        try {
          const vTx = VersionedTransaction.deserialize(txBuffer);
          signature = await sendTransaction(vTx, connection);
        } catch (deserErr) {
          console.warn('[FluxPay] VersionedTransaction failed, trying legacy:', deserErr);
          const tx = Transaction.from(txBuffer);
          signature = await sendTransaction(tx, connection);
        }

      } else {
        // ─── DIRECT TRANSFER PATH: Same token, no swap needed ───
        console.log('[FluxPay] Direct transfer (no swap needed)');
        
        const execRes = await fetch(`${API_BASE}/checkout/sessions/${sessionId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerWallet: publicKey.toBase58(),
            inputToken: selectedToken.mint,
            inputAmount: inputAmount,
          }),
        });

        if (!execRes.ok) {
          const errData = await execRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to prepare transaction');
        }

        const execData = await execRes.json();

        if (execData.directTransfer) {
          setPaymentState('confirming');
          const { to, amount } = execData.directTransfer;
          const tx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey(to),
              lamports: Math.floor(amount * LAMPORTS_PER_SOL),
            })
          );
          signature = await sendTransaction(tx, connection);
        } else if (execData.transaction) {
          // Fallback: backend returned a serialized tx
          setPaymentState('confirming');
          const txBuffer = Buffer.from(execData.transaction, 'base64');
          try {
            const vTx = VersionedTransaction.deserialize(txBuffer);
            signature = await sendTransaction(vTx, connection);
          } catch {
            const tx = Transaction.from(txBuffer);
            signature = await sendTransaction(tx, connection);
          }
        }
      }

      if (!signature) {
        throw new Error('No transaction was created');
      }

      setTxSignature(signature);
      console.log('[FluxPay] Transaction sent:', signature);

      // Wait for on-chain confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'confirmed');

      console.log('[FluxPay] Transaction confirmed on-chain!');

      // Notify backend
      await fetch(`${API_BASE}/checkout/sessions/${sessionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: signature }),
      });

      setPaymentState('completed');
    } catch (err: any) {
      console.error('[FluxPay] Payment error:', err);
      if (err.message?.includes('User rejected')) {
        setPaymentState('idle');
        return;
      }
      if (err.message?.includes('Insufficient')) {
        setError(`Insufficient ${selectedToken.symbol} balance. You need approximately ${inputAmount?.toFixed(4)} ${selectedToken.symbol}.`);
      } else {
        setError(err.message || 'Payment failed');
      }
      setPaymentState('failed');
    }
  };

  const cancelPayment = () => {
    if (session?.cancelUrl) {
      window.location.href = session.cancelUrl;
    }
  };

  const getTimeLeft = () => {
    if (!session) return '';
    const diff = new Date(session.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    return `${mins}m left`;
  };

  // Status Message Helper
  const getStatusMessage = () => {
    if (loading) return "Loading secure checkout...";
    if (paymentState === 'completed') return "Payment successful! Redirecting...";
    if (paymentState === 'failed') return `Payment failed. ${error || 'Unknown error'}`;
    if (paymentState === 'processing') return "Waiting for approval in wallet...";
    if (paymentState === 'confirming') return "Confirming on Solana...";
    if (isQuoting) return "Calculating exchange rate...";
    if (quoteError) return quoteError;
    return "Review details and confirm payment";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-4 font-sans text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-gray-400 font-medium">{getStatusMessage()}</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full bg-[#12122A] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl shadow-indigo-900/20">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Checkout Error</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const merchantName = session?.merchantName?.trim() || 'Merchant';
  const isWalletReady = connected && publicKey;

  let siteName = '';
  try {
    const urlStr = session?.cancelUrl || session?.successUrl || '';
    if (urlStr) {
      const url = new URL(urlStr);
      siteName = url.hostname.replace('www.', '');
      if (siteName === 'localhost' || siteName === '127.0.0.1') siteName = 'Local';
      else siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    }
  } catch (e) { /* ignore */ }

  return (
    <div className="min-h-screen bg-[#0A0A1A] font-sans text-white selection:bg-indigo-500/30 flex flex-col">
      <Head>
        <title>Pay {merchantName} | FluxPay Checkout</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-white/[0.05] bg-[#0A0A1A]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FluxPay</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{getTimeLeft()}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pt-10 pb-16 px-4 sm:px-6 flex flex-col">
        <div className="mb-6 text-center">
          <p className="text-indigo-400 font-medium text-sm mb-2">{getStatusMessage()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Paying to <span className="text-white">{merchantName}</span>
          </h1>
          {siteName && <p className="text-gray-400 mt-1">on {siteName}</p>}
        </div>

        <div className="bg-[#12122A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">

          {/* Amount Summary */}
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Merchant receives:</span>
                <span className="font-semibold text-white">{session?.amount.toFixed(2)} {session?.token}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400 text-sm">You will pay:</span>
                <div className="text-right">
                  {isQuoting ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin ml-auto" />
                  ) : inputAmount ? (
                    <span className="font-bold text-2xl text-white">~{inputAmount.toFixed(4)} {selectedToken?.symbol}</span>
                  ) : (
                    <span className="font-bold text-xl text-gray-500">—</span>
                  )}
                </div>
              </div>

              {selectedToken && session?.merchantTokenMint !== selectedToken.mint && session?.token !== selectedToken.symbol && !quoteError && (
                <div className="flex items-start space-x-2 text-xs text-indigo-300/80 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>FluxPay automatically converts your {selectedToken.symbol} to {session?.token} for the merchant using Jupiter.</p>
                </div>
              )}

              {quoteError && (
                <div className="flex items-start space-x-2 text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{quoteError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {paymentState === 'completed' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Payment Successful!</h3>
                    <p className="text-gray-400 text-sm">Transaction confirmed on Solana.</p>
                  </div>
                  {txSignature && (
                    <a href={`https://solscan.io/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 bg-white/5 w-full py-3 rounded-xl border border-white/10 transition-colors">
                      <span className="truncate max-w-[200px] font-mono text-xs">{txSignature}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {session?.successUrl && (
                    <button onClick={() => window.location.href = session.successUrl!} className="w-full bg-[#4F46E5] hover:bg-[#6366F1] text-white py-3.5 rounded-xl font-semibold transition-colors flex justify-center space-x-2">
                      <span>Return to Merchant</span><span>({countdown}s)</span>
                    </button>
                  )}
                </motion.div>
              )}

              {paymentState === 'failed' && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Payment Failed</h3>
                    <p className="text-gray-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-3">{error || 'The transaction could not be completed.'}</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <button onClick={() => { setPaymentState('idle'); setError(null); }} className="w-full bg-[#4F46E5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#6366F1] transition-colors">
                      Try Again
                    </button>
                    {session?.cancelUrl && (
                      <button onClick={cancelPayment} className="w-full bg-white/5 border border-white/10 text-gray-300 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors">
                        Cancel & Return
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {paymentState !== 'completed' && paymentState !== 'failed' && (
                <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                  {/* Token Selection — Dynamic, shows ALL tokens via API search */}
                  <div className="space-y-3">
                    <label className="text-base font-bold text-white block">Pay With</label>
                    <TokenSelector
                      selected={selectedToken}
                      onSelect={setSelectedToken}
                      disabled={paymentState !== 'idle'}
                    />
                  </div>

                  {/* Wallet & Action */}
                  <div className="space-y-3 pt-2">
                    {!isWalletReady ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#0A0A1A] border border-white/5 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">Wallet</p>
                              <p className="text-xs text-gray-400">Not connected</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setVisible(true)}
                          className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-indigo-500/30 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center p-2">
                              {wallet?.adapter.icon ? (
                                <img src={wallet.adapter.icon} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <Wallet className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-white">Connected</p>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                              </div>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => disconnect()}
                            className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 bg-white/5 rounded-lg"
                          >
                            Disconnect
                          </button>
                        </div>

                        {paymentState === 'processing' || paymentState === 'confirming' ? (
                          <div className="bg-[#4F46E5]/20 border border-[#4F46E5]/40 rounded-xl p-4 text-center">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
                            <p className="font-semibold text-white">
                              {paymentState === 'confirming' ? 'Confirming on Solana...' : 'Approving in wallet...'}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={executePayment}
                            disabled={isQuoting || !quoteReady || !!quoteError || !inputAmount}
                            className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            {isQuoting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Calculating...</span>
                              </>
                            ) : (
                              <>
                                <span>Pay {inputAmount ? inputAmount.toFixed(4) : '...'} {selectedToken?.symbol}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {paymentState === 'idle' && session?.cancelUrl && (
                      <div className="pt-3 text-center">
                        <button
                          onClick={cancelPayment}
                          className="text-sm text-gray-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
