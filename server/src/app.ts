import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { registerRouter } from './routes/register.js';
import { teamsRouter } from './routes/teams.js';
import { uploadRouter } from './routes/upload.js';
import { confirmUploadRouter } from './routes/confirmUpload.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalCircuitBreaker } from './middleware/circuitBreaker.js';
import { zeroPiiLoggingMiddleware } from './middleware/safeLogger.js';

dotenv.config();

export const app = express();

app.set('trust proxy', true);

// ── Ingress Security: Strict Helmet, HSTS Preload & CSP ──
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://challenges.cloudflare.com', 'https://www.google.com/recaptcha/'],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com', 'https://www.google.com/recaptcha/'],
        connectSrc: ["'self'", 'https://storage.googleapis.com', 'https://*.upstash.io', 'https://api.brevo.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://storage.googleapis.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 Years (HSTS Preload standard)
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' }, // Anti-Clickjacking
    noSniff: true, // Anti-MIME sniffing
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ── Global Ingress Circuit Breaker (Volumetric DoS Shield) ──
app.use(globalCircuitBreaker.middleware());

// ── CORS Policy ──
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'https://ecell.uietkuk.ac.in'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'cf-turnstile-response'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Cache-Lookup', 'Retry-After'],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '16kb' })); // Strict 16KB max payload bound

// ── Zero-PII Safe Logger (Redacts Emails & Phones) ──
app.use(zeroPiiLoggingMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Root Index ──
app.get('/', (_req, res) => {
  res.json({
    service: 'E-CELL UIET KUK Pitch Arena 2026 API',
    version: '2.0.0',
    status: 'OPERATIONAL',
    security: {
      zeroTrust: true,
      circuitBreaker: globalCircuitBreaker.getStats(),
      piiSanitization: 'ACTIVE',
      hstsPreload: '63072000s',
    },
    docs: '/health',
  });
});

// ── Mount Routes ──
app.use('/', healthRouter);
app.use('/api/register', registerRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/upload', confirmUploadRouter);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    type: 'https://ecell.uietkuk.ac.in/errors/not-found',
    title: 'Resource Not Found',
    status: 404,
    detail: `The endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
  });
});

// ── RFC 7807 Global Error Handler ──
app.use(errorHandler());

export default app;
