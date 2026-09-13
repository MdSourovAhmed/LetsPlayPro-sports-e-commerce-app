# LetsPlayPro Admin

Admin dashboard for LetsPlayPro, aligned against the real `LetsPlayPro-Microservices` backend
and the storefront's product/order/user data model.

## What this template already had going for it

Before touching anything, this was cross-checked file-by-file against the actual backend
controllers (not just the route list) — and it held up well. The component library
(`Button`/`Input`/`Badge`/`Modal`/`Skeleton`/`States`) already matches your real `Order`/
`Product` status enums exactly, the API contracts documented in each `api/*.js` file line up
almost exactly with the real backend, and accessibility/dark-mode work was already done
properly. Very little of it needed to be redesigned — most of the work here was completing
what was started and fixing two real bugs.

## ⚠️ Two real bugs found and fixed

1. **`dashboard-service/routes/dashboardRoutes.js` had its auth check commented out.**
   `GET /admin/dashboard/summary` — total revenue, order counts, user counts — was completely
   public, no login required. This is a backend fix (in the `letsplaypro-backend` repo, not
   here), included in this pass since it directly affects whether this dashboard is actually
   secure.
2. **"Remember me" on login was decorative.** Wired to the form, changed nothing about session
   persistence. See below for what it does now.

## Persistent session — how it's actually correct now

This is the part you specifically asked to get right, so here's the full reasoning:

**"Remember me" now actually changes where the session lives** (`store/authStore.js`):
checked → `localStorage` (survives closing the browser entirely); unchecked →
`sessionStorage` (survives a page refresh, cleared when the tab/browser closes — appropriate
for a shared or public computer). Switching between them mid-use doesn't leave a stale copy of
a previous session sitting in the other storage; each login explicitly clears the one it isn't
using.

**The route-guard race condition is closed** (`hooks/useHasHydrated.js` + `App.jsx`). This is
the actual mechanism worth understanding, because it's the same bug your storefront has:

Zustand's `persist` middleware restoring session data from storage isn't guaranteed to finish
before React's first render — with a synchronous storage engine like `localStorage` it usually
resolves within the same tick, but "usually" and "within a tick" are exactly the kind of gap a
route guard checking `isAuthenticated` on first render can lose. If a guard makes its
redirect decision before hydration finishes, it sees the pre-hydration default (`isAuthenticated:
false`) and bounces an actually-logged-in user to `/login` — a session that "isn't persisting"
even though the data was restored correctly moments later.

The fix: `App.jsx` now renders a spinner instead of the route tree until
`useAuthStore.persist.hasHydrated()` is `true`. `ProtectedRoute`/`PublicOnlyRoute` never get a
chance to check `isAuthenticated` against a not-yet-restored value, because they don't render
at all until hydration is confirmed done. In practice this spinner is on screen for at most one
tick — it's not a real loading state, it's closing a race window.

**Logout now actually revokes the session server-side** (`components/layout/Header.jsx`) —
it was only clearing local state before, which meant a leaked refresh token would keep working
after "logout" until it naturally expired.

### Why your storefront has the same symptom, worse

Your client-side app (`useAuthBoot.js`) hits this same race, but in a more severe form: it
deliberately doesn't persist the access token at all (correct, for security — a public
storefront is a much bigger XSS target than an internal admin tool, so keeping the access
token memory-only there is the right call, not a mistake to copy this admin app's simpler
pattern for). That means on every reload, restoring a real session requires an actual **network
round-trip** (exchanging the refresh token for a new access token) before `isAuthenticated` can
become `true` again — and `useAuthBoot` returns an `isBooting` flag for exactly this purpose,
but `App.jsx` calls `useAuthBoot()` and discards the return value. Nothing gates rendering on
it. `ProtectedRoute` checks `isAuthenticated`, sees `false` (the network call hasn't resolved
yet), and redirects to `/login` — before the exchange that would have proven the session was
valid ever gets the chance to finish.

Same root cause as this app had, worse consequence because a network call is orders of
magnitude slower than a storage read. Same fix applies: gate the route tree on "have we
finished figuring out whether there's a valid session" (`isBooting === false`), not on the
current value of `isAuthenticated` alone. You already have the flag — `App.jsx` just needs to
use it instead of showing routes immediately.

