import { createHash } from 'crypto';
import type { RegistrationFormData } from '../schemas/registration.schema.js';
import { TRACK_MAP } from '../schemas/registration.schema.js';

export interface RegisteredTeamRecord {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  teamSize: string;
  trackId: string;
  trackLabel: string;
  idea: string;
  pitchDeckUrl?: string;
  members?: Array<{ name?: string; email?: string; phone?: string }>;
  submittedAt: string;
  status: 'Stage 1 Submitted' | 'Under Review' | 'Shortlisted for Mentorship' | 'Demo Day Finalist';
  score?: number;
}

export interface OutboxEvent {
  id: string;
  type: 'TEAM_REGISTERED';
  payload: RegisteredTeamRecord;
  createdAt: string;
  expireAt?: string;
  processed: boolean;
  attempts: number;
  lastError?: string;
}

export interface TransactionResult {
  success: boolean;
  data?: RegisteredTeamRecord;
  outboxEvent?: OutboxEvent;
  conflictType?: 'EMAIL' | 'PHONE' | 'TEAM_NAME';
  conflictMessage?: string;
}

/**
 * Normalizes email address (lowercase, trim, strips Gmail dot/plus addressing)
 */
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

/**
 * Normalizes 10-digit Indian phone number
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Computes deterministic SHA-256 hash for atomic reservation lock keys
 */
export function hashKey(prefix: string, value: string): string {
  return `${prefix}:${createHash('sha256').update(value).digest('hex')}`;
}

/**
 * In-Memory Transactional Store with Atomic Reservation Locks & Outbox Pattern
 * Optimized for O(1) Lookups, O(1) Name Collision Checks, and O(K) Pending Event Retrieval.
 */
class DataStore {
  private teams: Map<string, RegisteredTeamRecord> = new Map();
  // Newest-first ordered list to eliminate O(N log N) sorting on every query
  private teamsList: RegisteredTeamRecord[] = [];
  // O(1) Set of normalized startup names
  private teamNames: Set<string> = new Set();
  // Atomic Reservation Locks: Key -> Lock Metadata
  private reservationLocks: Map<string, { lockedAt: string; teamId: string; type: string }> = new Map();
  // Transactional Outbox Collection
  private outbox: Map<string, OutboxEvent> = new Map();
  // O(1) Set of pending outbox event IDs
  private pendingOutboxIds: Set<string> = new Set();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const seeds: RegisteredTeamRecord[] = [
      {
        id: 'EC26-A8K2M',
        teamName: 'NovaSpark AI',
        leaderName: 'Priya Sharma',
        leaderEmail: 'priya.s@uietkuk.ac.in',
        leaderPhone: '9876543210',
        teamSize: '3',
        trackId: 'ai-saas',
        trackLabel: 'AI & GenAI / SaaS',
        idea: 'Autonomous multi-agent customer support orchestrator for SME e-commerce merchants with self-healing resolution flows.',
        pitchDeckUrl: 'https://drive.google.com/file/d/novaspark-pitch',
        members: [
          { name: 'Ananya Gupta', email: 'ananya.g@uietkuk.ac.in', phone: '9811223344' },
          { name: 'Rohan Mehta', email: 'rohan.m@uietkuk.ac.in', phone: '9822334455' },
        ],
        submittedAt: '2026-03-24',
        status: 'Shortlisted for Mentorship',
        score: 88,
      },
      {
        id: 'EC26-Z9P4L',
        teamName: 'EcoCharge Dynamics',
        leaderName: 'Kavya Patel',
        leaderEmail: 'kavya.patel@uietkuk.ac.in',
        leaderPhone: '9876543210',
        teamSize: '3',
        trackId: 'cleantech',
        trackLabel: 'Climate & Sustainability',
        idea: 'Smart solar-assisted EV battery swapping station network with automated thermal balancing and predictive demand dispatching across urban hubs.',
        pitchDeckUrl: 'https://drive.google.com/file/d/ecocharge-pitch/view',
        members: [
          { name: 'Rohan Verma', email: 'rohan.v@uietkuk.ac.in', phone: '9812345678' },
          { name: 'Sneha Rao', email: 'sneha.rao@uietkuk.ac.in', phone: '' },
        ],
        submittedAt: '2026-03-25',
        status: 'Shortlisted for Mentorship',
        score: 92,
      },
      {
        id: 'EC26-K3W7V',
        teamName: 'FinFlow Web3',
        leaderName: 'Aditya Roy',
        leaderEmail: 'aditya.roy@college.edu.in',
        leaderPhone: '9988776655',
        teamSize: '2',
        trackId: 'fintech-web3',
        trackLabel: 'FinTech & Web3',
        idea: 'Decentralized invoice discounting marketplace for MSME exporters with instant rupee settlement and automated lien verification.',
        pitchDeckUrl: 'https://canva.com/design/finflow-pitch-deck',
        members: [{ name: 'Deepak Sen', email: 'deepak.sen@college.edu.in' }],
        submittedAt: '2026-03-22',
        status: 'Under Review',
        score: 81,
      },
    ];

