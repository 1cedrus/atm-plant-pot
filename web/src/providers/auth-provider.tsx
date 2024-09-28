import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthProviderState = {
  setAuthToken: (authToken: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
};

const initialState: AuthProviderState = {
  setAuthToken: () => null,
  isAuthenticated: false,
  logout: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children }: AuthProviderProps) {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken') || null);

  useEffect(() => {
    localStorage.setItem('authToken', authToken || '');

    // Set the Authorization header for all axios requests
    axios.defaults.headers.common['Authorization'] = authToken ? `Bearer ${authToken}` : '';
  }, [authToken]);

  const logout = () => {
    setAuthToken(null);
  };

  const value = {
    isAuthenticated: !!authToken,
    setAuthToken,
    logout,
  };

  return <AuthProviderContext.Provider value={value}>{children}</AuthProviderContext.Provider>;
}

export const useAuthority = () => {
  const context = useContext(AuthProviderContext);

  if (context === undefined) throw new Error('useAppContext must be used within a AuthProvider');

  return context;
};
