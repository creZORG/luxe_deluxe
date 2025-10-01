
import * as admin from 'firebase-admin';
import { firebaseConfig } from '../firebase/config';

let app: admin.app.App;

if (!admin.apps.length) {
    try {
        app = admin.initializeApp({
            projectId: firebaseConfig.projectId,
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
