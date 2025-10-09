'use server';

import { collection, getDocs, query, where, orderBy, Timestamp, doc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { sendNewCampaignEmail } from './email';

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

export type InfluencerCampaign = {
    id: string;
    influencerId: string;
    influencerName: string;
    promoCode: string;
    commissionRate: number; // Percentage, e.g., 10 for 10%
    status: 'pending' | 'active' | 'archived';
    createdAt: Timestamp;
    // Performance metrics
    timesUsed: number;
    revenueGenerated: number;
}

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

type CampaignData = {
    influencerId: string;
    influencerName: string;
    influencerEmail: string;
    promoCode: string;
    commissionRate: number;
};

export async function createInfluencerCampaign(data: CampaignData) {
    try {
        // First, check if the promo code already exists in the promoCodes collection
        const promoQuery = query(collection(db, 'promoCodes'), where('code', '==', data.promoCode.toUpperCase()));
        const promoSnapshot = await getDocs(promoQuery);
        if (!promoSnapshot.empty) {
            return { success: false, error: 'This promo code is already in use by a general campaign.' };
        }

        // Check if promo code exists in campaigns collection
        const campaignQuery = query(collection(db, 'campaigns'), where('promoCode', '==', data.promoCode.toUpperCase()));
        const campaignSnapshot = await getDocs(campaignQuery);
        if (!campaignSnapshot.empty) {
            return { success: false, error: 'This promo code is already in use by another influencer.' };
        }
        
        const newCampaignData = {
            influencerId: data.influencerId,
            influencerName: data.influencerName,
            promoCode: data.promoCode.toUpperCase(),
            commissionRate: data.commissionRate,
            status: 'pending',
            createdAt: Timestamp.now(),
            timesUsed: 0,
            revenueGenerated: 0,
        };

        await addDoc(collection(db, 'campaigns'), newCampaignData);
        
        // Change user role to 'influencer' if they are a 'customer'
        const userRef = doc(db, 'users', data.influencerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === 'customer') {
            await updateDoc(userRef, { role: 'influencer' });
        }


        // Send notification email
        await sendNewCampaignEmail({
            to: data.influencerEmail,
            name: data.influencerName,
            promoCode: data.promoCode,
            commissionRate: data.commissionRate,
        });

        revalidatePath('/admin/influencers');
        return { success: true };

    } catch (error) {
        console.error("Error creating influencer campaign:", error);
        return { success: false, error: 'Failed to create campaign.' };
    }
}

export async function getCampaignsByInfluencerId(influencerId: string): Promise<InfluencerCampaign[]> {
    noStore();
    try {
        const campaignsCollection = collection(db, 'campaigns');
        const q = query(campaignsCollection, where("influencerId", "==", influencerId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfluencerCampaign));

    } catch (error) {
        console.error("Error fetching campaigns for influencer:", error);
        return [];
    }
}

export async function acceptInfluencerCampaign(campaignId: string) {
    noStore();
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            status: 'active'
        });
        revalidatePath('/influencer-portal');
        return { success: true };
    } catch (error) {
        console.error("Error accepting campaign:", error);
        return { success: false, error: 'Failed to accept campaign.' };
    }
}
