import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { sendWelcomeEmail } from '@/lib/email';

// This is a basic schema for validation. In a real app, you'd use a library like Zod.
interface CreateUserRequest {
    uid: string;
    name: string;
    email: string;
}

export async function POST(request: Request) {
    try {
        const body: CreateUserRequest = await request.json();
        const { uid, name, email } = body;

        // Basic validation
        if (!uid || !name || !email) {
            return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }

        // Use the Firebase Admin SDK to create the user document
        await adminDb.collection('users').doc(uid).set({
            name,
            email,
            role: 'customer', // Default role for new users
        });
        
        // After creating user, send welcome email
        try {
            await sendWelcomeEmail({ to: email, name });
        } catch (emailError) {
            console.error(`Failed to send welcome email to ${email}`, emailError);
            // Do not block the response for email failure, just log it.
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error('Error creating user document:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, message: `Error creating user document: ${errorMessage}` }, { status: 500 });
    }
}
