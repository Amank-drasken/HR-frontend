import axios, { AxiosInstance, AxiosError } from 'axios';

// Backend URL from environment - use as-is
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor to attach JWT token + log request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
    
    // Better error logging
    if (!error.response) {
      // Network error, no response from server
      console.error(`❌ Network Error (${errorMessage}): ${url}`, {
        message: errorMessage,
        code: error.code,
        config: error.config,
      });
    } else {
      // Server responded with error status
      console.error(`❌ API Error: ${status} ${url}`, responseData);
    }
    
    if (error.response?.status === 401) {
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
