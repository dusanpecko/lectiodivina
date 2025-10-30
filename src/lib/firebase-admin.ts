// Firebase Admin SDK initialization
import * as admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | null = null;

/**
 * Inicializuje Firebase Admin SDK
 * Používa service account credentials z environment variables
 */
export function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // Skontroluj či už existuje
    try {
      firebaseAdmin = admin.app();
      console.log('✅ Firebase Admin SDK already initialized');
      return firebaseAdmin;
    } catch {
      // Neexistuje, pokračujeme s inicializáciou
    }

    // Skontroluj či sú dostupné credentials
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️ Firebase Admin credentials not configured. FCM will not work.');
      console.warn('Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      return null;
    }

    // Inicializuj Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

/**
 * Získa Firebase Admin instance
 */
export function getFirebaseAdmin(): admin.app.App | null {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

/**
 * Získa Firebase Messaging instance
 */
export function getMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseAdmin();
  if (!app) {
    return null;
  }
  return app.messaging();
}

/**
 * Odošle push notifikáciu na konkrétne FCM tokeny
 */
export async function sendPushNotification(
  tokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>,
) {
  const messaging = getMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized');
  }

  if (tokens.length === 0) {
    console.warn('⚠️ No tokens provided for push notification');
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(`✅ Push notification sent: ${response.successCount} successful, ${response.failureCount} failed`);

    // Log failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed token: ${tokens[idx]}, error: ${resp.error?.message}`);
        }
      });
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
}


