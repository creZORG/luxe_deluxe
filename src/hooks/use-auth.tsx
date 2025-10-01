'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

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
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
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
          // This can happen if the user doc creation is pending,
          // or for users created before the firestore logic.
          // We can try to create it here as a fallback.
          try {
            const name = firebaseUser.displayName || 'New User';
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name,
              email: firebaseUser.email,
              role: 'customer',
            });
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name,
              role: 'customer',
            });
          } catch (docError) {
             console.error("Failed to create user document on-the-fly:", docError);
             // Set basic user data even if doc creation fails
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'New User',
                role: 'customer',
             });
          }
        }
      } else {
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

  const signup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const firebaseUser = userCredential.user;

      // Create the user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name,
        email: email,
        role: 'customer', // Default role
      });

      // Optimistically set the user state
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        role: 'customer',
      });
      
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
      console.error('Logout failed', e);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
