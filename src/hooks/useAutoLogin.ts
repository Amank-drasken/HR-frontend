'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { attemptAutoLogin, hasAutoLoginToken } from '@/lib/autoLogin';
import { useAuthStore } from '@/lib/store';

/**
 * Hook to handle auto-login flow
 * Attempts to auto-login user if auto-login token is present
 * Redirects to dashboard on success
 */
export const useAutoLogin = () => {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false);
  const [hasAutoLoginTokenFlag, setHasAutoLoginTokenFlag] = useState(false);

  useEffect(() => {
    const handleAutoLogin = async () => {
      if (isAutoLoginAttempted) return;

      setIsAutoLoginAttempted(true);

      // Check if auto-login token exists
      const hasToken = hasAutoLoginToken();
      setHasAutoLoginTokenFlag(hasToken);

      if (!hasToken) {
        console.log('ℹ️ No auto-login token found');
        return;
      }

      console.log('🔄 Attempting auto-login...');

      try {
        const success = await attemptAutoLogin();

        if (success) {
          console.log('✅ Auto-login successful, redirecting to dashboard...');
          // Get the newly persisted token
          const token = localStorage.getItem('access_token');
          if (token) {
            setToken(token);
          }
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('❌ Auto-login failed, showing login form');
        }
      } catch (error) {
        console.error('❌ Auto-login error:', error);
      }
    };

    handleAutoLogin();
  }, [isAutoLoginAttempted, router, setToken]);

  return { hasAutoLoginToken: hasAutoLoginTokenFlag, isAutoLoginAttempted };
};
