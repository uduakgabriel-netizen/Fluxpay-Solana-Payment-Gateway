import React from 'react';
import { useRouter } from 'next/router';

interface TokenPreferenceBannerProps {
  preferredTokenMint?: string;
  preferredTokenSymbol?: string;
  hasSelectedToken?: boolean;
}

export default function TokenPreferenceBanner({
  preferredTokenMint,
  preferredTokenSymbol,
  hasSelectedToken = false,
}: TokenPreferenceBannerProps) {
  const router = useRouter();
  
  // Display the merchant's actual preferred token or default to SOL if not set
  const displayToken = preferredTokenSymbol || 'SOL';

  // Only show for merchants who haven't explicitly selected a token
  // (i.e., are auto-set to SOL on migration)
  if (hasSelectedToken) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              Set Your Settlement Token
            </h3>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              You're currently receiving payments in <span className="font-semibold">{displayToken}</span>. 
              Visit <span className="font-semibold">Settings</span> to choose a different settlement token from our 10 supported options.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-amber-700 bg-white/40 hover:bg-white/60 rounded-lg transition-colors dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
        >
          Change Token
        </button>
      </div>
    </div>
  );
}
