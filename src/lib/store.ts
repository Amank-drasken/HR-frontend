import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: (token) => {
    // Sync to localStorage for API interceptor
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    set({ token, isAuthenticated: !!token });
  },
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false });
  },
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      set({ token, isAuthenticated: !!token });
    }
  },
}));

interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  currentAddress: string;
  permanentAddress: string;
  maritalStatus: string;
  bloodGroup: string;
  physicallyHandicapped: boolean;
  nationality: string;
  role: string;
  departmentId: string;
  locationId: string;
  createdAt: string;
  status?: string;
}

interface EmployeeStore {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
}));

interface Department {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface DataStore {
  departments: Department[];
  locations: Location[];
  setDepartments: (departments: Department[]) => void;
  setLocations: (locations: Location[]) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  departments: [],
  locations: [],
  setDepartments: (departments) => set({ departments }),
  setLocations: (locations) => set({ locations }),
}));
