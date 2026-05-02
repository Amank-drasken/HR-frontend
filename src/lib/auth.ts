import { authAPI } from './api';
import { autoCheckOut, clearAttendanceSession } from './attendanceAuto';

export interface LoginResponse {
  message: string;
  access_token: string;
}

export const persistAuthSession = (token: string, userData: any, email: string) => {
  // Store in localStorage
  localStorage.setItem('access_token', token);

  // Also set as cookie for middleware
  if (typeof window !== 'undefined') {
    document.cookie = `access_token=${token}; path=/; max-age=86400`;
  }

  // Store user data if available
  if (userData.id) localStorage.setItem('user_id', String(userData.id));
  if (userData.firstName) localStorage.setItem('user_firstName', userData.firstName);
  if (userData.lastName) localStorage.setItem('user_lastName', userData.lastName);
  if (userData.email) localStorage.setItem('user_email', userData.email);

  // Extract role from multiple sources
  let userRole = userData.role;

  // Try JWT payload if userData doesn't have role
  if (!userRole && token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Decoded:', decoded);
      userRole = decoded.role || decoded.userRole || userData.role;
    } catch (e) {
      console.error('Failed to decode JWT', e);
    }
  }

  console.log('Final User Role:', userRole);

  // Fallback: Set default roles based on email for testing
  if (!userRole) {
    console.warn('No role found in response, using fallback logic');
    // Hardcode role for specific test accounts
    if (email === 'aman@test.com') userRole = 'EMPLOYEE';
    else if (email === 'admin@test.com') userRole = 'ADMIN';
    else if (email === 'hr@test.com') userRole = 'HR';
    else userRole = 'EMPLOYEE'; // default fallback
  }

  if (userRole) {
    localStorage.setItem('user_role', userRole);
    console.log('✅ Role set to:', userRole);
  }
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const isMockAuthEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

  if (isMockAuthEnabled) {
    // Dev-only fallback login to test frontend flows when backend is unavailable.
    const mockToken = 'mock-access-token';
    const mockUser = {
      id: 'mock-user-1',
      firstName: 'Mock',
      lastName: 'User',
      email,
      role: 'ADMIN',
    };

    persistAuthSession(mockToken, mockUser, email);
    return {
      message: 'Mock login successful',
      access_token: mockToken,
    };
  }

  const response = await authAPI.login(email, password);
  const token = response.data.access_token;
  const userData = response.data.employee || response.data.user || response.data;
  
  console.log('Login Response:', response.data);
  console.log('User Data:', userData);
  
  persistAuthSession(token, userData, email);
  
  return response.data;
};

export const logoutUser = async () => {
  try {
    // Auto check-out when employee logs out
    await autoCheckOut();
    clearAttendanceSession();
  } catch (error) {
    console.error('Auto check-out error:', error);
  }

  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_firstName');
  localStorage.removeItem('user_lastName');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  
  // Clear cookies
  if (typeof window !== 'undefined') {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const localToken = localStorage.getItem('access_token');
    if (localToken) return localToken;
    
    // Check cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_role');
  }
  return null;
};

export const hasRole = (role: string): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};

export const hasAnyRole = (roles: string[]): boolean => {
  const userRole = getUserRole();
  return roles.includes(userRole || '');
};
