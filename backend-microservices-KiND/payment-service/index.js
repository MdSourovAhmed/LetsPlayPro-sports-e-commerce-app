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

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connect: connectRabbitMQ } = require('./rabbitmq/connection');
const paymentRoutes = require('./routes/paymentRoutes');
const { handleWebhook } = require('./controllers/paymentController');
const { register, metricsMiddleware } = require('./utils/metrics');

const app = express();
const PORT = process.env.PORT || 3005;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(metricsMiddleware);

// IMPORTANT: the webhook route needs Stripe's raw, unparsed request body to
// verify the signature — it MUST be registered before express.json() below,
// or body-parser will have already consumed/transformed the stream and
// signature verification will fail on every request.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', paymentRoutes);

// ─── Health & Metrics ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'payment' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => console.log(`[Payment] service running on :${PORT}`));
})();
