
'use server';

import { collection, getDocs, query, where, Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { User, ShippingAddress } from '@/hooks/use-auth';
import type { CartItem } from '@/hooks/use-cart';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    shippingAddress: ShippingAddress;
    items: (CartItem & { productName: string })[];
    subtotal: number;
    reference: string;
    orderDate: Timestamp;
    status: OrderStatus;
    trackingNumber?: string;
};


export async function getAllUsers(): Promise<User[]> {
    try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure signupDate is a Firestore Timestamp
            const signupDate = data.signupDate instanceof Date ? Timestamp.fromDate(data.signupDate) : data.signupDate;
            return {
                uid: doc.id,
                name: data.name,
                email: data.email,
                role: data.role,
                shippingAddress: data.shippingAddress,
                signupDate: signupDate,
            } as User & { signupDate: Timestamp };
        });
        return userList;
    } catch (error) {
        console.error("Error fetching all users: ", error);
        return [];
    }
}

export async function getUserById(userId: string): Promise<User | null> {
    try {
        if (userId === 'guest') return null; // Don't fetch guest users
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            const signupDate = data.signupDate instanceof Date ? Timestamp.fromDate(data.signupDate) : data.signupDate;
            return {
                uid: userSnap.id,
                name: data.name,
                email: data.email,
                role: data.role,
                shippingAddress: data.shippingAddress,
                signupDate: signupDate,
            } as User & { signupDate: Timestamp };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

export async function getAllOrders(): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, orderBy('orderDate', 'desc'));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                shippingAddress: data.shippingAddress,
                items: data.items.map((item: any) => ({
                    ...item,
                    productName: item.product?.name || 'Unknown Product'
                })),
                subtotal: data.subtotal,
                reference: data.reference,
                orderDate: data.orderDate,
                status: data.status || 'Pending',
                trackingNumber: data.trackingNumber,
            } as Order;
        });
        return orderList;
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        return [];
    }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where("userId", "==", userId), orderBy('orderDate', 'desc'));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                shippingAddress: data.shippingAddress,
                items: data.items.map((item: any) => ({
                    ...item,
                    productName: item.product?.name || 'Unknown Product'
                })),
                subtotal: data.subtotal,
                reference: data.reference,
                orderDate: data.orderDate,
                status: data.status || 'Pending',
                trackingNumber: data.trackingNumber,
            } as Order;
        });
        return orderList;
    } catch (error) {
        console.error(`Error fetching orders for user ${userId}: `, error);
        return [];
    }
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where("reference", "==", reference));
        const orderSnapshot = await getDocs(q);
        if (orderSnapshot.empty) {
            return null;
        }
        const doc = orderSnapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data
        } as Order;
    } catch (error) {
        console.error(`Error fetching order by reference ${reference}: `, error);
        return null;
    }
}
