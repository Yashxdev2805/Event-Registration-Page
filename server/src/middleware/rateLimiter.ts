import type { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-Memory Sliding Window Bucket for Local Development / Offline fallback
class InMemorySlidingWindowLimiter {
  private windows: Map<string, number[]> = new Map();

  public limit(key: string, maxRequests: number, windowMs: number): { success: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = this.windows.get(key) || [];

    // Filter out timestamps outside the sliding window
    const valid = timestamps.filter((ts) => now - ts < windowMs);

    if (valid.length >= maxRequests) {
      this.windows.set(key, valid);
      return { success: false, remaining: 0 };
    }

    valid.push(now);
    this.windows.set(key, valid);
    return { success: true, remaining: maxRequests - valid.length };
  }
}

const memoryLimiter = new InMemorySlidingWindowLimiter();

let upstashLimiter: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: false,
    });
  } catch {
    upstashLimiter = null;
  }
}

/**
 * Sliding-Window Rate Limiter Middleware (5 requests / 60s per IP for registration)
 */
export function registrationRateLimiter(maxRequests = 5, windowMs = 60000) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : Array.isArray(forwarded)
        ? forwarded[0]
        : null) ||
      req.ip ||
      '127.0.0.1';
    const key = `ratelimit:reg:${ip}`;

    if (upstashLimiter) {
      try {
        const { success, remaining } = await upstashLimiter.limit(key);
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        if (!success) {
          res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
          res.status(429).json({
            type: 'https://ecell.uietkuk.ac.in/errors/rate-limit-exceeded',
            title: 'Too Many Requests',
            status: 429,
            detail: 'Registration rate limit exceeded. You may only submit 5 registrations per minute.',
            instance: req.originalUrl,
          });
          return;
        }
        return next();
      } catch {
        // Fallback to in-memory limiter on Redis transient error
      }
    }

    const { success, remaining } = memoryLimiter.limit(key, maxRequests, windowMs);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!success) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
      res.status(429).json({
        type: 'https://ecell.uietkuk.ac.in/errors/rate-limit-exceeded',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Registration rate limit exceeded. Please wait 60 seconds before submitting again.',
        instance: req.originalUrl,
      });
      return;
    }

    next();
  };
}
