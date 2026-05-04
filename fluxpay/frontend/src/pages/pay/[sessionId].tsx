import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, VersionedTransaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Wallet, ExternalLink, ShieldCheck, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionData {
  id: string;
  merchantName: string;
  merchantWallet: string;
  merchantPreferredToken: string;
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

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://api.fluxpay.com/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, wallet, disconnect } = useWallet();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'confirming' | 'completed' | 'failed'>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch Session ──────────────────────────────────────────
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

  // ─── Status Polling ─────────────────────────────────────────
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

  // ─── Redirect Countdown ─────────────────────────────────────
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

  // ─── Execute Payment ───────────────────────────────────────
  const executePayment = async () => {
    if (!publicKey || !sessionId || !wallet) return;

    try {
      setPaymentState('processing');
      setError(null);

      // 1. Call execute endpoint to get transaction
      const execRes = await fetch(`${API_BASE}/checkout/sessions/${sessionId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerWallet: publicKey.toBase58() }),
      });

      if (!execRes.ok) {
        const errData = await execRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to prepare transaction');
      }

      const execData = await execRes.json();

      let signature = '';

      if (execData.transaction) {
        // 2a. Swap transaction — sign and send
        setPaymentState('confirming');
        const txBuffer = Buffer.from(execData.transaction, 'base64');

        try {
          const vTx = VersionedTransaction.deserialize(txBuffer);
          signature = await sendTransaction(vTx, connection);
        } catch {
          const tx = Transaction.from(txBuffer);
          signature = await sendTransaction(tx, connection);
        }
      } else if (execData.directTransfer) {
        // 2b. Direct SOL transfer (no swap needed)
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
      }

      if (!signature) {
        throw new Error('No transaction was created');
      }

      setTxSignature(signature);

      // 3. Wait for on-chain confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'confirmed');

      // 4. Notify backend
      await fetch(`${API_BASE}/checkout/sessions/${sessionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: signature }),
      });

      setPaymentState('completed');
    } catch (err: any) {
      if (err.message?.includes('User rejected')) {
        setPaymentState('idle');
        return;
      }
      setError(err.message || 'Payment failed');
      setPaymentState('failed');
    }
  };

  // ─── Time Left Helper ───────────────────────────────────────
  const getTimeLeft = () => {
    if (!session) return '';
    const diff = new Date(session.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    return `${mins}m left`;
  };

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20" />
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin absolute inset-0" />
          </div>
          <p className="text-gray-400 font-medium">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  // ─── Fatal Error (no session) ──────────────────────────────
  if (error && !session) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#12122A] border border-white/10 rounded-2xl p-8 text-center space-y-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Checkout Error</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Checkout ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A1A] font-sans text-white selection:bg-indigo-500/30">
      <Head>
        <title>Pay {session?.merchantName} | FluxPay Checkout</title>
        <meta name="description" content="Secure Solana payment powered by FluxPay" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-lg mx-auto pt-8 pb-16 px-4 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">FluxPay</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{getTimeLeft()}</span>
          </div>
        </header>

        {/* Card */}
        <div className="bg-[#12122A]/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

          {/* Order Summary */}
          <div className="p-6 sm:p-8 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Secure Payment</span>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paying</p>
                <h2 className="text-xl font-bold">{session?.merchantName}</h2>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Amount</span>
                  <span className="font-bold text-2xl">{session?.amount.toFixed(2)} <span className="text-indigo-400 text-base">{session?.token}</span></span>
                </div>
                {session?.orderId && (
                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
                    <span className="text-gray-500 text-xs">Order</span>
                    <span className="text-gray-400 font-mono text-xs">{session.orderId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ─── SUCCESS ─── */}
              {paymentState === 'completed' && (
                <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                    <p className="text-gray-400 text-sm">Your transaction has been confirmed on Solana.</p>
                  </div>
                  {txSignature && (
                    <a
                      href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20"
                    >
                      <span className="truncate max-w-[180px] font-mono text-xs">{txSignature}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  )}
                  {session?.successUrl && (
                    <div className="pt-6 border-t border-white/[0.06]">
                      <p className="text-xs text-gray-500 mb-4">Redirecting in {countdown}s...</p>
                      <button
                        onClick={() => window.location.href = session.successUrl!}
                        className="w-full bg-white text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Return to Merchant
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── FAILED ─── */}
              {paymentState === 'failed' && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Payment Failed</h3>
                    <p className="text-gray-400 text-sm">{error || 'The transaction could not be completed.'}</p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => { setPaymentState('idle'); setError(null); }}
                      className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Try Again
                    </button>
                    {session?.cancelUrl && (
                      <button
                        onClick={() => window.location.href = session.cancelUrl!}
                        className="w-full bg-white/5 border border-white/10 text-gray-300 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
                      >
                        Cancel & Return
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── WALLET & PAY ─── */}
              {paymentState !== 'completed' && paymentState !== 'failed' && (
                <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Connect & Pay</h3>
                    <p className="text-sm text-gray-500">Connect your Solana wallet to complete the payment.</p>
                  </div>

                  {!connected ? (
                    <div className="space-y-5">
                      <div className="fluxpay-wallet-adapter">
                        <WalletMultiButton className="!w-full !bg-indigo-600 hover:!bg-indigo-700 !h-14 !rounded-xl !font-bold !text-base !justify-center !transition-colors !border-0" />
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Phantom · Backpack · Solflare · More</span>
                      </div>
                      <div className="text-center">
                        <a href="https://phantom.app" target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                          ⚡ No wallet? Get Phantom free
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Connected Wallet */}
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                            {wallet?.adapter.icon && <img src={wallet.adapter.icon} alt="" className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">Connected</p>
                            <p className="text-xs text-gray-500 font-mono">
                              {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>

                      {/* Processing States */}
                      {(paymentState === 'processing' || paymentState === 'confirming') ? (
                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6 text-center space-y-4">
                          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                          <div>
                            <p className="font-semibold text-indigo-300">
                              {paymentState === 'confirming' ? 'Confirming on Solana...' : 'Preparing Transaction...'}
                            </p>
                            <p className="text-xs text-indigo-400/70 mt-1">
                              {paymentState === 'confirming' ? 'Waiting for blockchain confirmation' : 'Please approve in your wallet'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={executePayment}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 group"
                        >
                          <span>Pay {session?.amount.toFixed(2)} {session?.token}</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}

                      {/* Cancel */}
                      {paymentState === 'idle' && session?.cancelUrl && (
                        <button
                          onClick={() => window.location.href = session.cancelUrl!}
                          className="w-full text-xs text-gray-500 hover:text-gray-400 font-medium text-center py-2"
                        >
                          Cancel Payment
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-600">
            Powered by <span className="font-semibold text-gray-500">FluxPay</span> · Solana Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
