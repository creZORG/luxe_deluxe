
import * as admin from 'firebase-admin';

let app: admin.app.App;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountKey) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please download your service account key from the Firebase console and set it in your .env file.');
}
if (!projectId) {
    throw new Error('The FIREBASE_PROJECT_ID environment variable is not set.');
}


if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId,
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
