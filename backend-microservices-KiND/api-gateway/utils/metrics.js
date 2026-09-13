const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds, as observed at the gateway (includes proxy + upstream service time)",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests handled",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// Same metric names as every other service (see auth-service/utils/metrics.js for why —
// Prometheus's own "job" label, not a per-service metric-name prefix, is what differentiates
// services on a shared dashboard). The gateway is the one exception on HOW the "route" label
// gets built: it's a pure proxy — app.use('/api/products', proxy(...)) is a middleware
// mount, not an Express route (.get()/.post()), so req.route is almost never set here the
// way it is in every other service. Route templating has to happen by hand instead:
// normalize away anything that looks like an ID so /api/product/68f2a9... and
// /api/product/71bc44... collapse into the same low-cardinality series
// (/api/product/:id) rather than each URL becoming its own permanent time series.
const OBJECT_ID = /^[a-f0-9]{24}$/i;
const NUMERIC_ID = /^\d+$/;

function normalizeRoute(path) {
  const segments = path.split('/').filter(Boolean);
  const normalized = segments.map((seg) => {
    if (OBJECT_ID.test(seg) || NUMERIC_ID.test(seg)) return ':id';
    return seg;
  });
  return '/' + normalized.slice(0, 4).join('/');
}

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics' || req.path === '/health') return next();

  const start = process.hrtime.bigint();
  const route = normalizeRoute(req.path);

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestDuration.observe(labels, durationSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
}

module.exports = { register, metricsMiddleware };
