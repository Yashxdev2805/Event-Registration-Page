import type { Request, Response, NextFunction } from 'express';

export class IngressCircuitBreaker {
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly maxRequestsPerSec: number;
  private readonly windowMs = 1000; // 1 second window

  constructor(maxRequestsPerSec = 100) {
    this.maxRequestsPerSec = maxRequestsPerSec;
  }

  public middleware() {
    return (_req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();

      // Reset sliding window
      if (now - this.windowStart > this.windowMs) {
        this.windowStart = now;
        this.requestCount = 0;
      }

      this.requestCount++;

      // Volumetric DoS Protection Trigger
      if (this.requestCount > this.maxRequestsPerSec) {
        res.setHeader('Retry-After', '1');
        res.status(503).json({
          type: 'https://ecell.uietkuk.ac.in/errors/circuit-breaker-tripped',
          title: 'Service Temporarily Throttled',
          status: 503,
          detail: 'High volumetric ingress surge detected. Ingress circuit breaker tripped to protect downstream database consistency.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  }

  public getStats() {
    return {
      currentWindowRequests: this.requestCount,
      limitPerSec: this.maxRequestsPerSec,
      healthy: this.requestCount <= this.maxRequestsPerSec,
    };
  }
}

export const globalCircuitBreaker = new IngressCircuitBreaker(100);
