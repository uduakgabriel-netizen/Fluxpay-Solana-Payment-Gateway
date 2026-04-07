import React, { useState, useEffect } from 'react';
import { SUPPORTED_TOKENS, type Token } from '@/config/tokens';

interface TokenSelectorProps {
  onSelect: (token: Token) => void;
  selectedToken?: Token | null;
  loading?: boolean;
  error?: string;
}

export default function TokenSelector({
  onSelect,
  selectedToken = null,
  loading = false,
  error = undefined,
}: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [tokenError, setTokenError] = useState<string | null>(error || null);

  useEffect(() => {
    // Use hardcoded token list (no API call needed)
    setTokens(SUPPORTED_TOKENS);
    setIsLoading(false);
    setTokenError(null);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          {tokenError}
        </p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No tokens available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {tokens.map((token) => (
          <button
            key={token.id}
            onClick={() => onSelect(token)}
            className={`group relative aspect-square rounded-lg border-2 transition-all ${
              selectedToken?.id === token.id
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full p-2 space-y-1">
              {token.logoUrl ? (
                <img
                  src={token.logoUrl}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {token.symbol.slice(0, 1)}
                </div>
              )}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {token.symbol}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {token.name}
                </p>
              </div>
            </div>

            {selectedToken?.id === token.id && (
              <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedToken && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Selected: {selectedToken.name} ({selectedToken.symbol})
          </p>
        </div>
      )}
    </div>
  );
}
