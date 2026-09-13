# Running LetsPlayPro on Kubernetes (kind / minikube)

This assumes local practice on one machine — everything here is scoped to that, not a real
production cluster (see the callouts throughout for what changes if it ever needs to be).

## kind vs minikube — pick one, they're not meant to run together

Both spin up a throwaway local cluster; you don't need both installed to follow this guide,
and running two local clusters at once just wastes resources for no benefit. The difference
that actually matters day-to-day:

| | kind | minikube |
|---|---|---|
| What it is | Runs the cluster **inside a Docker container** (or several) | Runs the cluster in a **VM** (or a container, configurable) |
| Startup speed | Faster — no VM boot | Slower, especially first run |
| Image loading | `kind load docker-image` — explicit, one image at a time | `eval $(minikube docker-env)` then build directly against its daemon — feels more like normal Docker |
| Multi-node clusters | Trivial (`kind-config.yaml` just adds more `nodes:` entries) | Possible but more involved |
| Dashboard / addons | Bring your own (install via manifests, like this repo does for ingress-nginx) | `minikube dashboard`, `minikube addons enable ingress` — batteries included |
| Best for | Fast iteration, CI pipelines, "I just need a cluster" | Wanting the built-in dashboard/addons, or practicing something closer to a real VM-based node |

**Recommendation for this project: start with kind.** It's faster to iterate with, and the
image-loading step being explicit (rather than magic via `docker-env`) makes it clearer what's
actually happening when you're still learning — you can see exactly when an image moves from
your machine into the cluster. Switch to minikube later if you want the dashboard UI or want
to practice on something that behaves more like a real node.

## 1. Create the cluster

```bash
# kind
brew install kind kubectl        # or your OS's equivalent
kind create cluster --config k8s/kind-config.yaml --name letsplaypro
kubectl cluster-info --context kind-letsplaypro

# — or — minikube
brew install minikube kubectl
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server   # needed for HPA — see section 4
```

For kind, metrics-server (needed for the HPAs in `k8s/apps/*.yaml` to work at all) isn't
built in — install it and patch it to tolerate kind's self-signed kubelet certs:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

For kind, also install an ingress controller (minikube's `ingress` addon above already
includes one):
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller --timeout=120s
```

## 2. Build images and load them into the cluster

```bash
./k8s/build-and-load.sh kind       # or: ./k8s/build-and-load.sh minikube
```

Re-run this any time you change service code — Kubernetes only knows about image *tags*, not
your source files, so `kubectl rollout restart deployment/<name> -n letsplaypro` after
rebuilding is how changes actually reach a running pod (or just re-run `kubectl apply`, which
will pick up any manifest changes but NOT a same-tagged image change on its own — that's why
`imagePullPolicy: IfNotPresent` + explicit rebuilds is the local workflow, rather than
relying on `:latest` + `Always`, which is a bad habit to build even locally).

## 3. Apply the manifests

```bash

cp k8s/02-secret.example.yaml k8s/02-secret.yaml
# edit k8s/02-secret.yaml with real values (Stripe test key, Google client ID, etc.)
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/02-secret.yaml
kubectl apply -f k8s/01-configmap.yaml

kubectl apply -f k8s/infra/
kubectl -n letsplaypro wait --for=condition=ready pod -l app=redis --timeout=60s
kubectl -n letsplaypro wait --for=condition=ready pod -l app=rabbitmq --timeout=90s
kubectl -n letsplaypro wait --for=condition=ready pod -l app=mongo-auth --timeout=60s
# (repeat the mongo wait for -product/-order/-payment, or just give it 30s and move on —
#  every app Deployment's readinessProbe will hold it out of rotation until its own
#  dependencies are actually reachable anyway)

kubectl apply -f k8s/apps/
kubectl apply -f k8s/06-ingress.yaml
kubectl apply -f k8s/07-pod-disruption-budgets.yaml

kubectl -n letsplaypro get pods -w   # watch everything come up
```

Add `127.0.0.1 letsplaypro.local` to `/etc/hosts` (kind), or run `minikube ip` and use that IP
with a `Host: letsplaypro.local` header (or add *that* IP to `/etc/hosts` instead — minikube
doesn't route through localhost the way kind's port-mapped ingress does).

```bash
curl http://letsplaypro.local/health
curl http://letsplaypro.local/api/products
```

## 3b. Observability stack (Grafana Cloud)

See `k8s/observability/README.md` for shipping metrics, logs, and Kubernetes events to
Grafana Cloud via Grafana Alloy — no self-hosted Prometheus/Grafana to run locally. All seven
services already expose a real `/metrics` endpoint (see the root README's Observability
section); the observability README covers wiring that up to an actual dashboard.

## 4. Health monitoring

Every HTTP service in this repo already exposes `/health` (notification-service too, now —
see its `index.js`, it's a consumer-only service that got a minimal HTTP server added
specifically so it's not a monitoring blind spot). Kubernetes uses two different probes
against the same endpoint here, and the distinction matters even though they hit the same
URL:

- **readinessProbe** — "should this pod receive traffic *right now*?" A pod that fails this
  gets pulled out of its Service's load-balancing rotation but is NOT restarted. This is what
  stops traffic from hitting a pod that's still connecting to Mongo on startup.
- **livenessProbe** — "is this pod fundamentally broken and needs a restart?" A pod that fails
  this gets killed and recreated. Set with a longer `initialDelaySeconds` than readiness so a
  slow-but-fine startup doesn't get mistaken for a hang.

Useful commands while things are running:

```bash
kubectl -n letsplaypro get pods                    # STATUS column: CrashLoopBackOff = liveness failing repeatedly
kubectl -n letsplaypro top pods    
kubectl -n letsplaypro get hpa -w                 # live CPU/memory per pod (needs metrics-server)
kubectl -n letsplaypro describe pod <pod-name>       # Events section shows probe failures with reasons
kubectl -n letsplaypro logs -f <pod-name>            # tail one pod
kubectl -n letsplaypro logs -f -l app=order-service --prefix  # tail every replica of a Deployment at once
```

For something closer to a real dashboard instead of `kubectl` one-liners:

- **k9s** (`brew install k9s`) — terminal UI, `k9s -n letsplaypro`. Probably the single best
  tool for exactly this project's scale — live pod list, logs, resource usage, all
  keyboard-driven, no cluster add-ons required.
- **Grafana Cloud**, if you want real metrics history instead of a live snapshot
  (`kubectl top` only shows *current* usage, nothing historical) plus actual application
  metrics — request rate, error rate, p50/p95/p99 latency per route, not just CPU/memory. All
  seven services already expose a real `/metrics` endpoint (`prom-client`, see the root
  README's Observability section) — see **section 3b above** and
  `k8s/observability/README.md` for shipping that data to Grafana Cloud via Grafana Alloy and
  a starter dashboard to import. This is genuinely lighter-weight for local kind/minikube
  practice than running a self-hosted Prometheus + Grafana stack (several hundred MB of RAM
  before your app pods even start) — worth reading that README even if you'd normally reach
  for self-hosted tooling.

## 5. Load testing with autocannon

Point autocannon at the Ingress like a real client would, not at a `kubectl port-forward` to
one pod directly — the whole point is testing routing + load-balancing across replicas, not
one instance's raw throughput.

```bash
npm install -g autocannon

