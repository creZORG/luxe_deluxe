
import * as admin from 'firebase-admin';

let app: admin.app.App;

// This configuration is intended to be used in a server environment
// that has Application Default Credentials configured.
// For local development, you would set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable to point to your service account key file.
if (!admin.apps.length) {
    try {
        app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.error("Firebase admin initialization error", e);
        // We are not throwing an error here anymore to prevent app crashes at startup.
        // Functions that depend on adminDb will fail gracefully if initialization fails.
        console.log('Admin SDK not initialized. Server-side admin functions will not be available.');
    }
} else {
    app = admin.app();
}

// These exports might be undefined if initialization fails.
// Code using them should handle this possibility.
export const adminDb = app ? admin.firestore() : undefined;
export const adminAuth = app ? admin.auth() : undefined;
export default app;
