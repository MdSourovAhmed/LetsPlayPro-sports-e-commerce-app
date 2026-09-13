const client = require("prom-client");

const register = new client.Registry();

// No per-service prefix on these — Prometheus already differentiates which service a series
// came from via the "job" label (set explicitly to "order-service" by the k8s.grafana.com/job
// annotation on this service's Deployment, see k8s/apps/order-service.yaml). Sharing one metric
// name across every service, rather than prefixing it per-service, is what makes
// "sum by (job) (rate(http_requests_total[5m]))" work as ONE query covering all services on
// one dashboard panel instead of needing a separate hand-written panel per service.
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
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

function metricsMiddleware(req, res, next) {
  // Do not let Prometheus own scrape requests (or health probes) show up as application
  // traffic in the very metrics they are fetching.
  if (req.path === "/metrics" || req.path === "/health") return next();

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path
      ? (req.baseUrl || "") + req.route.path
      : "unmatched";

    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestDuration.observe(labels, durationSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
}

module.exports = { register, metricsMiddleware };
