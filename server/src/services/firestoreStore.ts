import { createHash } from 'crypto';
import type { RegistrationFormData } from '../schemas/registration.schema.js';
import { TRACK_MAP } from '../schemas/registration.schema.js';
import { db } from './firebase.js';
import { store as memoryStore, type RegisteredTeamRecord, type TransactionResult } from './store.js';

export interface FirestoreOutboxDoc {
  id: string;
  type: 'TEAM_REGISTERED';
  payload: RegisteredTeamRecord;
  createdAt: string;
  processed: boolean;
  processedAt?: string;
  expireAt: string; // 7-day TTL field
  attempts: number;
  lastError?: string;
}

export function normalizeEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  const atIdx = clean.indexOf('@');
  if (atIdx === -1) return clean;
  const local = clean.slice(0, atIdx);
  const domain = clean.slice(atIdx + 1);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const plusIdx = local.indexOf('+');
    const baseLocal = plusIdx === -1 ? local : local.slice(0, plusIdx);
    return `${baseLocal.replace(/\./g, '')}@${domain}`;
  }
  return clean;
}

export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

export function hashKey(prefix: string, value: string): string {
  return `${prefix}_${createHash('sha256').update(value).digest('hex')}`;
}

export class FirestoreTransactionEngine {
  /**
   * Executes atomic Multi-Document Firestore Transaction:
   * - Sorted alphabetical lock targets to prevent deadlocks
   * - Atomic reservation check on emails, phones, and team name
   * - Transactional Outbox write with 7-Day TTL timestamp
   */
  public async executeRegistrationTransaction(formData: RegistrationFormData): Promise<TransactionResult> {
    // If Firestore is not connected, use the optimized in-memory store engine
    if (!db) {
      return memoryStore.executeAtomicRegistration(formData);
    }

    const leaderEmailNorm = normalizeEmail(formData.email);
    const leaderPhoneNorm = normalizePhone(formData.phone);
    const teamNameLower = formData.teamName.trim().toLowerCase();
    const size = parseInt(formData.teamSize, 10);

    // Prepare lock keys
    const lockTargets: Array<{ key: string; raw: string; type: 'EMAIL' | 'PHONE' | 'TEAM_NAME' }> = [
      { key: hashKey('email', leaderEmailNorm), raw: formData.email, type: 'EMAIL' },
      { key: hashKey('name', teamNameLower), raw: formData.teamName, type: 'TEAM_NAME' },
    ];

    if (leaderPhoneNorm) {
      lockTargets.push({ key: hashKey('phone', leaderPhoneNorm), raw: formData.phone, type: 'PHONE' });
    }

    const activeMembers: Array<{ name: string; email: string; phone?: string }> = [];
    if (formData.members && size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const m = formData.members[i];
        if (m && m.name && m.email) {
          const mEmailNorm = normalizeEmail(m.email);
          const mPhoneNorm = normalizePhone(m.phone);

          lockTargets.push({ key: hashKey('email', mEmailNorm), raw: m.email, type: 'EMAIL' });
          if (mPhoneNorm) {
            lockTargets.push({ key: hashKey('phone', mPhoneNorm), raw: m.phone || '', type: 'PHONE' });
          }

          activeMembers.push({
            name: m.name.trim(),
            email: m.email.trim(),
            phone: mPhoneNorm,
          });
        }
      }
    }

    // ── STEP 1: Sort all lock targets alphabetically (Enforces Global Acquisition Order) ──
    lockTargets.sort((a, b) => a.key.localeCompare(b.key));

    const teamId = `EC26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date();
    const nowIso = now.toISOString();
    const expireAtIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 Days
    const trackObj = TRACK_MAP[formData.track];

    const newRecord: RegisteredTeamRecord = {
      id: teamId,
      teamName: formData.teamName.trim(),
      leaderName: formData.name.trim(),
      leaderEmail: formData.email.trim(),
      leaderPhone: leaderPhoneNorm,
      teamSize: formData.teamSize,
      trackId: formData.track,
      trackLabel: trackObj ? trackObj.label : formData.track,
      idea: formData.idea.trim(),
      pitchDeckUrl: formData.pitchDeckUrl?.trim(),
      members: activeMembers,
      submittedAt: nowIso.split('T')[0],
      status: 'Stage 1 Submitted',
    };

    const outboxEventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const outboxDoc: FirestoreOutboxDoc = {
      id: outboxEventId,
      type: 'TEAM_REGISTERED',
      payload: newRecord,
      createdAt: nowIso,
      processed: false,
      expireAt: expireAtIso,
      attempts: 0,
    };

    try {
      // ── STEP 2: Execute Atomic Firestore Multi-Document Transaction ──
      const result = await db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
        // A. Read all reservation locks in sorted order
        for (const target of lockTargets) {
          const lockRef = db!.collection('reservations').doc(target.key);
          const lockDoc = await transaction.get(lockRef);

          if (lockDoc.exists) {
            let conflictMsg = `The identity value '${target.raw}' is already registered with another team.`;
            if (target.type === 'EMAIL') {
              conflictMsg = `The email '${target.raw}' is already registered with another team. Each person can only participate in one team.`;
            } else if (target.type === 'PHONE') {
              conflictMsg = `The phone number '${target.raw}' is already associated with another registered team.`;
            } else if (target.type === 'TEAM_NAME') {
              conflictMsg = `A startup with the name '${target.raw}' has already registered. Please choose a distinct name.`;
            }

            return {
              success: false,
              conflictType: target.type,
              conflictMessage: conflictMsg,
            };
          }
        }

        // B. Commit all reservation locks
        for (const target of lockTargets) {
          const lockRef = db!.collection('reservations').doc(target.key);
          transaction.set(lockRef, {
            lockedAt: nowIso,
            teamId,
            type: target.type,
            raw: target.raw,
          });
        }

        // C. Commit the primary team application docket
        const teamRef = db!.collection('teams').doc(teamId);
        transaction.set(teamRef, {
          ...newRecord,
          allParticipantEmails: [leaderEmailNorm, ...activeMembers.map((m) => normalizeEmail(m.email))],
          allParticipantPhones: [leaderPhoneNorm, ...activeMembers.map((m) => normalizePhone(m.phone)).filter(Boolean)],
        });

        // D. Commit the transactional outbox event (Zero Dual-Write Loss)
        const outboxRef = db!.collection('outbox').doc(outboxEventId);
        transaction.set(outboxRef, outboxDoc);

        return {
          success: true,
          data: newRecord,
          outboxEvent: outboxDoc as any,
        };
      });

      return result as TransactionResult;
    } catch (error: any) {
      console.error('❌ [FirestoreTx] Transaction execution aborted:', error);
      return {
        success: false,
        conflictType: 'TEAM_NAME',
        conflictMessage: 'A concurrent registration conflict occurred. Please retry your submission.',
      };
    }
  }

  /**
   * Outbox Purger: Deletes processed events older than 7 days
   */
  public async purgeStaleOutboxDocuments(retentionDays = 7): Promise<number> {
    if (!db) return 0;

    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const staleQuery = await db
      .collection('outbox')
      .where('processed', '==', true)
      .where('processedAt', '<=', cutoff)
      .limit(500)
      .get();

    if (staleQuery.empty) return 0;

    const batch = db.batch();
    staleQuery.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`🧹 [OutboxPurger] Purged ${staleQuery.size} stale outbox documents from Firestore.`);
    return staleQuery.size;
  }
}

export const firestoreEngine = new FirestoreTransactionEngine();
