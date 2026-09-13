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
const cors    = require('cors');
const cookieParser = require('cookie-parser');
const connectDB     = require('./config/db');
const { connect: connectRabbitMQ } = require('./rabbitmq/connection');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const { register, metricsMiddleware } = require('./utils/metrics');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────
// Requests normally arrive here proxied through api-gateway, which is the layer that
// actually enforces CORS against the browser — this service's own cors() below only matters
// when hitting :3001 directly (local testing) and is kept in sync with the gateway's policy
// so behavior doesn't differ depending on which path you happen to be testing through.
// `credentials: true` is required for the refresh-token cookie to ever be sent/received —
// without it, a browser silently drops Set-Cookie on cross-origin responses even if
// everything else is configured correctly.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' })); // profileImage can be base64
app.use(metricsMiddleware);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', adminUserRoutes);

// ─── Health & Metrics ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Boot ────────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => console.log(`[Auth] service running on :${PORT}`));
})();
