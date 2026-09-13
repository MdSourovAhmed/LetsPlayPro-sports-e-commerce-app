# Observability — Grafana Cloud

Replaces the earlier self-hosted `kube-prometheus-stack` approach (deleted — `values-kube-
prometheus-stack.yaml` and `api-gateway-servicemonitor.yaml` are gone) with Grafana Cloud:
Grafana Alloy runs inside the cluster and ships metrics, logs, and Kubernetes events out to
your Grafana Cloud stack, so there's no Prometheus or Grafana to run, upgrade, or
`port-forward` to locally — you just log into your Grafana Cloud URL.

**Why the switch:** for local kind/minikube practice specifically, self-hosted
kube-prometheus-stack is a genuinely heavy thing to run (Prometheus + Grafana + Alertmanager +
node-exporter, several hundred MB of RAM before your actual app pods even start) just to look
at a handful of services. Grafana Cloud's free tier gets you real Prometheus + Loki + Grafana,
hosted, for less local resource cost than the self-hosted stack — the tradeoff is a dependency
on an external account and a genuine (if generous) usage limit, which is worth knowing about
before you start (see "Watch your usage" below).

## What's actually being monitored

All seven backend services now expose a real `/metrics` endpoint (see the root README's
"Observability" section for the instrumentation details) — this setup ships that data
somewhere you can see it, it doesn't create it. If you skipped straight to this file: the
`/metrics` endpoints are the actual substance, this Helm chart is just plumbing. Also
collected, without any app-level instrumentation needed: every pod's CPU/memory/restart
count (via kube-state-metrics, bundled in the chart), every pod's stdout/stderr logs, and
Kubernetes Events (OOMKilled, ImagePullBackOff, failed probes...) — meaning `mongo-*`,
`redis`, and `rabbitmq` get baseline health visibility ("is it up, is it restarting, is it
being OOM-killed") even without a dedicated exporter for any of them.

## 1. Create a Grafana Cloud account and get your connection details

1. Sign up at grafana.com — the free tier is enough for this project.
2. In your stack, go to **Connections → Add new connection**, search **Kubernetes**, and open
   it. This page shows your *actual* Prometheus and Loki push URLs and instance IDs — they're
   specific to your account and region, don't reuse the ones in this repo's example files.
3. Go to **Administration → Access Policies → Create access policy**, scope it to
   `metrics:write` + `logs:write`, and generate a token. This token is the password for both
   Prometheus and Loki below — same token, two different usernames (the instance IDs from
   step 2).

## 2. Create the credentials Secret

```bash
cp k8s/observability/grafana-cloud-secret.example.yaml k8s/observability/grafana-cloud-secret.yaml
# edit it: PROMETHEUS_URL, PROMETHEUS_USERNAME, LOKI_URL, LOKI_USERNAME, ACCESS_POLICY_TOKEN
kubectl apply -f k8s/observability/grafana-cloud-secret.yaml
```

This is deliberately a separate Secret from `letsplaypro-secrets` — the app services never
read it, only Alloy does. Different owner, different rotation schedule, no reason to couple
them.

## 3. Install the chart

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Sanity-check the values file against what you actually have BEFORE installing — this
# chart's schema has changed more than once in the past year (see the warning at the top of
# k8s-monitoring-values.yaml). If `helm show values` doesn't roughly match the shape of
# destinations/clusterMetrics/annotationAutodiscovery in that file, use Grafana's migration
# tool rather than guessing: grafana.github.io/k8s-monitoring-helm-migrator
helm show values grafana/k8s-monitoring | less

helm install grafana-k8s-monitoring grafana/k8s-monitoring \
  --namespace letsplaypro \
  --values k8s/observability/k8s-monitoring-values.yaml
```

## 4. Verify data is actually flowing

```bash
kubectl -n letsplaypro get pods -l app.kubernetes.io/name=alloy-metrics
kubectl -n letsplaypro logs -l app.kubernetes.io/name=alloy-metrics --tail=50
```

Look for repeated `unauthenticated` or `401` errors — that's almost always the Secret's
values being wrong (wrong instance ID as username, or a token scoped to the wrong
permissions) rather than anything wrong with the chart itself.

In Grafana Cloud, go to **Explore**, pick your Prometheus data source, and run:

```
http_requests_total
```

If that returns nothing after a few minutes, check (in order): the Alloy pod logs above, that
the app pods actually have the `k8s.grafana.com/scrape: "true"` annotation (`kubectl -n
letsplaypro get pod <pod-name> -o jsonpath='{.metadata.annotations}'`), and that `/metrics` on
the pod itself actually returns data (`kubectl -n letsplaypro port-forward <pod-name> 9999:3001`
then `curl localhost:9999/metrics` — adjust the port per service).

## 5. Import the dashboard

Grafana Cloud → **Dashboards → New → Import → Upload JSON file** →
`k8s/observability/dashboards/letsplaypro-services.json`. Pick your Prometheus data source
when prompted. Covers request rate, error rate, p50/p95/p99 latency, memory/CPU, Node event
loop lag, pod restarts, and notification-service's message processing — each panel has a
description explaining what it's actually telling you and why, not just what it's plotting.

Grafana Cloud also auto-provisions a set of Kubernetes cluster dashboards the moment
`clusterMetrics` data starts arriving (look under **Dashboards** for ones tagged
`kubernetes-mixin` or similar) — worth browsing those too, they cover node-level and
cluster-wide views this project-specific dashboard doesn't.

## Watch your usage

Grafana Cloud's free tier is generous but not unlimited — it's priced/limited primarily on
**active series count** (roughly: how many unique label combinations exist across all your
metrics) and log/trace volume. The route-templating work in every service's `metrics.js`
(using `:id` instead of literal database IDs in the `route` label) exists specifically to
keep this bounded — without it, active series would grow without limit as new products/
orders/users get created, since each unique ID would mint its own permanent time series. If
you extend these services with new labels later, keep the same discipline: label values
should come from a small fixed set (HTTP methods, status codes, route templates, enum
values), never from something that grows unboundedly (raw IDs, free-text search queries,
email addresses). Check **Billing → Usage** in Grafana Cloud periodically while you're
experimenting — it's the actual source of truth, not a guess based on how many services you
have.

## What's NOT covered (known gaps)

- **No deep RabbitMQ/Mongo/Redis metrics** — `clusterMetrics` gives you pod-level CPU/memory/
  restarts for these (are they up, are they healthy as a *process*), but not their internal
  state (RabbitMQ queue depth, Mongo replication lag/slow query log, Redis hit rate/evictions).
  Adding the official `rabbitmq_exporter`/`mongodb_exporter`/`redis_exporter` as sidecars
  would close this gap — reasonable next step if any of the "what's NOT cached" reasoning in
  the root README's Caching section ever needs actual data to back it up instead of
  intuition.
- **No distributed tracing.** Seeing a single slow request's full path across gateway → auth
  → product → order would need OpenTelemetry instrumentation added to each service (a bigger
  lift than the metrics work here — different SDK, spans need to be threaded through every
  service-to-service HTTP call and RabbitMQ message) and a `traces` destination added to
  `k8s-monitoring-values.yaml`. Worth doing if "which service is actually slow" ever becomes
  hard to answer from the latency dashboard alone.
- **No alerting configured.** Grafana Cloud supports alert rules on any of this data (e.g.
  "page me if p99 latency > 2s for 5 minutes" or "if any pod restarts more than 3 times in an
  hour") — none are set up yet. The dashboard shows you the data; turning specific thresholds
  on it into actual notifications is a separate, deliberate step worth doing once you have a
  feel for what's normal vs. not from watching the dashboard for a while first — alerting on
  thresholds you haven't validated against real traffic yet mostly produces noise.
