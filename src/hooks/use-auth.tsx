'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter }from 'next/navigation';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User as FirebaseAuthUser,
} from 'firebase/auth';
import { app, db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Main user type
type User = {
  uid: string;
  email: string | null;
  name: string;
  role: 'admin' | 'customer';
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

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, now get the user role from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData.name || 'User',
                role: userData.role || 'customer',
            });
        } else {
            // This case might happen if user doc is not created on signup yet.
            // For now, we'll assume a 'customer' role.
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: 'New User',
                role: 'customer',
            });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
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
    try {
        await signOut(auth);
        router.push('/login');
    } catch (e) {
        console.error('Logout failed', e)
    } finally {
        setLoading(false);
    }
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
