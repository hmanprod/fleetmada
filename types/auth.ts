export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'DRIVER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  isEmailVerified: boolean;
  preferences: {
    fuelEconomyDisplay: string;
    itemsPerPage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  fleetSize: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface OnboardingData {
  fleetSize: string;
  industry: string;
  objectives: string[];
}

export type AuthStep = 'login' | 'register' | 'onboarding' | 'dashboard';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  clearError: () => void;
}