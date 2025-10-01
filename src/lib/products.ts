

'use server';

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';

export type Product = {
  id: string;
  name: string;
  category: 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
  fragrance: string;
  sizes: { size: string; price: number; quantityAvailable: number }[];
  imageId: string; // This is now a URL from Cloudinary
  description: string;
  status: 'active' | 'inactive';
};

// This function is for the ADMIN panel. It shows ALL products without any filtering.
export async function getAllProducts(): Promise<Product[]> {
    noStore();
    try {
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      console.log(`[Admin] Found ${productSnapshot.docs.length} total products in the collection.`);

      const productList = productSnapshot.docs.map(doc => {
        const data = doc.data();
        const product = {
            id: doc.id,
            name: data.name || 'No Name',
            category: data.category || 'Uncategorized',
            fragrance: data.fragrance || 'N/A',
            description: data.description || '',
            imageId: data.imageId || '',
            sizes: data.sizes || [],
            status: data.status || 'inactive',
        } as Product;
        console.log(`[Admin] Fetched product:`, JSON.stringify(product, null, 2));
        return product;
      });
      return productList;
    } catch (error) {
      console.error("Error fetching all products for admin: ", error);
      return [];
    }
}

// This function is for the PUBLIC storefront. It ONLY shows active products with prices.
export async function getProducts(): Promise<Product[]> {
  noStore();
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where("status", "==", "active"));
    const productSnapshot = await getDocs(q);

    const productList = productSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Product))
      .filter(p => p.sizes && p.sizes.length > 0); // Only show products with pricing
    
    return productList;
  } catch (error) {
    console.error("Error fetching active products for storefront: ", error);
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
      // No filtering here for admin/direct access
      return { 
          id: productSnap.id, 
          ...productData, 
          sizes: productData?.sizes || [] 
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

