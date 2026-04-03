import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  account_type: 'company' | 'candidate';
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_USER_STORAGE_KEY = 'authUser';

const normalizeAccountType = (value: unknown): 'company' | 'candidate' | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized.includes('company') || normalized.includes('employer') || normalized.includes('recruiter')) {
    return 'company';
  }

  if (normalized.includes('candidate') || normalized.includes('jobseeker') || normalized.includes('job_seeker') || normalized.includes('job-seeker')) {
    return 'candidate';
  }

  return null;
};

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getStoredAuthToken = (): string | null => {
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken')
  );
};

const getStoredUserType = (): 'company' | 'candidate' | null => {
  const value =
    localStorage.getItem('userType') ||
    localStorage.getItem('userRole') ||
    localStorage.getItem('selectedAccountRole');

  return normalizeAccountType(value);
};

const getStoredAuthUser = (): User | null => {
  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<User>;
    const account_type = normalizeAccountType(parsed.account_type);
    if (!account_type) {
      return null;
    }

    return {
      id: typeof parsed.id === 'number' ? parsed.id : 1,
      email: typeof parsed.email === 'string' ? parsed.email : '',
      account_type,
      first_name: typeof parsed.first_name === 'string' ? parsed.first_name : undefined,
      last_name: typeof parsed.last_name === 'string' ? parsed.last_name : undefined,
      company_name: typeof parsed.company_name === 'string' ? parsed.company_name : undefined,
    };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    const token = getStoredAuthToken();
    const storedUser = getStoredAuthUser();

    if (token) {
      const payload = parseJwtPayload(token);
      const payloadRole = normalizeAccountType(
        payload?.account_type ?? payload?.role ?? payload?.user_type,
      );
      const storedRole = getStoredUserType();
      const accountType = payloadRole || storedRole || storedUser?.account_type;

      if (accountType) {
        const restoredUser: User = {
          id:
            typeof payload?.user_id === 'number'
              ? payload.user_id
              : typeof payload?.id === 'number'
                ? payload.id
                : typeof storedUser?.id === 'number'
                  ? storedUser.id
                  : 1,
          email:
            typeof payload?.email === 'string'
              ? payload.email
              : typeof storedUser?.email === 'string'
                ? storedUser.email
                : '',
          account_type: accountType,
          first_name: storedUser?.first_name,
          last_name: storedUser?.last_name,
          company_name: storedUser?.company_name,
        };

        setUser(restoredUser);
        localStorage.setItem('userType', restoredUser.account_type);
        localStorage.setItem('userRole', restoredUser.account_type);
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(restoredUser));
      }
    }

    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userType', userData.account_type);
    localStorage.setItem('userRole', userData.account_type);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    localStorage.removeItem('rememberEmail');
    localStorage.removeItem('selectedAccountRole');
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};