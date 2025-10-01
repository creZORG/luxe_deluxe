
'use client';

import type { Product } from '@/lib/products';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react';
import { useAuth } from './use-auth';

export type CartItem = {
  id: string; // Combination of product ID and size
  product: Product;
  size: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, getCart, saveCart } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on initial render for guest users
  useEffect(() => {
    if (!user && !authLoading) {
      setLoading(true);
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        setItems([]);
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  // Sync cart with Firestore for logged-in users
  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        setLoading(true);
        const firestoreCart = await getCart();

        const localCartRaw = localStorage.getItem('cart');
        if (localCartRaw) {
          try {
            const localCart = JSON.parse(localCartRaw);
            if (localCart.length > 0) {
              const mergedCart = await mergeCarts(localCart, firestoreCart);
              setItems(mergedCart);
              await saveCart(mergedCart);
              localStorage.removeItem('cart'); // Clear local cart after merging
            } else {
              setItems(firestoreCart);
            }
          } catch {
            setItems(firestoreCart);
          }
        } else {
          setItems(firestoreCart);
        }
        setLoading(false);
      }
    };
    syncCart();
  }, [user, getCart, saveCart]);

  // Persist cart changes
  const persistCart = useCallback(async (cartItems: CartItem[]) => {
    if (user) {
      await saveCart(cartItems);
    } else {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [user, saveCart]);


  const mergeCarts = async (localCart: CartItem[], firestoreCart: CartItem[]): Promise<CartItem[]> => {
      const merged: CartItem[] = [...firestoreCart];
      const firestoreCartIds = new Set(firestoreCart.map(item => item.id));

      localCart.forEach(localItem => {
          if (firestoreCartIds.has(localItem.id)) {
              // Item exists in both, update quantity
              const existingItem = merged.find(item => item.id === localItem.id)!;
              existingItem.quantity += localItem.quantity;
          } else {
              // Item only in local cart, add it
              merged.push(localItem);
          }
      });

      return merged;
  };

  const addItem = async (itemToAdd: Omit<CartItem, 'id'>) => {
    const itemId = `${itemToAdd.product.id}-${itemToAdd.size}`;
    let newItems: CartItem[];

    setItems(prevItems => {
        const existingItem = prevItems.find((item) => item.id === itemId);
        if (existingItem) {
            newItems = prevItems.map((item) =>
            item.id === itemId
                ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                : item
            );
        } else {
            newItems = [...prevItems, { ...itemToAdd, id: itemId }];
        }
        persistCart(newItems);
        return newItems;
    });
  };

  const removeItem = async (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    await persistCart(newItems);
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    let newItems: CartItem[];
    if (quantity <= 0) {
      newItems = items.filter((item) => item.id !== itemId);
    } else {
      newItems = items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    }
    setItems(newItems);
    await persistCart(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    await persistCart([]);
  };

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        subtotal,
        totalItems,
        loading: authLoading || loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
