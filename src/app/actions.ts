
'use server';

import { sendOrderConfirmationEmail, sendNewOrderAdminNotification, sendOrderShippedEmail, sendVerificationCodeEmail } from "@/lib/email";
import type { CartItem } from "@/hooks/use-cart";
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc, increment, writeBatch, query, where, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { User, ShippingAddress } from "@/hooks/use-auth";
import type { Order } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { nanoid } from 'nanoid';
import { createHmac } from 'crypto';
import { globalSettings } from "@/lib/global-settings";

type OrderDetails = {
    user: User | null; // User can be null for guest checkouts
    shippingAddress: ShippingAddress;
    customerName: string;
    customerEmail: string;
    items: CartItem[];
    subtotal: number;
    reference: string;
}

export async function processSuccessfulOrder(orderDetails: OrderDetails) {
    try {
        const { user, shippingAddress, customerName, customerEmail, items, subtotal, reference } = orderDetails;

        // 1. Save order to Firestore
        const ordersCollection = collection(db, 'orders');
        const newOrderRef = await addDoc(ordersCollection, {
            userId: user ? user.uid : 'guest',
            userName: customerName,
            userEmail: customerEmail,
            shippingAddress: shippingAddress, // Save the full shipping address on the order
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

        // 2. Award points only if the user is logged in
        let pointsEarned = 0;
        if (user) {
            pointsEarned = Math.floor(subtotal / 10);
            if (pointsEarned > 0) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    stradPoints: increment(pointsEarned)
                });
                // Revalidate user-specific paths
                revalidatePath('/profile');
            }
        }

        // The following email functions will now fail gracefully if the token isn't set.
        // We'll still wrap in a try/catch to handle actual API errors from ZeptoMail.
        try {
            // 3. Send confirmation email to customer
            await sendOrderConfirmationEmail({
                to: customerEmail,
                name: customerName,
                items: items,
                subtotal: subtotal,
                reference: reference,
                pointsEarned: pointsEarned
            });

            // 4. Send notification email to admin
            await sendNewOrderAdminNotification(newOrderData);
        } catch (emailError) {
             console.error('Error sending post-order emails:', emailError);
             // Even if emails fail, we don't want to block the success of the order itself.
             // The error is logged for investigation.
        }

        // Revalidate paths that show order info
        revalidatePath('/admin/orders');
        revalidatePath('/admin/dashboard');

        return { success: true, orderId: newOrderRef.id };
    } catch (error) {
        console.error('Critical error processing successful order:', error);
        // This outer catch block now only handles critical errors like database writes.
        return { success: false, error: 'A critical error occurred while saving your order. Please contact support.' };
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
        revalidatePath('/fulfillment/orders');
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status.' };
    }
}


// --- OTP & Verification Actions ---

const OTP_SECRET = process.env.OTP_SECRET || 'your-super-secret-otp-key-that-is-long-and-random';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string, email: string) {
    return createHmac('sha256', OTP_SECRET).update(otp + email).digest('hex');
}

export async function sendVerificationEmail(email: string, name: string) {
    if (!email) return { success: false, error: 'Email is required.' };
    
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp, email);
    const expires = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    try {
        const otpRef = doc(collection(db, 'otps'));
        await setDoc(otpRef, { email: email.toLowerCase(), hash: hashedOtp, expires });
        
        await sendVerificationCodeEmail({ to: email, name, code: otp });

        return { success: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: 'Could not send verification code. Please try again.' };
    }
}

export async function verifyUserEmail(userId: string, email: string, otp: string) {
    if (!userId || !email || !otp) {
        return { success: false, error: 'Missing required information.' };
    }

    try {
        const hashedOtp = hashOtp(otp, email);
        const otpsRef = collection(db, 'otps');
        const q = query(otpsRef, where("email", "==", email.toLowerCase()), where("hash", "==", hashedOtp));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'Invalid or expired verification code.' };
        }

        const otpDoc = querySnapshot.docs[0];
        const otpData = otpDoc.data();

        if (otpData.expires.toMillis() < Date.now()) {
            await deleteDoc(otpDoc.ref);
            return { success: false, error: 'Verification code has expired.' };
        }
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: 'User not found.' };
        }
        const userData = userSnap.data();

        const batch = writeBatch(db);

        // 1. Update user to verified and award signup points
        batch.update(userRef, {
            emailVerified: true,
            stradPoints: increment(globalSettings.crypto.pointsForSignup)
        });

        // 2. If user was referred, award points to referrer
        if (userData.referredBy) {
            const referrerRef = doc(db, 'users', userData.referredBy);
            const referrerSnap = await getDoc(referrerRef);
            if (referrerSnap.exists()) {
                batch.update(referrerRef, {
                    stradPoints: increment(globalSettings.crypto.pointsForReferral),
                    successfulReferrals: [...(referrerSnap.data().successfulReferrals || []), userId]
                });
            }
        }

        // 3. Delete the used OTP
        batch.delete(otpDoc.ref);

        await batch.commit();

        revalidatePath('/profile');
        revalidatePath('/campaigns/trad');

        return { success: true };
    } catch (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: 'An unexpected error occurred during verification.' };
    }
}
