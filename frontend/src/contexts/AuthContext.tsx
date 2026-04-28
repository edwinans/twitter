import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  register,
  login,
  setToken,
  clearToken,
  me,
  type User,
  getToken,
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await me();
        if (!isMounted) {
          return;
        }

        setUser(response.user);
      } catch {
        if (!isMounted) {
          return;
        }

        clearToken();
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const response = await login(username, password);
    setUser(response.user);
    setToken(response.token);
    setIsLoading(false);
  };

  const handleRegister = async (username: string, password: string) => {
    const response = await register(username, password);
    setUser(response.user);
    setToken(response.token);
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    clearToken();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
        isLoading,
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
