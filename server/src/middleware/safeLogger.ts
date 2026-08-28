import type { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const INDIAN_PHONE_REGEX = /\b(?:\+91|91)?[6-9]\d{9}\b/g;
const SENSITIVE_KEYS = ['password', 'secret', 'token', 'authorization', 'apiKey', 'privateKey', 'key'];

/**
 * Sanitizes any string by redacting PII (emails, phone numbers, auth secrets)
 */
export function redactPII(input: string): string {
  if (typeof input !== 'string') return input;

  return input
    .replace(EMAIL_REGEX, (email) => {
      const atIdx = email.indexOf('@');
      if (atIdx <= 0) return '****@domain.com';
      const local = email.slice(0, atIdx);
      const domain = email.slice(atIdx + 1);
      const visible = local.length > 2 ? `${local[0]}****${local[local.length - 1]}` : `${local[0]}****`;
      return `${visible}@${domain}`;
    })
    .replace(INDIAN_PHONE_REGEX, (phone) => {
      const clean = phone.slice(-10);
      return `******${clean.slice(-4)}`;
    });
}

/**
 * Recursively redacts PII from objects, arrays, and error stacks
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return redactPII(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitiveKey = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()));
    if (isSensitiveKey) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = redactPII(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Zero-PII Express Request Logging Middleware
 */
export function zeroPiiLoggingMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const sanitizedBody = sanitizeObject(req.body);
  const sanitizedQuery = sanitizeObject(req.query);

  // Attach sanitized audit clone for logger
  (req as any).sanitizedAudit = {
    method: req.method,
    path: req.path,
    ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    query: sanitizedQuery,
    body: sanitizedBody,
    timestamp: new Date().toISOString(),
  };

  next();
}
