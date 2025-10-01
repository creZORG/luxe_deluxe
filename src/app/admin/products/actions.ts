

'use server';

import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/firebase';
import type { Product } from '@/lib/products';

export async function createProduct(productData: Omit<Product, 'id' | 'sizes' | 'status'>) {
    try {
        const newProductRef = collection(db, 'products');
        await addDoc(newProductRef, {
            ...productData,
            sizes: [],
            status: 'inactive' // New products start as inactive
        });
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, error: "Failed to create product." };
    }
}

export async function updateProduct(productId: string, productData: Omit<Product, 'id' | 'sizes' | 'status'>) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, productData);
        revalidatePath('/admin/products');
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
        return { success: true };
    } catch (error) {
        console.error("Error updating product status:", error);
        return { success: false, error: "Failed to update product status." };
    }
}

export async function updateProductPricing(productId: string, sizes: { size: string, price: number, quantityAvailable: number }[]) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { sizes });
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Error updating product pricing:", error);
        return { success: false, error: "Failed to update pricing." };
    }
}

