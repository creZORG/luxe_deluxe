'use server';

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { CartItem } from "@/hooks/use-cart";

type OrderDetails = {
    user: { name: string; email: string };
    items: CartItem[];
    subtotal: number;
    reference: string;
}

export async function processSuccessfulOrder(orderDetails: OrderDetails) {
    try {
        await sendOrderConfirmationEmail({
            to: orderDetails.user.email,
            name: orderDetails.user.name,
            items: orderDetails.items,
            subtotal: orderDetails.subtotal,
            reference: orderDetails.reference
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        // We return success true here because the payment was successful. 
        // Email failure should not block the user flow. It can be retried later.
        return { success: true, error: 'Failed to send confirmation email.' };
    }
}
