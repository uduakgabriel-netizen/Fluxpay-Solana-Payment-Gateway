import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TokenSelector from '@/components/token-selector/TokenSelector';
import { SUPPORTED_TOKENS, type Token } from '@/config/tokens';
import apiClient from '@/services/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TokenSelectionPage() {
  const router = useRouter();
  const { refreshMerchant } = useAuth();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectToken = async (token: Token) => {
    setSelectedToken(token);
  };

  const handleContinue = async () => {
    if (!selectedToken) {
      setError('Please select a token to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update merchant's preferred token
      await apiClient.put('/merchants/preferred-token', {
        preferredTokenMint: selectedToken.mint,
        preferredTokenSymbol: selectedToken.symbol,
        preferredTokenDecimals: selectedToken.decimals,
      });

      // Refresh merchant data in auth context to update hasSelectedToken
      await refreshMerchant();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving token preference:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save your preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="px-6 py-8 sm:px-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Choose Your Settlement Token
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Select which token you'd like to receive payments in. Customers can pay with any token, and we'll automatically swap it to your preferred choice.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Token Selector */}
              <div className="mb-8">
                <TokenSelector
                  selectedToken={selectedToken}
                  onSelect={handleSelectToken}
                  error={error || undefined}
                />
              </div>

              {/* Info Box */}
              <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      You can change this later
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Your settlement token preference can be updated anytime from your account settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-center font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedToken || loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-center font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Your selection will be used for all new payments until you change it.
          </p>
        </div>
      </div>
    </div>
  );
}
