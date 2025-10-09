
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
import { doc, getDoc, setDoc, Timestamp, collection, query, where, getDocs, writeBatch, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { LoadingModal } from '@/components/ui/loading-modal';
import type { CartItem } from './use-cart';
import { nanoid } from 'nanoid';
import { globalSettings } from '@/lib/global-settings';


// Shipping address type
export type ShippingAddress = {
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    county: string;
    deliveryDescription?: string;
}

// Main user type
export type UserRole = 'admin' | 'customer' | 'influencer' | 'sales' | 'fulfillment' | 'digital_marketer' | 'developer';

export type User = {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  shippingAddress?: ShippingAddress;
  stradPoints?: number;
  signupDate?: Timestamp;
  referralCode: string;
  referredBy?: string;
  successfulReferrals?: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, referralCode?: string) => Promise<boolean>;
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
            emailVerified: userData.emailVerified || false,
            shippingAddress: userData.shippingAddress,
            stradPoints: userData.stradPoints || 0,
            signupDate: userData.signupDate,
            referralCode: userData.referralCode || nanoid(8),
            referredBy: userData.referredBy,
            successfulReferrals: userData.successfulReferrals || [],
          };
          setUser(loadedUser);
        } else {
           // This case handles a user that exists in Firebase Auth but not in Firestore.
           const newUser: Omit<User, 'uid'> = {
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'New User',
            role: 'customer',
            emailVerified: false,
            stradPoints: 0,
            signupDate: Timestamp.now(),
            referralCode: nanoid(8),
           };
           await setDoc(userDocRef, newUser);
           setUser({ uid: firebaseUser.uid, ...newUser });
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
        if (['admin', 'fulfillment', 'digital_marketer', 'developer'].includes(role)) router.push('/admin/dashboard');
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

  const signup = async (name: string, email: string, pass: string, referralCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const firebaseUser = userCredential.user;
      
      const newUser: Omit<User, 'uid'> = {
        name: name,
        email: email,
        role: 'customer',
        emailVerified: false, // Will be set to true after OTP verification
        signupDate: Timestamp.now(),
        stradPoints: 0, // Points are now only awarded after verification
        referralCode: nanoid(8),
        successfulReferrals: [],
      };

      // Handle referral logic
      if (referralCode) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referralCode", "==", referralCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const referringUserDoc = querySnapshot.docs[0];
            newUser.referredBy = referringUserDoc.id; // Store referrer's UID
        } else {
            // Handle case where referral code is invalid, maybe show a toast?
            // For now, we'll just ignore it.
            console.warn(`Invalid referral code used: ${referralCode}`);
        }
      }
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      // User is created. The auth listener will pick them up.
      // Redirecting is handled by the auth listener effect.
      // No points awarded here. That happens in the verification action.

      return true;
    } catch (err: any) {
       if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please log in or use a different email.');
      } else {
        setError(err.message || 'An unknown error occurred.');
      }
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
