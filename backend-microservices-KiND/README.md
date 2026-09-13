# Sports Store — Microservice Architecture

## ⚠️ Rotate this credential — do it before anything else

`notification-service/.env.example` had what looks like a **real Gmail address and app
password** committed in it (`SMTP_USER`/`SMTP_PASS`). It's been replaced with placeholders
here, but that doesn't undo any prior exposure — **if that was a real account, go revoke that
app password in the Google Account security settings right now** (Google Account → Security →
App Passwords), regardless of anything else in this update. A zip export isn't the same as
git history — if this was ever pushed to a repo (public or private), assume the credential is
compromised and rotate it rather than trying to reason about who might have seen it.

## Services

| Service              | Port        | Responsibility                                  |
|-----------------------|-------------|--------------------------------------------------|
| api-gateway           | 3000        | JWT validation, rate limiting, routing            |
| auth-service          | 3001        | Signup, login, Google OAuth, refresh tokens, user/admin profile, address book, password reset |
| product-service       | 3002        | Product CRUD, search, filters, bulk admin actions |
| order-service         | 3003        | Place, track, cancel orders; payment status; invoices; admin notes |
| dashboard-service     | 3004        | **Read-only** aggregator: admin dashboard summary + analytics |
| payment-service       | 3005        | Stripe PaymentIntents, server-side price verification, refunds |
| notification-service  | —           | Email notifications (RabbitMQ consumer)           |
| RabbitMQ              | 5672/15672  | Message broker                                    |
| MongoDB x 4           | internal    | One database per service (dashboard-service reads three of them, writes none) |

This backend is built to match the admin dashboard's spec exactly: 4-tier
roles (`user < staff < admin < super_admin`), 7 order statuses (adds
`confirmed`/`returned` to the original 5), real refresh-token rotation, and
every `/admin/*` endpoint the dashboard's API layer calls.

**An admin frontend hasn't been built yet, but the backend for one already
has**: `dashboard-service` plus every `/api/admin/*` route in this table
already exists and is fully functional. When you're ready for the admin
app, that's a frontend-only task — point it at these existing endpoints
rather than adding new backend work first.

---

## Quick start

```bash
cp .env.example .env   # fill in JWT_SECRET, Google, Stripe, Cloudinary, SMTP credentials
docker-compose up --build
open http://localhost:15672 # RabbitMQ UI — guest / guest
curl http://localhost:3000/health
```