# Baseline: a cheap, cacheable read (product-service, hits Redis after the first request)
autocannon -c 50 -d 30 http://letsplaypro.local/api/products

# A write path with no cache involved (auth)
autocannon -c 20 -d 30 -m POST \
  -H "Content-Type: application/json" \
  -b '{"email":"loadtest@example.com","password":"wrongpassword"}' \
  http://letsplaypro.local/api/login

# A single product detail page (individually cached, not list-cached)
autocannon -c 50 -d 30 http://letsplaypro.local/api/product/<some-real-id>
```

`-c` = concurrent connections, `-d` = duration in seconds. Watch three things simultaneously
across two terminals — one running autocannon, one running `kubectl -n letsplaypro top pods
-w` or `k9s`:

1. **autocannon's own output**: `req/sec`, and the latency percentiles (p50/p97.5/p99) — the
   tail latencies (p99) matter more than the average for understanding real user experience.
2. **Pod CPU** climbing toward the `resources.limits.cpu` set in each Deployment — that's what
   triggers the HPA.
3. **Replica count** changing: `kubectl -n letsplaypro get hpa -w` — watch `product-service`
   scale from 2 → more replicas as sustained load pushes average CPU past the 70% target
   configured in its HPA. This takes a minute or two to react (HPA polls periodically, then a
   new pod needs to actually start and pass its readinessProbe) — don't expect it instantly.

**The comparison that actually demonstrates what the Redis caching work bought you**: hit
`/api/products` before vs. after the Redis cache is warm. First request populates the cache;
everything else for the next 30 seconds (LIST_TTL_SECONDS in `product-service/utils/cache.js`)
serves straight from Redis instead of running a Mongo query + count. Run the same autocannon
command back-to-back and compare `req/sec` and p99 latency between the two runs — the second
run should show meaningfully higher throughput and lower tail latency purely from the cache
being warm. You can also `kubectl -n letsplaypro exec -it deploy/redis -- redis-cli monitor`
during a run to watch cache reads happening in real time (noisy — only do this briefly).

If you've set up Grafana Cloud (section 3b), this same comparison is visible live on the
"p50 / p95 / p99 latency by service" panel while the load test runs, not just in autocannon's
end-of-run summary — genuinely worth having the dashboard open in a third window during a
load test rather than only checking it after, since watching a metric move in response to a
change you're making in real time teaches the relationship between cause and effect faster
than comparing two static before/after numbers does.

For anything beyond quick single-endpoint checks, **k6** (`brew install k6`) is worth learning
next — unlike autocannon it lets you script realistic multi-step flows (browse → add to cart
→ checkout) with a JS test file, and it has built-in support for ramping load up/down over
time rather than one flat concurrency level for the whole run, which is a much more honest
simulation of real traffic than autocannon's constant-concurrency model.

## What to actually watch for, running through all of this once

- **Rate limiting behaving correctly across gateway replicas** — hit `/api/login` past its
  limit (10/15min) repeatedly while `kubectl get pods -n letsplaypro -l app=api-gateway`
  shows 2+ replicas. You should get 429s consistently regardless of which pod handles a given
  request — that's the Redis-backed store working. (Before that fix, this project's rate
  limiter used an in-memory store — see the code comments in
  `api-gateway/middleware/rateLimitStore.js` for the concrete failure mode that would have
  shown up here.)
- **A pod dying mid-load-test** — `kubectl delete pod <one-of-the-product-service-pods> -n
  letsplaypro` while autocannon is running against it. Requests in flight to that pod fail,
  but the Service should route new requests to the surviving replica(s) within a few seconds,
  and the HPA/Deployment brings a replacement pod back up automatically. This is the actual
  point of running multiple replicas — go verify it actually happens, don't just assume it
  does because the YAML says `replicas: 2`.
- **Autoscaling settling back down** — stop the load and watch `kubectl get hpa -n
  letsplaypro -w`. Scale-down is deliberately slower than scale-up (a 5-minute default
  stabilization window) specifically to avoid flapping — don't mistake that delay for the HPA
  being broken.
