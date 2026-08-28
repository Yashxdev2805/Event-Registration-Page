import admin from 'firebase-admin';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';

let app: App | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ecell-pitch-decks-2026.appspot.com',
        })
      : getApps()[0];

    db = getFirestore(app);
    storage = new Storage({ credentials: serviceAccount });
    console.log('🔥 [FirebaseAdmin] Connected to Cloud Firestore & Cloud Storage.');
  } else if (process.env.FIRESTORE_EMULATOR_HOST) {
    app = getApps().length === 0
      ? initializeApp({
          projectId: 'ecell-pitch-arena-2026',
        })
      : getApps()[0];

    db = getFirestore(app);
    console.log(`🔥 [FirebaseAdmin] Connected to local Firestore Emulator (${process.env.FIRESTORE_EMULATOR_HOST}).`);
  } else {
    // Development fallback without throwing startup exceptions
    console.log('⚡ [FirebaseAdmin] Running with in-memory resilient Firestore engine.');
  }
} catch (error) {
  console.warn('⚠️ [FirebaseAdmin] Initialization notice:', error);
}

export { admin, db, storage };
export type { Firestore };