For Stripe webhooks in local dev, forward events with the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
# copy the whsec_... it prints into .env as STRIPE_WEBHOOK_SECRET, then restart payment-service
```

---

## Role hierarchy

```
user < staff < admin < super_admin
```

`user` is a storefront customer — unrelated to dashboard access. `staff` is
the lowest dashboard-access tier. Role checks throughout the backend are
**hierarchy-aware** (`requireRole('staff')` passes for staff, admin, *and*
super_admin) — never an exact string match. This logic is duplicated
identically across `auth-service`, `product-service`, `order-service`, and
`dashboard-service`'s `middleware/auth.js` — keep all four in sync if the
hierarchy ever changes.

---

## Refresh token flow

Access tokens are short-lived (`JWT_EXPIRES_IN=15m`) on purpose — the whole
point of adding a refresh flow is that a leaked access token stops working
quickly. Refresh tokens:

- Are opaque random strings (not JWTs) — only their SHA-256 hash is ever
  stored in MongoDB, same principle as password hashing.
- **Rotate on every use**: calling `/api/auth/refresh-token` revokes the
  token just used and issues a new one. A refresh token only works once.
- Reusing an already-revoked token is treated as a possible theft signal —
  it revokes every other token for that user, forcing re-login everywhere.
- Are capped at 5 per user (oldest dropped first), bounding storage growth
  for users who log in from many devices over time.

Password reset and explicit password change both revoke all of a user's
existing refresh tokens, forcing re-login on every device.

---

## API Reference (all via gateway :3000)

### Auth
| Method | Path                       | Auth   | Body                                  |
|--------|----------------------------|--------|----------------------------------------|
| POST   | /api/signup                | —      | { email, password, name }              |
| POST   | /api/login                 | —      | { email, password }                    |
| POST   | /api/auth/google           | —      | { idToken } — Google ID token from Google Identity Services |
| POST   | /api/auth/admin-register   | —      | { name, email, password, role, inviteCode } — dev/test only, see below |
| POST   | /api/auth/refresh-token    | —      | { refreshToken }                       |
| POST   | /api/auth/forgot-password  | —      | { email }                              |
| POST   | /api/auth/reset-password   | —      | { token, password }                    |
| GET    | /api/auth/me               | Bearer | —                                       |
| POST   | /api/auth/logout           | Bearer | { refreshToken }                       |
| POST   | /api/auth/change-password  | Bearer | { currentPassword, newPassword }       |
| GET    | /api/user/profile          | Bearer | —                                       |
| PUT    | /api/user/profile          | Bearer | { name, phone, address, profileImage } |
| GET    | /api/user/addresses        | Bearer | —                                       |
| POST   | /api/user/addresses        | Bearer | { label, firstName, lastName, street, city, zip, country, phone, isDefault? } |
| PUT    | /api/user/addresses/:id    | Bearer | Same fields, all optional (partial update) |
| DELETE | /api/user/addresses/:id    | Bearer | —                                       |
| PATCH  | /api/user/addresses/:id/default | Bearer | Sets this address as the default one |

Accounts created via Google sign-in never get a `password` set (the User
schema makes it conditionally required — see `auth-service/models/User.js`).
If an email/password account later signs in with Google using the same
email, the accounts are linked by setting `googleId` on the existing user
rather than creating a duplicate.

### Products (public storefront)
| Method | Path                   | Query                                           |
|--------|------------------------|---------------------------------------------------|
| GET    | /api/products          | sport, type, brand, minPrice, maxPrice, page...    |
| GET    | /api/product/:id       | —                                                  |
| GET    | /api/products/related  | sport, type, excludeId                              |
| GET    | /api/latest            | limit                                              |
| GET    | /api/bestsellers       | limit                                              |
| GET    | /api/search            | q, sport, minPrice, maxPrice, page, limit          |

All storefront queries now also filter `status: 'active'` — draft/archived
products never show up to customers regardless of stock level.

### Products (admin — Bearer + role >= staff)
| Method | Path                        | Notes                                  |
|--------|------------------------------|------------------------------------------|
| GET    | /api/admin/products         | search, category, status, brand, price range, page, sort |
| GET    | /api/admin/products/:id     | —                                          |
| POST   | /api/admin/products         | full product fields incl. variants, tags  |
| PUT    | /api/admin/products/:id     | partial update                            |
| DELETE | /api/admin/products/:id     | also removes Cloudinary images            |
| PATCH  | /api/admin/products/bulk    | { ids, action: delete\|activate\|draft\|archive } |

Legacy paths (`/api/product/create`, `/api/product/list`, `/api/product/:id`)
still work, routed to the same controllers.

### Orders
| Method | Path                                  | Auth          | Notes                          |
|--------|-----------------------------------------|---------------|----------------------------------|
| POST   | /api/place-order                        | Bearer        | Kicks off the stock saga. `paymentMethod: 'card'` requires `paymentIntentId` and is verified server-side before the order is created — see Payments below |
| GET    | /api/orders/my                          | Bearer        | Current user's orders             |
| GET    | /api/orders/:orderId                    | Bearer        | A single order, scoped to the requesting user (404 if it's not theirs) |
| PUT    | /api/update-order/:orderId              | Bearer        | Delivery info (not yet shipped)   |
| PUT    | /api/cancel-order/:orderId              | Bearer        | pending/confirmed/processing only. Auto-refunds if it was a paid card order |
| GET    | /api/admin/orders                       | role >= staff | search, status, paymentStatus, date range, min/max total |
| GET    | /api/admin/orders/:id                   | role >= staff | —                                  |
| PATCH  | /api/admin/orders/:id/status            | role >= staff | { status, reason? } — reason required for cancelled/returned. Auto-refunds if cancelling/returning a paid card order |
| PATCH  | /api/admin/orders/:id/payment           | role >= staff | { paymentStatus: unpaid\|paid\|refunded } |
| POST   | /api/admin/orders/:id/notes             | role >= staff | { note } — internal only, never customer-visible |
| GET    | /api/admin/orders/:id/invoice           | role >= staff | Streams a PDF invoice              |
| GET    | /api/admin/users/:userId/orders         | role >= staff | Order history for one customer (routed to order-service, see gateway notes) |

Order status enum: `pending, confirmed, processing, shipped, delivered,
cancelled, returned`. Payment status: `unpaid, paid, refunded`. Payment
method: `cod, bkash, nagad, card`.

### Payments (Stripe, via payment-service)
| Method | Path                                        | Auth        | Notes                                |
|--------|-----------------------------------------------|--------------|-----------------------------------------|
| POST   | /api/payments/create-intent                   | Optional     | `{ items: [{productId, quantity, size?}] }` — **not** an amount. See below for why. |
| POST   | /api/payments/webhook                         | Stripe signature | Not routed through JWT auth at all — Stripe calls this directly |

`create-intent` deliberately takes cart *items*, not a total — trusting a
client-supplied charge amount is exactly the kind of thing that turns into a
"pay whatever you want" exploit. payment-service looks up each item's
current price directly from product-service (internal network call,
bypassing the gateway) and computes the total itself before ever talking to
Stripe. It also validates stock availability so a card doesn't get charged
for something that's about to fail the stock-reservation saga anyway (that
race can still happen — see the saga section below for how it's handled
when it does).

Two endpoints exist only for internal service-to-service calls and are
**never** exposed through the gateway: `GET
/api/internal/payments/:id/verify` (order-service confirms a charge really
succeeded before marking an order paid) and `POST
/api/internal/payments/:id/refund` (triggered automatically if a paid card
order later gets cancelled, returned, or loses the stock-reservation race).

### Users (admin)
| Method | Path                          | Auth           | Notes                              |
|--------|--------------------------------|-----------------|---------------------------------------|
| GET    | /api/admin/users               | role >= staff   | search, role, status, date range, page, sort |
| GET    | /api/admin/users/:id           | role >= staff   | —                                       |
| PATCH  | /api/admin/users/:id/status    | role >= staff   | { isActive } — also revokes their sessions |
| DELETE | /api/admin/users/:id           | role >= admin   | Blocked for self-deletion and the last super_admin |

### Dashboard & Analytics (read-only aggregator)
| Method | Path                                  | Notes                                    |
|--------|------------------------------------------|---------------------------------------------|
| GET    | /api/admin/dashboard/summary             | Counts/revenue/recent activity across all 3 DBs |
| GET    | /api/admin/analytics/overview            | ?range=daily\|weekly\|monthly\|yearly\|custom&from&to |
| GET    | /api/admin/analytics/sales               | Daily time series for charts                |
| GET    | /api/admin/analytics/top-products        | ?limit — joins order line items to product names |
| GET    | /api/admin/analytics/categories          | Revenue/units by category                   |
| GET    | /api/admin/analytics/payment-methods      | All-time breakdown, no date filter           |
| GET    | /api/admin/analytics/export              | ?format=csv (works) or pdf (**501 — not implemented yet**) |

`dashboard-service` connects directly to all three other services' MongoDB
databases as a deliberate tradeoff for speed/simplicity over strict service
isolation — see `dashboard-service/.env.example`. It never writes to any of
them.

---

## RabbitMQ Event Map

Exchange: `app.events` (topic)

| Routing key                     | Publisher        | Consumers                              |
|-----------------------------------|-------------------|-------------------------------------------|
| order.placed                      | order-service      | product-service                            |
| order.stock_confirmed             | product-service    | order-service                              |
| order.stock_rejected              | product-service    | order-service                              |
| order.status_updated              | order-service      | notification-service                       |
| order.cancelled                   | order-service      | product-service, notification-service      |
| user.registered                   | auth-service       | notification-service                       |
| user.password_reset_requested     | auth-service       | notification-service                       |
| payment.confirmed                 | payment-service     | order-service (webhook reconciliation backstop) |
| payment.failed                    | payment-service     | — (published for future consumers; nothing subscribes yet) |

### Order placement saga

`createOrder` does NOT touch product stock directly — order-service has no
access to product-service's database. Instead:

1. order-service saves the order as `status: pending`, `stockStatus: awaiting_confirmation`,
   then publishes `order.placed`.
2. product-service atomically reserves stock for every line item
   (`findOneAndUpdate` with `stock: {$gte: qty}` in the filter — race-safe).
   If any item fails, it rolls back the items already reserved for that order.
3. product-service publishes `order.stock_confirmed` or `order.stock_rejected`
   (with a `reason`) back to order-service.
4. order-service flips `stockStatus` and `status` accordingly:
   - confirmed -> `status: processing`, fires `order.status_updated`
   - rejected -> `status: cancelled`, fires `order.cancelled`
5. notification-service only emails the customer once status flips to
   `processing` — never on the raw `order.placed`, since stock isn't
   guaranteed yet at that point.

Cancelling or returning a *confirmed* order (user or admin) re-publishes
`order.cancelled`, which tells product-service to restock those items
(`returned` reuses the same event and restock logic as `cancelled` — the
consumer keys off `stockStatus`, not the specific status string). Orders
rejected by the saga were already rolled back in step 2, so product-service
checks `stockStatus !== 'confirmed'` before restocking to avoid
double-crediting.

### Card payments and the saga

Card orders add a synchronous step *before* the saga even starts: `place-order`
calls payment-service to verify the Stripe PaymentIntent actually succeeded,
and only creates the order (already `paymentStatus: 'paid'`, using Stripe's
own confirmed amount) if that checks out. If verification fails, the order
is never created at all and the customer sees an error immediately — no
saga, no cleanup needed.

The one genuine race this doesn't close: stock can run out in the window
between "card charged" and "product-service's saga reserves it". If that
happens, `order.stock_rejected` fires like normal, but order-service's
consumer additionally checks `paymentMethod === 'card' && paymentStatus ===
'paid'` and calls payment-service's refund endpoint automatically before
marking the order cancelled — a customer never ends up charged for stock
that doesn't exist. The same refund path also fires for user-initiated
cancellations and admin cancel/return actions on already-paid card orders
(`refundIfPaidCardOrder` in `orderController.js`).

If a refund call itself fails (payment-service down, Stripe API error), the
order still gets cancelled — leaving a paid customer with a cancelled order
is worse than a stuck charge, but it's still logged loudly
(`console.error('REFUND FAILED...')`) rather than silently swallowed, since
that scenario needs a human to reconcile it manually via the Stripe
dashboard. There's no admin UI surfacing this yet — it's a log line, not a
dashboard alert. Worth adding before this handles real money at any volume.

`payment.confirmed` (published from payment-service's Stripe webhook) is a
pure durability backstop, not the primary path: if the customer's browser
dies between Stripe confirming payment and `place-order` actually reaching
order-service, this event is the only signal that charge ever happened.
order-service's consumer looks up the order by `paymentIntentId` and marks
it paid if it's not already — and just logs a warning if no matching order
exists yet (the order legitimately might not have been placed yet; this
isn't an error condition, just something worth knowing about for support).

---

## Inter-service auth flow

Client sends Bearer access token -> Gateway verifies JWT, injects
`x-user-id`/`x-user-role` headers -> proxies to service -> service trusts
the headers (no DB hit needed for role checks). Refresh tokens never touch
the gateway's JWT verification — `/api/auth/refresh-token` is a public route
since the refresh token itself, not a Bearer header, is the credential.

`JWT_SECRET` must match across root `.env` (gateway) and `auth-service/.env`
(token signing) — they are the same secret.

### Gateway routing notes

Registration order matters in `api-gateway/index.js` — Express matches the
first registered `app.use(mountPath, ...)` prefix that fits. One route
needs special handling: `/api/admin/users/:id/orders` must reach
order-service (which owns order data), while everything else under
`/api/admin/users` reaches auth-service (which owns user data). Rather than
maintain two competing mount points that could drift, the gateway inspects
the tail of the path inside a single `/api/admin/users` handler and
branches by regex. See the comment block in `api-gateway/index.js` if you
need to add another cross-service split like this.

---

## Local development (no Docker)

```bash
cd auth-service         && cp .env.example .env && npm install && npm run dev
cd ../product-service   && cp .env.example .env && npm install && npm run dev
cd ../order-service     && cp .env.example .env && npm install && npm run dev
cd ../dashboard-service && cp .env.example .env && npm install && npm run dev
cd ../notification-service && cp .env.example .env && npm install && npm run dev
cd ../payment-service   && cp .env.example .env && npm install && npm run dev
cd ../api-gateway       && cp .env.example .env && npm install && npm run dev
```

Or just `./runall.sh` from the repo root to start all seven with one command
(requires Mongo + RabbitMQ + Redis already running locally — `docker-compose up
mongo-auth mongo-product mongo-order mongo-payment rabbitmq redis` gets you just
the infra without the app services, if you want fast-reload `npm run dev`
on the app code instead of rebuilding containers every change).

**Google OAuth** (`auth-service`) needs a real `GOOGLE_CLIENT_ID` from
Google Cloud Console — `POST /api/auth/google` will 500 without it, since
`OAuth2Client` needs an audience to verify against. **Stripe**
(`payment-service`) needs `STRIPE_SECRET_KEY`; `STRIPE_WEBHOOK_SECRET` is
only required if you want webhook-driven reconciliation to actually verify
signatures (see the Stripe CLI command in Quick Start above) — the primary
verify-on-place-order path works without it.

**Admin registration for testing** (`auth-service`) is off by default —
`POST /api/auth/admin-register` always 403s unless `ADMIN_REGISTRATION_CODE`
is set. Set it locally to let the admin dashboard's `/register` page create
a `staff` or `admin` account without touching Mongo directly. Never set this
in a real deployment — see the admin dashboard's own README for the full
reasoning on why this is a shared-secret dev convenience, not an "invite a
teammate" production feature.

---

## Caching (Redis)

Two genuinely different uses of Redis in this system — worth keeping the distinction clear,
since only one of them is "caching" in the speed-optimization sense:

**1. product-service's read cache** (`product-service/utils/cache.js`) — cache-aside for
`getFilteredProducts`, `getProductById`, `getLatestProducts`, `getBestSellers`,
`searchProducts`, `relatedProducts`. This replaced an existing **in-memory** `node-cache`
instance, which is a real correctness bug once you run more than one pod: each replica had its
own separate cache, so (a) your effective cache hit rate dropped proportionally to replica
count, and (b) a write on one pod never invalidated the cache on any other pod, so different
replicas could serve different stale answers to the same request depending on which one a
load balancer happened to route to. Redis fixes both, since the cache is shared across every
replica.

Invalidation uses a version-counter pattern rather than pattern-deleting keys: every list-type
cache key embeds a version number (`getCacheVersion()`), and any write (create/update/delete/
bulk action, or the stock reserve/release calls in `rabbitmq/consumer.js`) increments that
version. Every previously-cached list response becomes unreachable immediately — new requests
build a new versioned key, old ones just expire on their own TTL and are never read again. This
avoids `SCAN`+`DEL`-ing an unbounded number of filter/sort/page key combinations to get correct
invalidation. Single-product detail caches are invalidated directly by key instead, since we
always know exactly which product changed.

**What's deliberately NOT cached, and why:**
- **payment-service's price lookups** — the entire point of that code path is computing a
  charge amount you can trust *right now*; caching it would reintroduce the stale-price risk
  the whole service exists to close.
- **Order status/tracking** — needs to reflect the real current state, not a snapshot from
  up to `LIST_TTL_SECONDS` ago.
- **Stock counts at the moment of checkout** — cached product listings can show slightly
  stale stock (that's fine, it's corrected by the time it matters), but the actual reservation
  in `product-service/rabbitmq/consumer.js`'s `reserveStock` always hits Mongo directly with
  an atomic `findOneAndUpdate`, never the cache. Caching would risk overselling.

**2. api-gateway's rate limiter store** (`api-gateway/middleware/rateLimitStore.js`) — this
isn't a cache at all, it's *shared state*, but it's the more important of the two Redis use
cases to understand if you're about to run multiple gateway replicas in Kubernetes.
`express-rate-limit`'s default store is an in-memory `Map` scoped to one process — with 2+
gateway pods behind a Service, each pod counts independently, so a "10 requests per 15
minutes" login limiter silently becomes "10 × (however many gateway pods happen to be up)"
in practice, and a client can partially reset their own budget just by getting load-balanced
to a different pod. Backing the store with Redis makes the limit apply to the whole fleet.
This bit us directly during testing — see the code comment in that file for a real crash this
caused and how it was fixed (`maxRetriesPerRequest: null`, not a finite number — a finite
value surfaced as an unhandled promise rejection that took down the entire gateway process
when Redis was briefly unreachable, not just the rate limiter).

**Not yet cached, worth considering later:** `auth-service`'s per-request user lookup in its
JWT middleware hits Mongo on literally every authenticated request. Caching `user:{id}` for a
few seconds (invalidated on profile update) would cut a real amount of Mongo load under
sustained traffic — not done here to keep this addition scoped, but it's the next-most-obvious
candidate if you're chasing more throughput.

## Observability (Prometheus metrics)

Every service exposes a real `/metrics` endpoint (`prom-client`) alongside its existing
`/health` — this is what makes the Grafana Cloud setup in `k8s/observability/` actually show
real data instead of an empty dashboard.

The six Express services (`api-gateway`, `auth-service`, `product-service`, `order-service`,
`dashboard-service`, `payment-service`) share the same metric names — `http_requests_total`
and `http_request_duration_seconds`, both labeled by `method`, `route`, `status_code` — via a
near-identical `utils/metrics.js` in each. Deliberately *not* prefixed per-service (an earlier
version of this did that, and it was a mistake — see below); Prometheus's own `job` label,
set explicitly per service via the `k8s.grafana.com/job` annotation on each Deployment,
already differentiates them. This is what lets one dashboard panel do
`sum by (job) (rate(http_requests_total[5m]))` and show every service on one graph, instead
of needing a hand-written panel per service with a different metric name in each.

**The `route` label is the one detail that actually matters here**: every service uses
`req.route.path` (Express's matched route *template*, e.g. `/product/:id`) rather than
`req.path` (the literal resolved URL, e.g. `/product/68f2a9...`). Using the resolved path
would mean a new permanent time series for every product/order/user ID ever requested —
unbounded cardinality that would silently blow up both local Prometheus memory and (if you've
connected Grafana Cloud) your active-series billing, for a label that stops being useful the
moment it's not templated anyway. `api-gateway` is the one exception with its own version of
this file: it's a pure proxy (`app.use('/api/products', proxy(...))` is a middleware mount,
not an Express route), so `req.route` is essentially never set there — it normalizes paths by
hand instead (regex-matching anything that looks like a Mongo ObjectId or a numeric ID and
replacing it with `:id`).

`notification-service` has no HTTP application traffic to measure (just `/health`/`/metrics`
themselves — see its own `index.js`, a consumer-only service that got a minimal HTTP server
added specifically so it wasn't a monitoring blind spot). Its `utils/metrics.js` tracks RabbitMQ
message processing instead: `notification_messages_processed_total` (labeled by routing key
and outcome — success/failure/unhandled) and `notification_message_processing_duration_seconds`
(mostly reflects SMTP send latency, its one real external dependency).

Every service's default Node.js process metrics (CPU, memory, event loop lag, GC pause time)
come along for free via `prom-client`'s `collectDefaultMetrics()` — no custom code needed,
and often the fastest way to catch a slow memory leak or an event-loop-blocking bug before it
manifests as anything a user would notice or a log line would explain.

See `k8s/observability/README.md` for actually shipping this data to Grafana Cloud and a
starter dashboard to import.

## Running this on Kubernetes (kind / minikube), monitoring, and load testing

See **`k8s/README.md`** for the full walkthrough: cluster setup for both kind and minikube,
building/loading images without a registry, applying the manifests in `k8s/` in the right
order, health-check strategy (every service now exposes `/health`, including
notification-service which previously had no HTTP surface at all to probe), and a concrete
autocannon-based load-testing workflow — including the specific test that demonstrates what
the Redis caching work above actually bought you in req/sec and p99 latency.

## Known limitations / honest tradeoffs

A few things worth knowing about before this handles real traffic or money
at any real volume:

- **`totalAmount` is still client-trusted for `cod`/`bkash`/`nagad` orders.**
  Only the `card` path recomputes the price server-side (see Payments
  above) — extending that same verification to every payment method would
  mean order-service calling product-service for a price lookup on every
  single order, which is a reasonable next step but wasn't done here to
  keep this addition scoped to "add Stripe" rather than "redesign order
  pricing". For methods reconciled manually by staff anyway (cash on
  delivery, mobile banking transfers), the blast radius of a tampered total
  is smaller than it is for an instantly-charged card — but it's not zero.
- **payment-service ignores per-variant `priceModifier`.** The frontend's
  product page applies a variant's price adjustment client-side before
  adding to cart; payment-service's server-side price check only knows
  about `price`/`discountPrice` on the base product. If you start using
  variant price modifiers for real, extend `priceItemsAuthoritatively` in
  `payment-service/controllers/paymentController.js` to account for them.
- **`dashboard-service` doesn't aggregate payment-service's data yet.**
  It currently reads directly from auth/product/order's MongoDB instances
  for the admin summary/analytics views (see its own README note on that
  tradeoff) — adding `mongo-payment` as a fourth source would be the
  natural way to surface refund/payment-failure visibility in the admin
  dashboard once that UI exists.
- **A failed automatic refund is a log line, not an alert.** See the "Card
  payments and the saga" section above.

---
