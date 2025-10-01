'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// Mock user type
type User = {
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock authentication function
const fakeAuth = {
  login: async (email: string, pass: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Hardcoded credentials for demonstration
        if (email === 'admin@luna.com' && pass === 'password') {
          resolve({ email: 'admin@luna.com', name: 'Admin' });
        } else {
          reject(new Error('Invalid credentials. Please try again.'));
        }
      }, 500);
    });
  },
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user in session storage
    try {
      const storedUser = sessionStorage.getItem('luna-admin-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
        console.error('Could not parse user from session storage', e);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await fakeAuth.login(email, pass);
      setUser(loggedInUser);
      sessionStorage.setItem('luna-admin-user', JSON.stringify(loggedInUser));
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    await fakeAuth.logout();
    setUser(null);
    sessionStorage.removeItem('luna-admin-user');
    setLoading(false);
    router.push('/admin/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
