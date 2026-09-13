require('dotenv').config();

// Keeps this pod alive through recoverable async errors (a Redis blip, an unawaited promise
// rejection somewhere) instead of crashing the whole process over something that did not
// need to be fatal. Still logs loudly — this is not meant to hide real bugs, just to stop a
// single bad promise from taking down a pod that Kubernetes then has to restart from scratch.
// If something IS truly unrecoverable, the liveness probe (see k8s/ manifests) is the real
// backstop: a genuinely wedged process will start failing /health checks and get restarted
// anyway, just without an unnecessary hard crash and reconnect storm on the way there.
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});

const http = require('http');
const { startConsumer, getLastActivity } = require('./rabbitmq/consumer');
const { register } = require('./utils/metrics');

console.log('[Notification] service starting...');

// This service has no other reason to listen on HTTP — it only consumes RabbitMQ events —
// but Kubernetes readiness/liveness probes need an HTTP (or exec) endpoint to check, and an
// exec probe would mean shipping curl/wget into an otherwise minimal image just to hit
// something. A few lines of `http` here avoids that. /health reports whether the RabbitMQ
// consumer has processed anything recently as a rough "is this actually doing its job" signal,
// not just "is the process technically alive".
const PORT = process.env.PORT || 3006;
http
  .createServer(async (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'notification', lastActivity: getLastActivity() }));
      return;
    }
    if (req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': register.contentType });
      res.end(await register.metrics());
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => console.log(`[Notification] health endpoint on :${PORT}`));

startConsumer().catch((err) => {
  console.error('[Notification] fatal startup error:', err.message);
  process.exit(1);
});
