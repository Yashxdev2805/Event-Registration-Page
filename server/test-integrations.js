import dotenv from 'dotenv';
dotenv.config();

import { emailService } from './dist/services/emailService.js';
import { sheetsService } from './dist/services/sheetsService.js';

async function testLiveIntegrations() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('⚡ TESTING LIVE BREVO EMAILS & GOOGLE SHEETS SYNC');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // 1. Test Brevo Transactional Email
  console.log('1. Dispatching test confirmation email via Brevo API...');
  const emailSuccess = await emailService.sendConfirmationEmail({
    toEmail: 'yashbir280506@gmail.com',
    toName: 'Yashbir (Lead Organizer)',
    referenceId: `EC26-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    teamName: 'E-Cell Innovation Labs',
    trackLabel: 'AI & Generative Tech',
    teamSize: '2',
  });

  if (emailSuccess) {
    console.log('   ✅ Brevo email sent successfully! Please check your inbox (yashbir280506@gmail.com).\n');
  } else {
    console.log('   ⚠️ Brevo email dispatch returned an error. Check Brevo verified sender domain.\n');
  }

  // 2. Test Google Sheets Sync
  console.log('2. Appending test row to Google Sheet (1eapaXNXgPwlzPFbGoM1_bQKooiWF0-2m9KbFtnmt7DA)...');
  try {
    const testRecord = {
      id: `EC26-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      teamName: 'Live Cloud Sync Team',
      track: 'ai-saas',
      trackLabel: 'AI & Generative Tech',
      leaderName: 'Yashbir',
      leaderEmail: 'yashbir280506@gmail.com',
      leaderPhone: '9876543210',
      teamSize: '2',
      idea: 'Real-time high concurrency pitch registration platform with Google Cloud Firestore backend.',
      pitchDeckUrl: 'https://drive.google.com/drive/folders/test-pitch-deck',
      members: [{ name: 'Co-Founder', email: 'cofounder@uietkuk.ac.in', phone: '9876543211' }],
      submittedAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const sheetsResult = await sheetsService.syncTeamsBatch([testRecord]);
    console.log(`   ✅ Google Sheets sync completed! Appended ${sheetsResult.syncedCount} row(s) to your spreadsheet.\n`);
  } catch (err) {
    console.error('   ❌ Google Sheets sync failed:', err);
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 INTEGRATION TEST RUN COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

testLiveIntegrations();
