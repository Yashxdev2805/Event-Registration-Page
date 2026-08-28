import { app } from './app.js';
import { outboxWorker } from './workers/outboxWorker.js';

const PORT = process.env.PORT || 3001;

// ── Start Server & Outbox Background Worker ──
const server = app.listen(PORT, () => {
  console.log(`🚀 [E-Cell Backend] Server running on http://localhost:${PORT}`);
  console.log(`🛡️ [Security] 16KB payload bound, Helmet, and Upstash Sliding Limiter active.`);
  outboxWorker.start();
  console.log(`⚡ [OutboxWorker] Background outbox poller & micro-batch dispatcher active.`);
});

// Graceful Shutdown Handler
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  outboxWorker.stop();
  server.close(() => {
    console.log('✅ HTTP server closed. Process exiting.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