    for (const team of seeds) {
      this.teams.set(team.id, team);
      this.teamsList.push(team);
      this.teamNames.add(team.teamName.toLowerCase());

      // Lock leader email & phone
      this.reservationLocks.set(hashKey('email', normalizeEmail(team.leaderEmail)), {
        lockedAt: team.submittedAt,
        teamId: team.id,
        type: 'LEADER_EMAIL',
      });
      if (team.leaderPhone) {
        this.reservationLocks.set(hashKey('phone', normalizePhone(team.leaderPhone)), {
          lockedAt: team.submittedAt,
          teamId: team.id,
          type: 'LEADER_PHONE',
        });
      }
      // Lock members
      if (team.members) {
        for (const m of team.members) {
          if (m.email) {
            this.reservationLocks.set(hashKey('email', normalizeEmail(m.email)), {
              lockedAt: team.submittedAt,
              teamId: team.id,
              type: 'MEMBER_EMAIL',
            });
          }
          if (m.phone) {
            this.reservationLocks.set(hashKey('phone', normalizePhone(m.phone)), {
              lockedAt: team.submittedAt,
              teamId: team.id,
              type: 'MEMBER_PHONE',
            });
          }
        }
      }
    }
  }

  /**
   * Executes atomic registration transaction in O(1):
   * 1. Checks O(1) Set collision on team name.
   * 2. Acquires atomic reservation locks on all emails & phones.
   * 3. Persists team docket.
   * 4. Writes outbox event in the same atomic commit boundary (Zero Dual-Write Loss).
   */
  public async executeAtomicRegistration(formData: RegistrationFormData): Promise<TransactionResult> {
    const leaderEmailNorm = normalizeEmail(formData.email);
    const leaderPhoneNorm = normalizePhone(formData.phone);
    const size = parseInt(formData.teamSize, 10);

    // ── O(1) Team Name Uniqueness Check ──
    const teamNameLower = formData.teamName.trim().toLowerCase();
    if (this.teamNames.has(teamNameLower)) {
      return {
        success: false,
        conflictType: 'TEAM_NAME',
        conflictMessage: `A startup with the name '${formData.teamName}' has already registered. Please choose a distinct name.`,
      };
    }

    const requiredLocks: Array<{ key: string; raw: string; type: 'EMAIL' | 'PHONE' }> = [
      { key: hashKey('email', leaderEmailNorm), raw: formData.email, type: 'EMAIL' },
    ];

    if (leaderPhoneNorm) {
      requiredLocks.push({ key: hashKey('phone', leaderPhoneNorm), raw: formData.phone, type: 'PHONE' });
    }

    const activeMembers = [];
    if (formData.members && size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const m = formData.members[i];
        if (m && m.name && m.email) {
          const mEmailNorm = normalizeEmail(m.email);
          const mPhoneNorm = normalizePhone(m.phone);

          requiredLocks.push({ key: hashKey('email', mEmailNorm), raw: m.email, type: 'EMAIL' });
          if (mPhoneNorm) {
            requiredLocks.push({ key: hashKey('phone', mPhoneNorm), raw: m.phone || '', type: 'PHONE' });
          }

          activeMembers.push({
            name: m.name.trim(),
            email: m.email.trim(),
            phone: mPhoneNorm,
          });
        }
      }
    }

    // ── STEP 1: Check & Acquire Atomic Reservation Locks (No TOCTOU) ──
    for (const lock of requiredLocks) {
      if (this.reservationLocks.has(lock.key)) {
        return {
          success: false,
          conflictType: lock.type,
          conflictMessage:
            lock.type === 'EMAIL'
              ? `The email '${lock.raw}' is already registered with another team. Each person can only participate in one team.`
              : `The phone number '${lock.raw}' is already associated with another registered team.`,
        };
      }
    }

    // Generate unique reference ID (e.g. EC26-X8P9Q)
    const teamId = `EC26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date().toISOString();
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
      submittedAt: now.split('T')[0],
      status: 'Stage 1 Submitted',
    };

    // ── STEP 2: Atomic Commit - Locks, Record, Index, and Outbox Event ──
    for (const lock of requiredLocks) {
      this.reservationLocks.set(lock.key, {
        lockedAt: now,
        teamId,
        type: lock.type,
      });
    }

    this.teams.set(teamId, newRecord);
    this.teamsList.unshift(newRecord); // Prepend to maintain newest-first in O(1)
    this.teamNames.add(teamNameLower);

    const outboxEvent: OutboxEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'TEAM_REGISTERED',
      payload: newRecord,
      createdAt: now,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      processed: false,
      attempts: 0,
    };

    this.outbox.set(outboxEvent.id, outboxEvent);
    this.pendingOutboxIds.add(outboxEvent.id);

    return {
      success: true,
      data: newRecord,
      outboxEvent,
    };
  }

  /**
   * Retrieves paginated public teams with O(1) pre-ordered traversal and strict PII masking
   */
  public getPublicTeams(options: {
    query?: string;
    trackId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { query = '', trackId = 'all', status = 'all', page = 1, limit = 20 } = options;
    const cleanQuery = query.trim().toLowerCase();
    const isAllTracks = trackId === 'all';
    const isAllStatuses = status === 'all';

    // Fast path if no filters
    let filtered = this.teamsList;
    if (cleanQuery || !isAllTracks || !isAllStatuses) {
      filtered = this.teamsList.filter((team) => {
        if (!isAllTracks && team.trackId !== trackId) return false;
        if (!isAllStatuses && team.status !== status) return false;
        if (!cleanQuery) return true;

        return (
          team.teamName.toLowerCase().includes(cleanQuery) ||
          team.leaderName.toLowerCase().includes(cleanQuery) ||
          team.id.toLowerCase().includes(cleanQuery) ||
          team.trackLabel.toLowerCase().includes(cleanQuery)
        );
      });
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Apply PII Masking on public output
    const masked = paginated.map((team) => ({
      id: team.id,
      teamName: team.teamName,
      leaderName: team.leaderName,
      leaderEmail: this.maskEmail(team.leaderEmail),
      teamSize: team.teamSize,
      trackId: team.trackId,
      trackLabel: team.trackLabel,
      idea: team.idea,
      pitchDeckUrl: team.pitchDeckUrl,
      memberCount: team.members ? team.members.length : 0,
      submittedAt: team.submittedAt,
      status: team.status,
    }));

    return {
      teams: masked,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Private Docket Lookup in O(1)
   */
  public lookupTeamDocket(referenceId: string, leaderEmail: string): RegisteredTeamRecord | null {
    const team = this.teams.get(referenceId.trim().toUpperCase());
    if (!team) return null;

    if (normalizeEmail(team.leaderEmail) !== normalizeEmail(leaderEmail)) {
      return null;
    }

    return team;
  }

  /**
   * Check startup name collision in O(1) constant time
   */
  public checkTeamNameAvailability(name: string): boolean {
    const clean = name.trim().toLowerCase();
    return !this.teamNames.has(clean);
  }

  /**
   * O(K) Pending Event Retrieval (only iterates active pending IDs)
   */
  public getPendingOutboxEvents(): OutboxEvent[] {
    const pending: OutboxEvent[] = [];
    for (const id of this.pendingOutboxIds) {
      const evt = this.outbox.get(id);
      if (evt && !evt.processed) {
        pending.push(evt);
      }
    }
    return pending;
  }

  /**
   * O(1) Mark Outbox Processed
   */
  public markOutboxProcessed(id: string) {
    const evt = this.outbox.get(id);
    if (evt) {
      evt.processed = true;
      this.pendingOutboxIds.delete(id);
    }
  }

  /**
   * O(1) Mark Outbox Failed
   */
  public markOutboxFailed(id: string, errorMsg: string) {
    const evt = this.outbox.get(id);
    if (evt) {
      evt.attempts++;
      evt.lastError = errorMsg;
    }
  }

  private maskEmail(email: string): string {
    const atIdx = email.indexOf('@');
    if (atIdx <= 0) return '****@domain.com';
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    const visible = local.length > 2 ? `${local[0]}****${local[local.length - 1]}` : `${local[0]}****`;
    return `${visible}@${domain}`;
  }
}

export const store = new DataStore();
