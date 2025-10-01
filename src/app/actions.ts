'use server';

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { CartItem } from "@/hooks/use-cart";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { User } from "@/hooks/use-auth";


type OrderDetails = {
    user: User;
    items: CartItem[];
    subtotal: number;
    reference: string;
}

export async function processSuccessfulOrder(orderDetails: OrderDetails) {
    try {
        const { user, items, subtotal, reference } = orderDetails;

        // 1. Save order to Firestore
        const ordersCollection = collection(db, 'orders');
        await addDoc(ordersCollection, {
            userId: user.uid,
            userName: user.name,
            userEmail: user.email,
            items: items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
                imageId: item.product.imageId
            })),
            subtotal: subtotal,
            reference: reference,
            orderDate: Timestamp.now(),
            status: 'Pending', // Initial order status
        });

        // 2. Send confirmation email
        await sendOrderConfirmationEmail({
            to: user.email!,
            name: user.name,
            items: items,
            subtotal: subtotal,
            reference: reference
        });

        return { success: true };
    } catch (error) {
        console.error('Error processing successful order:', error);
        // We return success true here because the payment was successful.
        // The failure (e.g., email or DB write) should be handled by a retry mechanism or logged for manual intervention.
        return { success: true, error: 'Order processed, but failed to complete all post-payment steps.' };
    }
}
