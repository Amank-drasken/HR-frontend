import axios, { AxiosInstance, AxiosError } from 'axios';
import { demoEmployees, demoAttendance, demoDepartments } from './demoData';

// Backend URL from environment - use as-is
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const isMockAuthMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor to attach JWT token + log request
api.interceptors.request.use((config) => {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    // Try to get token from access_token key first
    token = localStorage.getItem('access_token');
    
    // If not found, try to get from auth-store JSON
    if (!token) {
      try {
        const authStore = localStorage.getItem('auth-store');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          token = parsed.state?.token || parsed.token || null;
          if (token) {
            console.warn('✅ Token found in auth-store JSON:', token.substring(0, 20));
            // Also save to access_token for future requests
            localStorage.setItem('access_token', token);
          }
        }
      } catch (e) {
        console.error('Failed to parse auth-store:', e);
      }
    }
  }
  
  console.log('📤 API Request to:', config.url, 'Token found:', !!token, 'Token value:', token?.substring(0, 20));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    console.warn('⚠️ No token found for request:', config.url);
  }
  return config;
});

// Response interceptor to handle errors + log response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const errorMessage = error.message || 'Unknown error';
    const responseData = error.response?.data;
    const isMockAuthActive =
      isMockAuthMode ||
      (typeof window !== 'undefined' && localStorage.getItem('access_token') === 'mock-access-token');

    // If mock auth is enabled and (401/404 error OR network error), return mock data (BEFORE LOGGING)
    const isNetworkError = !error.response;
    if (isMockAuthActive && (status === 401 || status === 404 || isNetworkError)) {
      console.log(`✅ MOCK MODE ACTIVATED for ${url} (status: ${status || 'network error'})`);
      // Return appropriate mock data based on the URL
      if (url?.includes('/employees')) {
        return Promise.resolve({
          data: demoEmployees, // Return array directly
          status: 200,
          statusText: 'OK (MOCK)',
          headers: {},
          config: error.config!,
        } as any);
      } else if (url?.includes('/attendance')) {
        return Promise.resolve({
          data: demoAttendance, // Return array directly
          status: 200,
          statusText: 'OK (MOCK)',
          headers: {},
          config: error.config!,
        } as any);
      } else if (url?.includes('/departments')) {
        return Promise.resolve({
          data: demoDepartments, // Return array directly
          status: 200,
          statusText: 'OK (MOCK)',
          headers: {},
          config: error.config!,
        } as any);
      }

      // Fallback for any other endpoint
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: 'OK (MOCK)',
        headers: {},
        config: error.config!,
      } as any);
    }

    // Better error logging (skip 401/404 errors in mock mode)
    if (!error.response) {
      // Network error, no response from server
      if (!isMockAuthActive) {
        console.error(`❌ Network Error (${errorMessage}): ${url}`, {
          message: errorMessage,
          code: error.code,
          config: error.config,
        });
      }
    } else if (!isMockAuthActive || (status !== 401 && status !== 404)) {
      // Server responded with error status (skip 401/404 errors in mock mode)
      console.error(`❌ API Error: ${status} ${url}`, responseData);
    }

    if (error.response?.status === 401 && !isMockAuthActive) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  createEmployee: (data: any) =>
    api.post('/auth/register', data),
  autoLogin: (token: string) =>
    api.post('/auth/auto-login', { token }),
};

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.patch(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
};

// Location APIs
export const locationAPI = {
  getAll: () => api.get('/locations'),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  getById: (id: string) => api.get(`/attendance/${id}`),
  create: (data: any) => api.post('/attendance', data),
  update: (id: string, data: any) => api.patch(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  checkIn: (employeeId: string) => api.post(`/attendance/checkin/${employeeId}`),
  checkOut: (attendanceId: string) => api.post(`/attendance/checkout/${attendanceId}`),
  getEmployeeAttendance: (employeeId: string) => api.get(`/attendance/employee/${employeeId}`),
};

export default api;
