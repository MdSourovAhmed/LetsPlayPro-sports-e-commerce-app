require('dotenv').config();

// Keeps this pod alive through recoverable async errors (a Redis blip, an unawaited promise
// rejection somewhere) instead of crashing the whole process over something that did not
// need to be fatal. Still logs loudly — this is not meant to hide real bugs, just to stop a
// single bad promise from taking down a pod that Kubernetes then has to restart from scratch.
// If something IS truly unrecoverable, the liveness probe (see k8s/ manifests) is the real
// backstop: a genuinely wedged process will start failing /health checks and get restarted
// anyway, just without an unnecessary hard crash and reconnect storm on the way there.
// process.on("unhandledRejection", (reason) => {
//   console.error("[UNHANDLED REJECTION]", reason);
// });
// process.on("uncaughtException", (err) => {
//   console.error("[UNCAUGHT EXCEPTION]", err);
// });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { verifyToken, optionalAuth } = require('./middleware/auth');
const { redisStore } = require('./middleware/rateLimitStore');
const { register, metricsMiddleware } = require('./utils/metrics');

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const DASHBOARD = process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3004';
const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

// ─── Global middleware ────────────────────────────────────────────────────────
// `credentials: true` here is required for the refresh-token cookie to ever reach the
// browser or be sent back — without it, a browser silently drops Set-Cookie on cross-origin
// responses even if auth-service's own cookie config is perfect. Origins must be an explicit
// allowlist (not '*') — browsers reject credentialed requests against a wildcard origin.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(metricsMiddleware);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 999990,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
  store: redisStore('global'),
}));


// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 999999,
//   // max: process.env.NODE_ENV === 'test' ? 999999 : 200, // Relax during testing
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { message: 'Too many requests, please try again later' },
//   store: redisStore('global'),
// }));



// Stricter limiters for auth endpoints — including the new refresh/reset
// endpoints, which are equally attractive brute-force targets as login.
// Each gets its own `prefix` so they don't share counters with each other
// or with the global limiter above.
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many login attempts' }, store: redisStore('login') }));
app.use('/api/signup', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { message: 'Too many signup attempts' }, store: redisStore('signup') }));
app.use('/api/auth/google', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts' }, store: redisStore('google') }));
app.use('/api/auth/admin-register', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { message: 'Too many registration attempts' }, store: redisStore('admin-register') }));
app.use('/api/auth/refresh-token', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { message: 'Too many refresh attempts' }, store: redisStore('refresh') }));
app.use('/api/auth/forgot-password', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { message: 'Too many password reset requests' }, store: redisStore('forgot-pw') }));

// ─── Proxy factory ────────────────────────────────────────────────────────────
// http-proxy-middleware v3, mounted via app.use(mountPath, proxy), has
// Express strip `mountPath` from req.url before the proxy ever sees it.
// Fix: force the full original path back via req.originalUrl, which Express
// never mutates. See README for the full debugging history on this.
function proxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        // proxyReq.path = req.originalUrl;
        proxyReq.path = req.originalUrl;
      },
      error: (_err, _req, res) => {
        res.status(502).json({ message: 'Service temporarily unavailable' });
      },
    },
  });
}


// ─── Public routes (no JWT) ───────────────────────────────────────────────────
app.use('/api/signup', proxy(AUTH));
app.use('/api/login',  proxy(AUTH));

app.use('/api/auth/forgot-password', proxy(AUTH));
app.use('/api/auth/reset-password', proxy(AUTH));
app.use('/api/auth/refresh-token', proxy(AUTH)); // reads the refresh token from an httpOnly cookie — no body needed
app.use('/api/auth/logout', proxy(AUTH)); // same — identifies the session via cookie, not a bearer token
app.use('/api/auth/google', optionalAuth, proxy(AUTH)); // no token to verify yet — this route IS the login
// Dev/test-only, always 403s unless ADMIN_REGISTRATION_CODE is set on auth-service —
// see authController.js's adminRegister for why this is safe to leave routed here.
app.use('/api/auth/admin-register', proxy(AUTH));

// Public product browsing (storefront — no auth needed)
app.use('/api/products', proxy(PRODUCT));
app.use('/api/product', proxy(PRODUCT));
app.use('/api/latest', proxy(PRODUCT));
app.use('/api/bestsellers', proxy(PRODUCT));
app.use('/api/search', proxy(PRODUCT));

// Stripe payment intents — guest checkout must work without logging in, so
// this can't require a valid token. optionalAuth still attaches x-user-id
// when the caller does have one, purely for payment-service's audit trail.
app.use('/api/payments/create-intent', optionalAuth, proxy(PAYMENT));

// Stripe calls this directly, server-to-server — no user auth of any kind
// applies here, Stripe's own signature (verified inside payment-service)
// is what authenticates this request. Also: the gateway never runs
// express.json() anywhere in this file, so the raw request body reaches
// payment-service untouched, which is required for that signature check.
app.use('/api/payments/webhook', proxy(PAYMENT));

// ─── Protected routes (JWT required) ─────────────────────────────────────────

// Auth-service: /me, /logout, /change-password, profile
app.use('/api/auth', verifyToken, proxy(AUTH));
app.use('/api/user', verifyToken, proxy(AUTH));

// IMPORTANT — registration order matters here. Express matches app.use()
// prefixes in the order they're registered, and the FIRST matching prefix
// wins. /api/admin/users/:id/orders must be registered BEFORE the broader
// /api/admin/users, or the broader one would swallow it and send it to the
// wrong service (auth-service doesn't have order data).
app.use('/api/admin/users', (req, res, next) => {
  // A path like /admin/users/<id>/orders needs to go to order-service
  // (which owns order data), while everything else under /admin/users
  // goes to auth-service (which owns user data). Branch by inspecting the
  // tail of the path rather than maintaining two separate mount points
  // that could drift out of sync.
  if (/\/orders\/?$/.test(req.path)) {
    return verifyToken(req, res, () => proxy(ORDER)(req, res, next));
  }
  return verifyToken(req, res, () => proxy(AUTH)(req, res, next));
});

// Dashboard summary + analytics (read-only aggregator service)
app.use('/api/admin/dashboard', verifyToken, proxy(DASHBOARD));
app.use('/api/admin/analytics', verifyToken, proxy(DASHBOARD));

// Product admin — dashboard's REST paths (plural) and the legacy singular
// path both live in product-service, so both can share one mount point.
app.use('/api/admin/products', verifyToken, proxy(PRODUCT));
app.use('/api/admin/product', verifyToken, proxy(PRODUCT));

// Orders — dashboard's /admin/orders/* REST paths plus the original
// user-facing and legacy admin paths, all owned by order-service.
app.use('/api/admin/orders', verifyToken, proxy(ORDER));
app.use('/api/place-order', verifyToken, proxy(ORDER));
app.use('/api/orders', verifyToken, proxy(ORDER));
app.use('/api/update-order', verifyToken, proxy(ORDER));
app.use('/api/cancel-order', verifyToken, proxy(ORDER));
app.use('/api/update-order-status', verifyToken, proxy(ORDER));

// ─── Health & Metrics ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Gateway] running on :${PORT}`);
  console.log(`  -> Auth      ${AUTH}`);
  console.log(`  -> Product   ${PRODUCT}`);
  console.log(`  -> Order     ${ORDER}`);
  console.log(`  -> Dashboard ${DASHBOARD}`);
  console.log(`  -> Payment   ${PAYMENT}`);
});
