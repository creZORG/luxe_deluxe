

'use server';

import { collection, getDocs, doc, getDoc, query, where, Timestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { getOrdersByUserId } from './admin';

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
  fragrance: string;
  sizes: { size: string; price: number; quantityAvailable: number }[];
  imageId: string; // This is now a URL from Cloudinary
  shortDescription: string;
  longDescription: string;
  howToUse: string;
  ingredients: string;
  fragranceNotes: string;
  status: 'active' | 'inactive';
  viewCount: number;
  ratings: { userId: string; rating: number }[];
  reviewCount: number;
  averageRating: number;
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
            slug: data.slug || doc.id,
            category: data.category || 'Uncategorized',
            fragrance: data.fragrance || 'N/A',
            shortDescription: data.shortDescription || '',
            longDescription: data.longDescription || '',
            howToUse: data.howToUse || '',
            ingredients: data.ingredients || '',
            fragranceNotes: data.fragranceNotes || '',
            imageId: data.imageId || '',
            sizes: data.sizes || [],
            status: data.status || 'inactive',
            viewCount: data.viewCount || 0,
            ratings: data.ratings || [],
            reviewCount: data.reviewCount || 0,
            averageRating: data.averageRating || 0,
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
      .map(doc => ({ id: doc.id, slug: doc.data().slug || doc.id, ...doc.data() } as Product))
      .filter(p => p.sizes && p.sizes.length > 0); // Only show products with pricing
    
    return productList;
  } catch (error) {
    console.error("Error fetching active products for storefront: ", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where("slug", "==", slug));
    const productSnapshot = await getDocs(q);

    if (!productSnapshot.empty) {
      const productDoc = productSnapshot.docs[0];
      const productData = productDoc.data();
      return { 
          id: productDoc.id, 
          slug: productData.slug || productDoc.id,
          ...productData, 
          sizes: productData?.sizes || [] 
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
}

export async function incrementProductView(productId: string) {
    noStore();
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            viewCount: increment(1)
        });
        return { success: true };
    } catch (error) {
        console.error(`Error incrementing view for product ${productId}:`, error);
        // Fail silently on the client, but log error.
        return { success: false, error: 'Failed to update view count.' };
    }
}

export async function submitProductRating(productId: string, userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5.' };
    }
    
    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return { success: false, error: 'Product not found.' };
        }

        const userOrders = await getOrdersByUserId(userId);
        const hasPurchased = userOrders.some(order => 
            order.items.some(item => item.productId === productId)
        );

        if (!hasPurchased) {
            return { success: false, error: 'You can only rate products you have purchased.' };
        }

        const productData = productSnap.data() as Product;
        const ratings = productData.ratings || [];

        const existingRatingIndex = ratings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update existing rating
            ratings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating
            ratings.push({ userId, rating });
        }

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / ratings.length;
        const reviewCount = ratings.length;

        await updateDoc(productRef, {
            ratings: ratings,
            averageRating: averageRating,
            reviewCount: reviewCount
        });

        return { success: true };

    } catch (error) {
        console.error(`Error submitting rating for product ${productId}:`, error);
        return { success: false, error: 'Failed to submit rating.' };
    }
}

