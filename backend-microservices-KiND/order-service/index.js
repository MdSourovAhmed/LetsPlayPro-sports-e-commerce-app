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

const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const { connect: connectRabbitMQ } = require('./rabbitmq/connection');
const { startConsumer }            = require('./rabbitmq/consumer');
const orderRoutes = require('./routes/orderRoutes');
const { register, metricsMiddleware } = require('./utils/metrics');

const app  = express();
const PORT = process.env.PORT || 3003;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', orderRoutes);

// ─── Health & Metrics ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order' }));
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
  await startConsumer(); // listen for order.stock_confirmed / order.stock_rejected
  app.listen(PORT, () => console.log(`[Order] service running on :${PORT}`));
})();
