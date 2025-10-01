'use server';

import { sendOrderConfirmationEmail, sendNewOrderAdminNotification, sendOrderShippedEmail } from "@/lib/email";
import type { CartItem } from "@/hooks/use-cart";
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { User } from "@/hooks/use-auth";
import type { Order } from "@/lib/admin";
import { revalidatePath } from "next/cache";

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
        const newOrderRef = await addDoc(ordersCollection, {
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

        const newOrder = await getDoc(newOrderRef);
        const newOrderData = { id: newOrder.id, ...newOrder.data() } as Order;

        // 2. Send confirmation email to customer
        await sendOrderConfirmationEmail({
            to: user.email!,
            name: user.name,
            items: items,
            subtotal: subtotal,
            reference: reference
        });

        // 3. Send notification email to admin
        await sendNewOrderAdminNotification(newOrderData);


        return { success: true };
    } catch (error) {
        console.error('Error processing successful order:', error);
        // We return success true here because the payment was successful.
        // The failure (e.g., email or DB write) should be handled by a retry mechanism or logged for manual intervention.
        return { success: true, error: 'Order processed, but failed to complete all post-payment steps.' };
    }
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const updates: any = { status };
        if (trackingNumber) {
            updates.trackingNumber = trackingNumber;
        }

        await updateDoc(orderRef, updates);

        // If status is 'Shipped', send email to customer
        if (status === 'Shipped') {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
                await sendOrderShippedEmail({ order: orderData });
            }
        }
        
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status.' };
    }
}
