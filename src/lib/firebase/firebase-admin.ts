
import * as admin from 'firebase-admin';

let app: admin.app.App;

const serviceAccountKeyB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountKeyB64) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please Base64-encode your service account key and set it in your .env file.');
}
if (!projectId) {
    throw new Error('The FIREBASE_PROJECT_ID environment variable is not set.');
}


if (!admin.apps.length) {
    try {
        const serviceAccountJson = Buffer.from(serviceAccountKeyB64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId,
        });
    } catch (e) {
        console.error("Firebase admin initialization error", e);
        // Throwing the error to make it visible, as a silent failure can cause issues downstream
        throw new Error(`Firebase admin initialization failed: ${(e as Error).message}. Check if FIREBASE_SERVICE_ACCOUNT_KEY is a valid Base64-encoded service account JSON.`);
    }
} else {
    app = admin.app();
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default app;
