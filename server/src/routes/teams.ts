import { Router } from 'express';
import type { Request, Response } from 'express';
import { store } from '../services/store.js';

export const teamsRouter = Router();

/**
 * GET /api/teams
 * Public Application Roster API with PII masking and pagination
 */
teamsRouter.get('/', (req: Request, res: Response): void => {
  const query = (req.query.search as string) || '';
  const trackId = (req.query.track as string) || 'all';
  const status = (req.query.status as string) || 'all';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);

  const result = store.getPublicTeams({ query, trackId, status, page, limit });

  // CDN Cache header (public, cache for 15 seconds)
  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');

  res.json({
    success: true,
    ...result,
  });
});

/**
 * POST /api/teams/lookup
 * Participant Founder Self-Service Docket Lookup
 */
teamsRouter.post('/lookup', (req: Request, res: Response): void => {
  const { referenceId, leaderEmail } = req.body;

  if (!referenceId || !leaderEmail) {
    res.status(400).json({
      type: 'https://ecell.uietkuk.ac.in/errors/missing-credentials',
      title: 'Missing Lookup Credentials',
      status: 400,
      detail: 'Both referenceId and leaderEmail are required to look up your startup docket.',
    });
    return;
  }

  const docket = store.lookupTeamDocket(referenceId, leaderEmail);

  if (!docket) {
    res.status(404).json({
      type: 'https://ecell.uietkuk.ac.in/errors/docket-not-found',
      title: 'Docket Not Found',
      status: 404,
      detail: 'No registered team was found matching the provided Reference ID and Leader Email.',
    });
    return;
  }

  res.json({
    success: true,
    docket,
  });
});

/**
 * GET /api/teams/check-collision
 * Real-time debounced startup name collision check
 */
teamsRouter.get('/check-collision', (req: Request, res: Response): void => {
  const name = (req.query.name as string) || '';

  if (!name || name.trim().length < 2) {
    res.json({ available: true });
    return;
  }

  const available = store.checkTeamNameAvailability(name);
  res.json({
    available,
    name: name.trim(),
  });
});
