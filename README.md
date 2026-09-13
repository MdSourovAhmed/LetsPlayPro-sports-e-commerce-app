# LetsPlayPro

A full-stack sports-equipment e-commerce platform: a customer storefront, an admin dashboard, and a Node.js microservices backend, all built to share one product/order/user data model.

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repo structure](#repo-structure)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Feature tour](#feature-tour)
- [Security note](#security-note)
- [Known limitations](#known-limitations)
- [Further reading](#further-reading)

## Overview

LetsPlayPro is three coordinated apps in one repo:

| App | Path | What it is |
|---|---|---|
| **Storefront** | [`client/`](./client) | Customer-facing React app — browse, cart, checkout, accounts |
| **Admin dashboard** | [`admin/`](./admin) | Internal React app for staff/admin — products, orders, users, analytics |
| **Backend** | [`backend-microservices-KiND/`](./backend-microservices-KiND) | Seven Node.js microservices behind an API gateway, plus RabbitMQ, Redis, and per-service MongoDB |

## Architecture

```
                        ┌─────────────┐
   client (5174) ──┐    │             │
                    ├──▶│ api-gateway │──▶ auth-service ──────▶ mongo-auth
   admin (5173) ────┘   │   :3000     │──▶ product-service ───▶ mongo-product
                        │             │──▶ order-service ─────▶ mongo-order
                        └─────────────┘──▶ dashboard-service ─▶ (reads all 3 above)
                               │
                               └────────▶ payment-service ────▶ mongo-payment
                                                 │                    │
                                            Stripe API          RabbitMQ ──▶ notification-service ──▶ SMTP
```

- The gateway is the single entry point for both frontends: it validates JWTs, rate-limits, and routes to each service.
- Services talk to each other directly (not through the gateway) for a few specific internal calls — e.g. payment-service pricing an order against product-service's live prices, or order-service verifying a charge with payment-service.
- RabbitMQ carries the async events that drive the order-placement stock-reservation saga (see the backend README for the full flow).
- Redis backs product-service's read cache and the gateway's rate-limit counters — required once you run more than one replica of either.

## Repo structure

```
LetsPlayPro/
├── client/                       # Storefront (React 19 + Vite)
├── admin/                        # Admin dashboard (React 18 + Vite)
└── backend-microservices-KiND/   # Backend services + Kubernetes manifests
    ├── api-gateway/
    ├── auth-service/
    ├── product-service/
    ├── order-service/
    ├── payment-service/
    ├── dashboard-service/
    ├── notification-service/
    ├── k8s/                      # kind/minikube manifests + observability
    ├── docker-compose.yml
    └── runall.sh                 # start all 7 services locally without Docker
```

Each of the three apps has its own detailed README — this file is the map; theirs are the territory:
- [`client/README.md`](./client/README.md)
- [`admin/README.md`](./admin/README.md)
- [`backend-microservices-KiND/README.md`](./backend-microservices-KiND/README.md)

## Tech stack

**Storefront** — React 19 · Vite 7 · Tailwind CSS v4 · React Router 7 · TanStack Query · Zustand · React Hook Form + Zod · Stripe.js · Google OAuth · Framer Motion

**Admin** — React 18 · Vite · Tailwind CSS v4 · Zustand · React Hook Form + Zod · Recharts

**Backend** — Node.js/Express (×6 services) · MongoDB (one database per service) · RabbitMQ · Redis · Stripe · Cloudinary · Prometheus metrics (`prom-client`) · Docker Compose · Kubernetes (kind/minikube) manifests

## Getting started

### 1. Backend

```bash
cd backend-microservices-KiND
cp .env.example .env   # fill in JWT_SECRET, Google, Stripe, Cloudinary, SMTP credentials
docker-compose up --build
curl http://localhost:3000/health
```

Prefer running services natively without Docker? See "Local development (no Docker)" in the [backend README](./backend-microservices-KiND/README.md) — `./runall.sh` starts all seven with one command.

### 2. Storefront

```bash
cd client
npm install
cp .env.example .env   # set VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID, VITE_STRIPE_PUBLISHABLE_KEY
npm run dev             # http://localhost:5174
```

### 3. Admin dashboard

```bash
cd admin
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

## Environment variables

Each app and service has its own `.env.example` — copy it to `.env` before running. The pieces most likely to trip you up:

- **`JWT_SECRET`** must be identical in the backend root `.env` (gateway) and `auth-service/.env` — they verify the same tokens.
- **`GOOGLE_CLIENT_ID`** (backend) and **`VITE_GOOGLE_CLIENT_ID`** (storefront) must be the same Google OAuth Client ID.
- **Stripe**: backend `STRIPE_SECRET_KEY` and storefront `VITE_STRIPE_PUBLISHABLE_KEY` must belong to the same Stripe account. For local webhook testing, use the Stripe CLI (see backend README Quick Start).
- **`ADMIN_REGISTRATION_CODE`**: leave unset in any real deployment — it gates a dev-only "create a staff/admin account without an existing admin" endpoint used by the admin app's `/register` page. See the [admin README](./admin/README.md) for the full reasoning.

## Feature tour

### Storefront
Home, Shop, Product Details, Cart, Checkout (Stripe card payments + COD/bKash/Nagad), Order Success, Wishlist, Compare (up to 4 products), full Account section (Dashboard, Profile, Address Book, Orders, Order Tracking, Settings), Google OAuth + email/password auth, FAQ/Terms/Privacy/Refund static pages.

### Admin dashboard
Products (search/filter/bulk actions, full create/edit with variants and image upload), Orders (status management, refund-aware cancellation, admin notes, PDF invoices), Users (role-gated activate/deactivate/delete), Analytics (date-range revenue, top products, category and payment-method breakdowns, CSV export), role-hierarchy access control (`user < staff < admin < super_admin`).

### Backend
JWT auth with rotating refresh tokens, Google OAuth, event-driven stock-reservation saga over RabbitMQ, server-side Stripe price verification (no client-trusted charge amounts on the card path), automatic refunds on cancel/return/stock-loss, Redis caching and shared rate-limiting, Prometheus metrics on every service, and Kubernetes manifests for running the whole system on kind or minikube.

## Security note

An earlier export of `notification-service/.env.example` contained what looked like a real Gmail address and app password. It's been replaced with a placeholder in this repo, but if that credential was ever real, revoke the app password in Google Account → Security → App Passwords regardless of where this code has or hasn't been shared. See the [backend README](./backend-microservices-KiND/README.md#️-rotate-this-credential--do-it-before-anything-else) for the full note.

## Known limitations

- `totalAmount` is only recomputed server-side for **card** payments — COD/bKash/Nagad orders currently trust the client-sent total (acceptable for now since staff reconcile those manually, not zero-risk).
- `dashboard-service` doesn't yet aggregate payment-service's data (refunds/payment failures aren't visible in the admin analytics views).
- PDF analytics export isn't implemented on the backend (CSV export works).
- Product image upload in the admin app has no progress indicator or client-side compression.
- Dark mode toggle UI, multi-vendor support, and real-time stock updates aren't built on the storefront yet.

Each sub-README has a fuller "known gaps" section with more detail and suggested next steps.

## Further reading

- [`client/README.md`](./client/README.md) — frontend contract fixes, auth-boot race-condition fix, folder structure
- [`admin/README.md`](./admin/README.md) — persistent-session design, role gating, admin-registration flow
- [`backend-microservices-KiND/README.md`](./backend-microservices-KiND/README.md) — full API reference, RabbitMQ event map, order-placement saga, caching strategy, Kubernetes/observability setup
- [`backend-microservices-KiND/k8s/README.md`](./backend-microservices-KiND/k8s/README.md) — kind/minikube cluster setup, monitoring, load testing
