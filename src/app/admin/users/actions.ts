
'use server';

import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/firebase-admin";
import type { UserRole, ShippingAddress } from "@/hooks/use-auth";
import { sendRoleChangeEmail } from "@/lib/email";

export async function updateUserRole(uid: string, email: string, name: string, newRole: UserRole) {
    if (!adminDb) {
        const errorMsg = 'Admin SDK not initialized. Cannot update user role.';
        console.error(errorMsg);
        return { success: false, error: errorMsg };
    }
    if (!uid || !newRole) {
        return { success: false, error: 'User ID and new role are required.' };
    }
    
    try {
        const userRef = doc(adminDb, 'users', uid);
        await updateDoc(userRef, { role: newRole });

        // Send email notification to the user
        await sendRoleChangeEmail({ to: email, name, newRole });
        
        revalidatePath('/admin/users');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: 'Failed to update user role.' };
    }
}


export async function updateUserShippingAddress(userId: string, shippingAddress: ShippingAddress) {
    if (!adminDb) {
        const errorMsg = 'Admin SDK not initialized. Cannot update shipping address.';
        console.error(errorMsg);
        return { success: false, error: errorMsg };
    }
    try {
        const userRef = doc(adminDb, 'users', userId);
        await updateDoc(userRef, { shippingAddress });
        revalidatePath('/profile');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error('Error updating shipping address:', error);
        return { success: false, error: 'Failed to update shipping address.' };
    }
}
