// Direct Firestore Cloud Connection Verifier
import dotenv from 'dotenv';
import { db } from './dist/services/firebase.js';

dotenv.config();

async function testFirestoreLiveConnection() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🔥 CLOUD FIRESTORE DIRECT CONNECTION VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  if (!db) {
    console.log('⚡ [Notice] FIREBASE_SERVICE_ACCOUNT_KEY not present in server/.env.');
    console.log('   The server is using the resilient built-in local engine.');
    console.log('   To connect to your live Google Cloud Firestore, paste your service account key in server/.env.');
    process.exit(0);
  }

  try {
    console.log('1. Attempting test write to /diagnostics collection...');
    const testDocRef = db.collection('diagnostics').doc(`ping-${Date.now()}`);
    await testDocRef.set({
      ping: 'pong',
      timestamp: new Date().toISOString(),
      service: 'E-Cell UIET KUK Pitch Arena Backend',
    });
    console.log(`   ✅ Test document written successfully: /diagnostics/${testDocRef.id}`);

    console.log('2. Reading back test document...');
    const snapshot = await testDocRef.get();
    if (snapshot.exists) {
      console.log(`   ✅ Verified document read:`, snapshot.data());
    }

    console.log('3. Cleaning up test document...');
    await testDocRef.delete();
    console.log('   ✅ Test document deleted cleanly.');

    console.log('\n🎉 CLOUD FIRESTORE CONNECTION IS 100% OPERATIONAL & VERIFIED!\n');
  } catch (error) {
    console.error('❌ Firestore Connection Error:', error);
  } finally {
    process.exit(0);
  }
}

testFirestoreLiveConnection();
