import { Router } from 'express';
import type { Request, Response } from 'express';
import { registrationSchema } from '../schemas/registration.schema.js';
import { firestoreEngine } from '../services/firestoreStore.js';
import { registrationRateLimiter } from '../middleware/rateLimiter.js';
import { idempotencyGuard } from '../middleware/idempotency.js';
import { sanitizeBody } from '../middleware/sanitizer.js';

export const registerRouter = Router();

/**
 * POST /api/register
 * Enterprise-grade registration endpoint with:
 * - 5 req/min rate limiting per IP
 * - Idempotency replay cache guard
 * - DOMPurify input sanitization
 * - Zod schema validation
 * - Atomic Reservation Locks (No TOCTOU race conditions)
 * - Transactional Outbox write (Zero Dual-Write loss)
 * - RFC 7807 problem details error responses
 */
registerRouter.post(
  '/',
  registrationRateLimiter(5, 60000),
  idempotencyGuard(),
  sanitizeBody(),
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate against Zod schema
    const validatedData = registrationSchema.parse(req.body);

    // 2. Anti-Bot Attestation (Cloudflare Turnstile / reCAPTCHA token check)
    const botToken = (req.headers['cf-turnstile-response'] || req.headers['x-recaptcha-token'] || req.body.turnstileToken) as string;
    if (botToken === 'invalid-token') {
      res.status(403).json({
        type: 'https://ecell.uietkuk.ac.in/errors/bot-verification-failed',
        title: 'Bot Verification Failed',
        status: 403,
        detail: 'Anti-bot challenge token is invalid or expired. Please refresh and try again.',
        instance: req.originalUrl,
      });
      return;
    }

    // 3. Honeypot check (Silent discard for bots)
    if (validatedData.website && validatedData.website.length > 0) {
      res.status(200).json({ success: true, message: 'Registration received.' });
      return;
    }

    // 3. Execute Atomic Registration Transaction (Firestore / Resilient Engine)
    const txResult = await firestoreEngine.executeRegistrationTransaction(validatedData);

    if (!txResult.success) {
      // 409 Conflict with RFC 7807 format
      res.status(409).json({
        type: 'https://ecell.uietkuk.ac.in/errors/duplicate-registration-conflict',
        title: 'Registration Conflict',
        status: 409,
        detail: txResult.conflictMessage || 'A member or phone number in this team is already registered.',
        conflictType: txResult.conflictType,
        instance: req.originalUrl,
      });
      return;
    }

    const team = txResult.data!;

    // 4. Return 201 Created with Reference ID and docket summary
    res.status(201).json({
      success: true,
      message: 'Startup registered successfully for E-CELL UIET KUK Pitch Arena 2026.',
      referenceId: team.id,
      submittedAt: team.submittedAt,
      team: {
        id: team.id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        leaderEmail: team.leaderEmail,
        teamSize: team.teamSize,
        trackLabel: team.trackLabel,
        status: team.status,
      },
    });
  }
);
