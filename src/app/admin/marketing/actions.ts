
'use server';

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { revalidatePath } from "next/cache";

type PromoCodeData = {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiryDate?: Date;
    usageLimit?: number;
};

export async function createPromoCode(data: PromoCodeData) {
    try {
        const { code, discountType, discountValue, expiryDate, usageLimit } = data;
        
        const newCodeData: any = {
            code: code.toUpperCase(),
            discountType,
            discountValue,
            timesUsed: 0,
            createdAt: Timestamp.now(),
        };

        if (expiryDate) {
            newCodeData.expiryDate = Timestamp.fromDate(expiryDate);
        }
        if (usageLimit) {
            newCodeData.usageLimit = usageLimit;
        }

        await addDoc(collection(db, 'promoCodes'), newCodeData);

        revalidatePath('/admin/marketing');
        return { success: true };
    } catch (error) {
        console.error("Error creating promo code:", error);
        return { success: false, error: 'Failed to create promo code.' };
    }
}
