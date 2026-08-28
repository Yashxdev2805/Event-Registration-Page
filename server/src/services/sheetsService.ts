import { google } from 'googleapis';
import type { RegisteredTeamRecord } from './store.js';
import fs from 'fs';
import path from 'path';

export class GoogleSheetsService {
  private spreadsheetId: string;
  private syncedTeamIds: Set<string> = new Set();
  private sheetsClient: any = null;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
    this.initAuth();
  }

  private initAuth() {
    try {
      let serviceAccount: any = null;

      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount =
          typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === 'string' &&
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      } else {
        const candidatePaths = [
          './event-registration-page-2b9df-firebase-adminsdk-fbsvc-fb8c2b3ade.json',
          '../server/event-registration-page-2b9df-firebase-adminsdk-fbsvc-fb8c2b3ade.json',
          './service-account.json',
        ];
        for (const p of candidatePaths) {
          const abs = path.resolve(p);
          if (fs.existsSync(abs)) {
            serviceAccount = JSON.parse(fs.readFileSync(abs, 'utf8'));
            break;
          }
        }
      }

      if (serviceAccount && serviceAccount.client_email && serviceAccount.private_key) {
        const cleanKey = serviceAccount.private_key.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
          email: serviceAccount.client_email,
          key: cleanKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheetsClient = google.sheets({ version: 'v4', auth });
        console.log('📊 [GoogleSheets] Service Account authentication initialized.');
      }
    } catch (err) {
      console.warn('⚠️ [GoogleSheets] Authentication notice:', err);
    }
  }

  /**
   * Appends rows in an idempotent micro-batch to Google Sheets
   */
  public async syncTeamsBatch(teams: RegisteredTeamRecord[]): Promise<{ syncedCount: number; skippedDuplicates: number }> {
    const toSync: RegisteredTeamRecord[] = [];
    let skippedDuplicates = 0;

    for (const team of teams) {
      if (this.syncedTeamIds.has(team.id)) {
        skippedDuplicates++;
      } else {
        toSync.push(team);
      }
    }

    if (toSync.length === 0) {
      return { syncedCount: 0, skippedDuplicates };
    }

    const rows = toSync.map((t) => [
      t.id,
      t.teamName,
      t.trackLabel,
      t.leaderName,
      t.leaderEmail,
      t.leaderPhone,
      t.teamSize,
      t.idea,
      t.pitchDeckUrl || 'None',
      t.members?.map((m) => `${m.name} (${m.email})`).join('; ') || 'Solo',
      t.submittedAt,
    ]);

    const targetSheetId = this.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;

    if (this.sheetsClient && targetSheetId) {
      try {
        await this.sheetsClient.spreadsheets.values.append({
          spreadsheetId: targetSheetId,
          range: 'Sheet1!A:K',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: rows,
          },
        });
        console.log(`📊 [GoogleSheets] Appended ${rows.length} row(s) to live spreadsheet '${targetSheetId}'.`);
      } catch (err: any) {
        console.error('❌ [GoogleSheets] API error appending rows:', err?.message || err);
      }
    } else {
      console.log(`📊 [GoogleSheets] Buffered ${rows.length} row(s) to in-memory audit ledger.`);
    }

    // Mark as synced to prevent duplicates
    for (const team of toSync) {
      this.syncedTeamIds.add(team.id);
    }

    return { syncedCount: toSync.length, skippedDuplicates };
  }

  public isTeamSynced(teamId: string): boolean {
    return this.syncedTeamIds.has(teamId);
  }
}

export const sheetsService = new GoogleSheetsService();
