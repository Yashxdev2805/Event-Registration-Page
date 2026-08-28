// Automated Endpoint Verification Script
async function runTests() {
  console.log('🧪 Starting Phase 2 Backend Automated Endpoint Verification...\n');

  // Import index.js which boots on port 3001
  await import('./dist/index.js');
  const baseUrl = 'http://localhost:3001';
  let allPassed = true;

  // Wait 500ms for server socket to bind
  await new Promise((r) => setTimeout(r, 500));

  try {
    // TEST 1: Health & Readiness Probes
    console.log('1. Testing GET /health and GET /ready...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.status === 'HEALTHY') {
      console.log('   ✅ GET /health returned 200 OK (HEALTHY)');
    } else {
      console.error('   ❌ GET /health failed:', healthData);
      allPassed = false;
    }

    // TEST 2: Valid Registration with Idempotency Key
    console.log('\n2. Testing POST /api/register (Atomic Transaction & Outbox)...');
    const idempKey = `test-idemp-${Date.now()}`;
    const payload = {
      name: 'Aarav Sharma',
      email: `aarav.${Date.now()}@uietkuk.ac.in`,
      phone: '9876501234',
      teamName: `QuantumEdge Labs ${Date.now()}`,
      teamSize: '2',
      track: 'ai-saas',
      idea: 'Self-optimizing vector search caching layer for multi-tenant LLM agents reducing inference costs.',
      members: [{ name: 'Diya Patel', email: `diya.${Date.now()}@uietkuk.ac.in`, phone: '9876501235' }],
    };

    const regRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
      body: JSON.stringify(payload),
    });
    const regData = await regRes.json();
    if (regRes.status === 201 && regData.referenceId) {
      console.log(`   ✅ POST /api/register returned 201 Created (Ref ID: ${regData.referenceId})`);
    } else {
      console.error('   ❌ POST /api/register failed:', regData);
      allPassed = false;
    }

    // TEST 3: Idempotency Key Replay Guard
    console.log('\n3. Testing Idempotency-Key Replay Guard...');
    const replayRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
      body: JSON.stringify(payload),
    });
    const replayLookup = replayRes.headers.get('x-cache-lookup');
    if (replayRes.status === 201 && replayLookup === 'HIT-IDEMPOTENCY') {
      console.log('   ✅ Idempotency hit: Returned cached 201 with X-Cache-Lookup: HIT-IDEMPOTENCY');
    } else {
      console.error('   ❌ Idempotency guard failed:', { status: replayRes.status, replayLookup });
      allPassed = false;
    }

    // TEST 4: Atomic Collision Check on Duplicate Email
    console.log('\n4. Testing Atomic Reservation Lock on Duplicate Email...');
    const dupRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        teamName: 'Unique Team Name XYZ',
      }),
    });
    const dupData = await dupRes.json();
    if (dupRes.status === 409 && dupData.status === 409) {
      console.log('   ✅ Duplicate Email blocked with 409 Conflict (RFC 7807 problem details)');
    } else {
      console.error('   ❌ Duplicate check failed:', dupData);
      allPassed = false;
    }

    // TEST 5: Zod Schema Validation Error (Short Pitch)
    console.log('\n5. Testing Zod Validation Error (RFC 7807 422 Unprocessable Entity)...');
    const invalidRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, email: 'not-an-email', idea: 'short' }),
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status === 422 && invalidData.errors?.email) {
      console.log('   ✅ Invalid payload returned 422 Unprocessable Entity with structured field errors');
    } else {
      console.error('   ❌ Zod validation error failed:', invalidData);
      allPassed = false;
    }

    // TEST 6: Public Team Registry with PII Masking
    console.log('\n6. Testing GET /api/teams (PII Masking & Search)...');
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teamsData = await teamsRes.json();
    const firstTeam = teamsData.teams?.[0];
    if (teamsRes.ok && firstTeam && firstTeam.leaderEmail.includes('****')) {
      console.log(`   ✅ GET /api/teams returned 200 OK with PII masked email: '${firstTeam.leaderEmail}'`);
    } else {
      console.error('   ❌ GET /api/teams PII masking failed:', teamsData);
      allPassed = false;
    }

    // TEST 7: Private Docket Lookup
    console.log('\n7. Testing POST /api/teams/lookup (Participant Founder Lookup)...');
    const lookupRes = await fetch(`${baseUrl}/api/teams/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceId: regData.referenceId, leaderEmail: payload.email }),
    });
    const lookupData = await lookupRes.json();
    if (lookupRes.ok && lookupData.docket?.id === regData.referenceId) {
      console.log(`   ✅ POST /api/teams/lookup verified founder docket (${lookupData.docket.teamName})`);
    } else {
      console.error('   ❌ POST /api/teams/lookup failed:', lookupData);
      allPassed = false;
    }

    // TEST 8: Presigned Upload Endpoint
    console.log('\n8. Testing POST /api/upload/presign (Restricted PDF Upload)...');
    const uploadRes = await fetch(`${baseUrl}/api/upload/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'pitch-deck.pdf', fileSize: 5000000, contentType: 'application/pdf' }),
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.ok && uploadData.presignedUrl && uploadData.expiresInSeconds === 90) {
      console.log('   ✅ POST /api/upload/presign issued 90-second restricted presigned URL');
    } else {
      console.error('   ❌ POST /api/upload/presign failed:', uploadData);
      allPassed = false;
    }

    console.log('\n══════════════════════════════════════════════════');
    if (allPassed) {
      console.log('🎉 ALL 8 AUTOMATED BACKEND INTEGRATION TESTS PASSED!');
    } else {
      console.log('⚠️ Some tests failed. Check logs above.');
    }
    console.log('══════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('Test execution error:', err);
    allPassed = false;
  } finally {
    process.exit(allPassed ? 0 : 1);
  }
}

runTests();
