
'use server';

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { User } from '@/hooks/use-auth';
import type { CartItem } from '@/hooks/use-cart';

export type Order = {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    items: (CartItem & { productName: string })[];
    subtotal: number;
    reference: string;
    orderDate: Timestamp;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
};


export async function getAllUsers(): Promise<User[]> {
    try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                name: data.name,
                email: data.email,
                role: data.role,
                signupDate: data.signupDate,
            } as User & { signupDate: Timestamp };
        });
        return userList;
    } catch (error) {
        console.error("Error fetching all users: ", error);
        return [];
    }
}

export async function getAllOrders(): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersCollection);
        const orderList = orderSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                items: data.items.map((item: any) => ({
                    ...item,
                    productName: item.product?.name || 'Unknown Product'
                })),
                subtotal: data.subtotal,
                reference: data.reference,
                orderDate: data.orderDate,
                status: data.status || 'Pending',
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
        const q = query(ordersCollection, where("userId", "==", userId));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                items: data.items.map((item: any) => ({
                    ...item,
                    productName: item.product?.name || 'Unknown Product'
                })),
                subtotal: data.subtotal,
                reference: data.reference,
                orderDate: data.orderDate,
                status: data.status || 'Pending',
            } as Order;
        });
         // Sort by date descending
        orderList.sort((a, b) => b.orderDate.toMillis() - a.orderDate.toMillis());
        return orderList;
    } catch (error) {
        console.error(`Error fetching orders for user ${userId}: `, error);
        return [];
    }
}
