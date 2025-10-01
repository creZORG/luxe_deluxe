
import * as admin from 'firebase-admin';

let app: admin.app.App;

// Check if the environment variable for a service account is set.
// This is useful for local development. In a hosted environment like
// Firebase Hosting or Cloud Run, Google provides the credentials automatically.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Initializing Firebase Admin with service account.");
} else {
    console.log("Initializing Firebase Admin with Application Default Credentials.");
}


if (!admin.apps.length) {
    try {
        app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.error("Firebase admin initialization error", e);
        // Throwing the error to make it visible, as a silent failure can cause issues downstream
        throw new Error(`Firebase admin initialization failed: ${(e as Error).message}`);
    }
} else {
    app = admin.app();
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default app;
