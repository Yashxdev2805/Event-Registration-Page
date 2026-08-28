import type { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  statusCode: number;
  body: any;
  headers: Record<string, string>;
  createdAt: number;
}

// In-Memory Idempotency Cache (5-Minute TTL)
const idempotencyCache = new Map<string, CachedResponse>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Idempotency Key Guard Middleware
 * Prevents mobile client network retries from executing multiple registrations
 */
export function idempotencyGuard() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers['idempotency-key'] as string;

    if (!key) {
      // Proceed without caching if no idempotency key was supplied
      return next();
    }

    const now = Date.now();
    const cached = idempotencyCache.get(key);

    if (cached) {
      if (now - cached.createdAt < CACHE_TTL_MS) {
        res.setHeader('X-Cache-Lookup', 'HIT-IDEMPOTENCY');
        for (const [headerName, headerValue] of Object.entries(cached.headers)) {
          res.setHeader(headerName, headerValue);
        }
        res.status(cached.statusCode).json(cached.body);
        return;
      } else {
        idempotencyCache.delete(key);
      }
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      // Cache successful creations and conflicts
      if (res.statusCode >= 200 && res.statusCode < 500) {
        idempotencyCache.set(key, {
          statusCode: res.statusCode,
          body,
          headers: { 'Content-Type': 'application/json' },
          createdAt: Date.now(),
        });
      }
      return originalJson(body);
    };

    next();
  };
}
