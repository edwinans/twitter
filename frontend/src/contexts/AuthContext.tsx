import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  register,
  login,
  setToken,
  clearToken,
  setStoredUser,
  getStoredUser,
  clearStoredUser,
  type User,
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const handleLogin = async (email: string, password: string) => {
    const response = await login(email, password);
    setUser(response.user);
    setToken(response.token);
    setStoredUser(response.user);
  };

  const handleRegister = async (username: string, password: string) => {
    const response = await register(username, password);
    setUser(response.user);
    setToken(response.token);
    setStoredUser(response.user);
  };

  const handleLogout = () => {
    setUser(null);
    clearToken();
    clearStoredUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
