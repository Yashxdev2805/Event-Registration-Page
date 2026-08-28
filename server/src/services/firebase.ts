import admin from 'firebase-admin';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

let app: App | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;

import fs from 'fs';
import path from 'path';

let serviceAccountObj: any = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccountObj =
      typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === 'string' &&
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  } catch (err) {
    console.warn('⚠️ [FirebaseAdmin] Could not parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string.');
  }
}

// Automatically detect service account json files
const candidatePaths = [
  './event-registration-page-2b9df-firebase-adminsdk-fbsvc-fb8c2b3ade.json',
  '../server/event-registration-page-2b9df-firebase-adminsdk-fbsvc-fb8c2b3ade.json',
  './service-account.json',
  '../service-account.json',
];

if (!serviceAccountObj) {
  for (const cPath of candidatePaths) {
    const fullPath = path.resolve(cPath);
    if (fs.existsSync(fullPath)) {
      try {
        serviceAccountObj = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        console.log(`📄 [FirebaseAdmin] Loaded credentials from ${path.basename(fullPath)}`);
        break;
      } catch { /* ignore */ }
    }
  }
}

try {
  if (serviceAccountObj) {
    const serviceAccount = serviceAccountObj;

    if (serviceAccount && typeof serviceAccount === 'object' && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    app =
      getApps().length === 0
        ? initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || 'event-registration-page-2b9df',
          })
        : getApps()[0];

    db = getFirestore(app);
    console.log('🔥 [FirebaseAdmin] Connected to Cloud Firestore (Spark No-Cost Plan Active).');

    // Storage is optional on Spark Plan (Users provide Google Drive / Canva / Dropbox links)
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      try {
        storage = new Storage({ credentials: serviceAccount });
      } catch {
        // Storage optional
      }
    }
  } else if (process.env.FIRESTORE_EMULATOR_HOST) {
    app =
      getApps().length === 0
        ? initializeApp({
            projectId: 'event-registration-page-2b9df',
          })
        : getApps()[0];

    db = getFirestore(app);
    console.log(`🔥 [FirebaseAdmin] Connected to local Firestore Emulator (${process.env.FIRESTORE_EMULATOR_HOST}).`);
  } else {
    console.log('⚡ [FirebaseAdmin] Running with local resilient fallback Firestore engine.');
  }
} catch (error) {
  console.warn('⚠️ [FirebaseAdmin] Initialization notice:', error);
}

export { admin, db, storage };
export type { Firestore };
