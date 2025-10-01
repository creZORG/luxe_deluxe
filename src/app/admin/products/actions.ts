

'use server';

import { doc, setDoc, addDoc, collection, updateDoc, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/firebase';
import type { Product } from '@/lib/products';

export async function createProduct(productData: Omit<Product, 'id' | 'sizes' | 'status' | 'viewCount' | 'ratings' | 'reviewCount' | 'averageRating'>) {
    try {
        const newProductRef = collection(db, 'products');
        await addDoc(newProductRef, {
            ...productData,
            sizes: [],
            status: 'inactive', // New products start as inactive
            viewCount: 0,
            ratings: [],
            reviewCount: 0,
            averageRating: 0,
        });
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, error: "Failed to create product." };
    }
}

export async function updateProduct(productId: string, productData: Omit<Product, 'id' | 'sizes' | 'status' | 'viewCount' | 'ratings' | 'reviewCount' | 'averageRating'>) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, productData);
        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${productId}/manage`);
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: "Failed to update product." };
    }
}

export async function updateProductStatus(productId: string, status: 'active' | 'inactive') {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { status });
        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${productId}/manage`);
        return { success: true };
    } catch (error) {
        console.error("Error updating product status:", error);
        return { success: false, error: "Failed to update product status." };
    }
}

export async function updateProductPricing(productId: string, sizes: { size: string, price: number, quantityAvailable: number }[]) {
    // Detailed validation
    if (!productId) {
        return { success: false, error: "Product ID is missing." };
    }
    if (!Array.isArray(sizes)) {
        return { success: false, error: "Pricing data must be an array." };
    }

    for (const item of sizes) {
        if (typeof item.size !== 'string' || item.size.trim() === '') {
            return { success: false, error: "Invalid 'size' field. Must be a non-empty string." };
        }
        if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
            return { success: false, error: `Invalid 'price' for size "${item.size}". Must be a non-negative number.` };
        }
        if (typeof item.quantityAvailable !== 'number' || isNaN(item.quantityAvailable) || !Number.isInteger(item.quantityAvailable) || item.quantityAvailable < 0) {
            return { success: false, error: `Invalid 'quantityAvailable' for size "${item.size}". Must be a non-negative integer.` };
        }
    }

    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { sizes });
        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${productId}/manage`);
        return { success: true };
    } catch (error) {
        console.error("Error updating product pricing:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during the database operation.";
        return { success: false, error: `Failed to update pricing in database: ${errorMessage}` };
    }
}
