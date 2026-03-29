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

  return value === 'company' || value === 'candidate' ? value : null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    const token = getStoredAuthToken();
    const userType = getStoredUserType();

    if (token && userType) {
      // In a real app, you might want to validate the token with the backend
      // For now, we'll assume it's valid and set a basic user object
      setUser({
        id: 1, // This should come from the token or a separate API call
        email: '', // This should come from the token or a separate API call
        account_type: userType as 'company' | 'candidate',
      });
    }

    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userType', userData.account_type);
    localStorage.setItem('userRole', userData.account_type);
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