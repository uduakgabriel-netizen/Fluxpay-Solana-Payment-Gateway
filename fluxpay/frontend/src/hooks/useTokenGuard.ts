import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to ensure NEW merchants select a token before accessing the dashboard.
 * Existing merchants are auto-set to SOL and can change anytime.
 * 
 * Only redirects to token selection if:
 * - Merchant is authenticated
 * - hasSelectedToken is FALSE (new merchant)
 * - Not already on the token selection page
 */
export function useTokenGuard() {
  const router = useRouter();
  const { merchant, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check if merchant is NEW (hasn't selected token yet)
    const isNewMerchant = merchant && merchant.hasSelectedToken === false;
    const isOnTokenSelectionPage = router.pathname === '/onboarding/token-select';

    if (isNewMerchant && !isOnTokenSelectionPage) {
      console.log('New merchant detected - redirecting to token selection...');
      router.push('/onboarding/token-select');
    }
  }, [merchant, loading, router]);

  return {
    isTokenSelected: merchant?.hasSelectedToken ?? false,
    isLoading: loading,
    isNewMerchant: merchant && merchant.hasSelectedToken === false,
  };
}