## Test admin registration (new)

Added for local testing — a `/register` page (linked subtly from Login) that creates a real
staff or admin account without needing an existing admin to create one first, or touching
Mongo by hand.

**This is gated off by default and stays off unless you explicitly turn it on:**
- The backend endpoint (`POST /auth/admin-register` in `auth-service`) checks
  `process.env.ADMIN_REGISTRATION_CODE` — if that's unset (the default in every
  `.env.example` in the backend repo), the endpoint always returns 403, full stop, regardless
  of what's submitted.
- To use it locally: set `ADMIN_REGISTRATION_CODE=some-value` in the backend's `.env` (or the
  k8s secret), restart `auth-service`, then use that value as the "Invite Code" on the
  register page.
- It can only create `staff` or `admin` accounts — never `super_admin`. That role is reserved
  for manual seeding (direct DB insert or a one-off script), since it's the one role that can
  delete other admin accounts.
- **Never set `ADMIN_REGISTRATION_CODE` in a real deployment.** If you want an "invite a
  teammate" flow for production, that's a different feature — one where an already-logged-in
  admin creates the account (an "Add User" action in Users, authenticated and role-checked
  server-side the same way `deleteUser`/`setUserActiveStatus` already are), not a public
  endpoint gated by a shared secret that has to be remembered to be turned off.

## New pages built out (were empty placeholder stubs)

- **Products** — list with search/status filter/sort/pagination, bulk actions (activate/draft/
  archive/delete), full create/edit form (pricing, categorization matching the storefront's
  exact Sport/Type filter values so admin-created products are actually discoverable, image
  upload via base64 — no separate upload endpoint needed, Cloudinary accepts data URIs
  directly — specifications, variants with per-variant price/stock).
- **Orders** — list with search/status/payment-status filters, detail page with items,
  shipping info, status updates (reason required for cancel/return, with a visible warning
  when cancelling a paid card order that it'll trigger an automatic refund), payment status
  override, internal admin notes (never customer-visible), PDF invoice download.
- **Users** — list with search/role/status filters, detail page with profile info, order
  history, activate/deactivate and delete — both gated to `admin`+ role client-side (staff
  can view but not act, matching the backend's actual permission check) and both disabled for
  your own account, matching the backend's self-protection guards so the button doesn't even
  invite a 400 you'd have to explain.
- **Analytics** — date-range picker (daily/weekly/monthly/yearly/custom, matching the
  backend's exact contract), overview stats, revenue-over-time line chart, top products,
  category breakdown pie chart, payment method breakdown, CSV export.
- **Settings** — profile editing, change password.

## Also fixed while building these

- `formatCurrency` was rounding to whole dollars (`maximumFractionDigits: 0`) — a $19.99
  product displayed as $20. Now shows cents correctly.
- The whole dashboard is now actually gated by role (`ProtectedRoute minimumRole="staff"` on
  the main route tree) — before this, any account that could log in at all (including a plain
  customer account) could reach the admin dashboard's shell, relying entirely on individual
  pages to reject them. Login itself doesn't distinguish by role — it can't, the same endpoint
  serves the storefront — so this check has to live here.
- ESLint wasn't configured at all — added, matching the storefront's flat-config setup.

## Known gaps / things I'd do next

- **Product image upload has no progress indicator or size compression.** Base64-encoding a
  5MB image client-side and posting it works fine but isn't fast on a slow connection — if
  this becomes a real pain point, a direct-to-Cloudinary unsigned upload widget would remove
  the round-trip through your own server entirely.
- **Order line items show a shortened product ID, not the product name/image.** order-service
  doesn't store a product name snapshot on the order (only `priceAtPurchase`), and this admin
  app doesn't currently make the cross-service call to product-service to resolve it. Worth
  adding if you're regularly looking at order details — either have order-service snapshot
  the product name at order time (most correct, avoids a live lookup for historical orders
  entirely) or have this frontend fetch product details for display only.
- **PDF export for analytics isn't implemented** — this is a backend limitation
  (`dashboard-service` returns 501 for `format=pdf`), not something to fix here. CSV export
  works fully.
- **No pagination on the admin notes list** in Order Detail — fine at realistic note counts
  per order, would need attention if that ever grows unbounded.
