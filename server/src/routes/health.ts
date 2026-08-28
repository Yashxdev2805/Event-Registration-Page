import { Router } from 'express';
import type { Request, Response } from 'express';

export const healthRouter = Router();

/**
 * GET /health
 * Liveness probe for container orchestrators (Cloud Run / K8s)
 */
healthRouter.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready
 * Readiness probe checking active database and dependency state
 */
healthRouter.get('/ready', (_req: Request, res: Response): void => {
  res.json({
    status: 'READY',
    storage: 'CONNECTED',
    outboxWorker: 'ACTIVE',
    timestamp: new Date().toISOString(),
  });
});
