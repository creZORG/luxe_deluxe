
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { LoadingModal } from '@/components/ui/loading-modal';
import type { CartItem } from './use-cart';

// Main user type
export type UserRole = 'admin' | 'customer' | 'influencer' | 'sales' | 'fulfillment';

export type User = {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  getCart: () => Promise<CartItem[]>;
  saveCart: (items: CartItem[]) => Promise<void>;
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
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const loadedUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || 'User',
            role: userData.role || 'customer',
          };
          setUser(loadedUser);
        } else {
           setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'New User',
            role: 'customer',
         });
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
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'customer';
        if (role === 'admin' || role === 'fulfillment') router.push('/admin/dashboard');
        else if (role === 'influencer') router.push('/influencer-portal');
        else if (role === 'sales') router.push('/sales-portal');
        else router.push('/');
      } else {
        router.push('/');
      }
      
      return true;
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'An unknown error occurred.');
      }
      return false;
    } finally {
        setLoading(false);
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
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name,
        email: email,
        role: 'customer',
        signupDate: new Date(),
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getCart = useCallback(async (): Promise<CartItem[]> => {
    if (!user) return [];
    try {
      const cartDocRef = doc(db, 'users', user.uid, 'cart', 'current');
      const cartDoc = await getDoc(cartDocRef);
      if (cartDoc.exists()) {
        return cartDoc.data().items as CartItem[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cart from Firestore:", error);
      return [];
    }
  }, [user]);

  const saveCart = useCallback(async (items: CartItem[]) => {
    if (!user) return;
    try {
      const cartDocRef = doc(db, 'users', user.uid, 'cart', 'current');
      await setDoc(cartDocRef, { items });
    } catch (error) {
      console.error("Error saving cart to Firestore:", error);
    }
  }, [user]);


  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    error,
    getCart,
    saveCart,
  };

  return (
    <AuthContext.Provider value={value}>
        {loading && !pathname.startsWith('/admin') ? <LoadingModal /> : children}
    </AuthContext.Provider>
  );
}
