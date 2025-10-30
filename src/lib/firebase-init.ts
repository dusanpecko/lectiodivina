// Initialize Firebase Admin SDK on app startup
import { initializeFirebaseAdmin } from './firebase-admin';

// Auto-initialize Firebase Admin when this module is imported
initializeFirebaseAdmin();

export { getFirebaseAdmin, getMessaging, sendPushNotification } from './firebase-admin';
