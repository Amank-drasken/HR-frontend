import { authAPI } from './api';
import { persistAuthSession } from './auth';
import { autoCheckIn } from './attendanceAuto';

export interface AutoLoginResponse {
  message: string;
  access_token: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

/**
 * Attempt auto-login with auto-login token from URL or storage
 * Used when employee receives auto-login link from backend
 */
export const attemptAutoLogin = async (): Promise<boolean> => {
  try {
    // Check if already authenticated
    if (typeof window === 'undefined') return false;
    
    const existingToken = localStorage.getItem('access_token');
    if (existingToken) {
      console.log('✅ User already authenticated');
      return true;
    }

    // Check for auto-login token in URL parameters
    const params = new URLSearchParams(window.location.search);
    const autoLoginToken = params.get('autoLoginToken');
    const autoLoginEmail = params.get('email');

    if (!autoLoginToken) {
      // Check if auto-login data is in sessionStorage (from backend redirect)
      const sessionAutoToken = sessionStorage.getItem('autoLoginToken');
      const sessionAutoEmail = sessionStorage.getItem('autoLoginEmail');

      if (!sessionAutoToken) {
        return false;
      }

      return await processAutoLogin(sessionAutoToken, sessionAutoEmail);
    }

    // Process auto-login token from URL
    return await processAutoLogin(autoLoginToken, autoLoginEmail);
  } catch (error) {
    console.error('❌ Auto-login failed:', error);
    return false;
  }
};

/**
 * Process the auto-login token and authenticate the user
 */
const processAutoLogin = async (token: string, email?: string | null): Promise<boolean> => {
  try {
    // Call backend to validate and get complete user data
    const response = await authAPI.autoLogin(token);
    
    const accessToken = response.data.access_token || token;
    const userData = response.data.employee || response.data.user || response.data;
    const userEmail = email || userData.email || 'unknown@employee.com';

    console.log('✅ Auto-login successful');
    console.log('User Data:', userData);

    // Persist the authenticated session
    if (userData && (userData.id || userData.email)) {
      persistAuthSession(accessToken, userData, userEmail);
      
      // Auto check-in when employee logs in
      if (userData.id) {
        await autoCheckIn(userData.id);
      }
      
      // Clean up URL parameters
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
        // Also clean up session storage
        sessionStorage.removeItem('autoLoginToken');
        sessionStorage.removeItem('autoLoginEmail');
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Auto-login token validation failed:', error);
    // Clean up invalid tokens
    sessionStorage.removeItem('autoLoginToken');
    sessionStorage.removeItem('autoLoginEmail');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return false;
  }
};

/**
 * Setup auto-login from backend redirect
 * Call this when backend redirects user to frontend with auto-login data
 */
export const setupAutoLogin = (autoLoginToken: string, email?: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('autoLoginToken', autoLoginToken);
    if (email) {
      sessionStorage.setItem('autoLoginEmail', email);
    }
  }
};

/**
 * Check if user has valid auto-login token in storage
 */
export const hasAutoLoginToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.has('autoLoginToken')) return true;

  return !!sessionStorage.getItem('autoLoginToken');
};
