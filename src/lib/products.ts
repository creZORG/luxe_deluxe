'use server';

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';

export type Product = {
  id: string;
  name: string;
  category: 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
  fragrance: string;
  sizes: { size: string; price: number }[];
  imageId: string;
  description: string;
  status: 'active' | 'inactive';
};

export async function getAllProducts(): Promise<Product[]> {
    noStore();
    try {
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().status || 'active' } as Product));
      return productList;
    } catch (error) {
      console.error("Error fetching all products: ", error);
      return [];
    }
}

export async function getProducts(): Promise<Product[]> {
  noStore();
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where("status", "==", "active"));
    const productSnapshot = await getDocs(q);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return productList;
  } catch (error) {
    console.error("Error fetching active products: ", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  noStore();
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = productSnap.data();
      // Ensure only active products can be viewed directly
      if (productData.status !== 'active') {
        return null;
      }
      return { id: productSnap.id, ...productData } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}
