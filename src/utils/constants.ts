/**
 * Global application constants
 * Used throughout the app for consistent values
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Authentication
export const DEMO_EMAIL = 'admin@example.com';
export const DEMO_PASSWORD = 'password123';
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

// Routes
export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEES_CREATE: '/employees/create',
  ATTENDANCE: '/attendance',
  SETTINGS: '/settings',
} as const;

// Application Info
export const APP_NAME = 'Drasken HRMS';
export const APP_VERSION = '1.0';
export const APP_EDITION = 'Industrial';

// Time Constants
export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_MINUTE = 60;

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cyan: '#06b6d4',
  emerald: '#10b981',
  slate: '#64748b',
} as const;

// Status Values
export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On-leave',
} as const;

export const ATTENDANCE_STATUS = {
  ON_TIME: 'On Time',
  LATE: 'Late',
  ABSENT: 'Absent',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
