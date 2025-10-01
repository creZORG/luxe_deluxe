
'use server';

import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/firebase-admin";
import type { UserRole } from "@/hooks/use-auth";
import { sendRoleChangeEmail } from "@/lib/email";

export async function updateUserRole(uid: string, email: string, name: string, newRole: UserRole) {
    if (!uid || !newRole) {
        return { success: false, error: 'User ID and new role are required.' };
    }
    
    try {
        const userRef = doc(adminDb, 'users', uid);
        await updateDoc(userRef, { role: newRole });

        // Send email notification to the user
        await sendRoleChangeEmail({ to: email, name, newRole });
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: 'Failed to update user role.' };
    }
}
