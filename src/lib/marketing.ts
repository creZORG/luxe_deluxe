
'use server';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';

export type PromoCode = {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    timesUsed: number;
    usageLimit?: number;
    expiryDate?: Timestamp;
    createdAt: Timestamp;
};

export async function getAllPromoCodes(): Promise<PromoCode[]> {
    noStore();
    try {
        const promoCodesCollection = collection(db, 'promoCodes');
        const q = query(promoCodesCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const codes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
            } as PromoCode;
        });

        return codes;
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return [];
    }
}
