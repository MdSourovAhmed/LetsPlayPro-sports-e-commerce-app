# LetsPlayPro — Frontend

Sports e-commerce frontend, wired to the real `LetsPlayPro-Microservices` backend.

**Built so far:** Home, Shop, Product Details, Cart, Checkout, Order Success, Wishlist,
Compare, full Account section (Dashboard, Profile, Address Book, Orders, Order
Details/Tracking, Settings), Login, Register, Forgot/Reset Password, FAQ, Terms, Privacy
Policy, Refund Policy, Maintenance — plus Google OAuth login and Stripe card payments, all
now wired against real backend endpoints (see below).

## ⚠️ Persistent session bug fixed this round

Reloading a protected page (e.g. `/account`) could silently log a genuinely-logged-in user
out. The session data was being restored correctly the whole time — the bug was a race
between that restoration and the route guard's redirect decision:

- `accessToken`/`isAuthenticated` are deliberately **not** persisted (correct, for security —
  only `refreshToken` + `user` survive a reload). Restoring a real session on boot means
  exchanging that refresh token for a new access token via an actual network call
  (`useAuthBoot.js`), which takes a moment.
- `App.jsx` called `useAuthBoot()` but **discarded its return value**. Nothing gated
  rendering on it.
- `ProtectedRoute` checked `isAuthenticated` on the very first render — before that network
  call had any chance to resolve — saw the pre-boot default of `false`, and redirected to
  `/login` immediately. By the time the refresh actually succeeded a moment later, the user
  was already sitting on the login page.

**Fixed** by moving the boot status into the store itself rather than local component state
that only `App.jsx` could see:
- `useAuthStore` now has an ephemeral (never persisted) `isBooting` field, `true` until
  `useAuthBoot.js` has actually confirmed whether a persisted session is still valid.
- `ProtectedRoute` and `GuestRoute` read `isBooting` directly from the store and hold off
  making any auth-based redirect decision until it resolves — a brief "Loading…" instead of a
  premature bounce to `/login`.
- Deliberately **not** gating the whole app behind this (unlike a naive fix that shows a
  full-page spinner on every load) — public pages (Home, Shop, Product Details, Cart) render
  immediately regardless of boot status, since they don't need to know whether anyone's
  logged in. Only the two route guards that actually make a redirect decision based on auth
  state wait for it. Guests with no persisted session at all resolve `isBooting` to `false`
  synchronously in `useAuthBoot.js` — this only ever adds a wait for returning users who
  actually have a session to restore, and even then only on the specific routes that needed
  to know before rendering.

## ⚠️ Backend contract corrections this round — read if you pulled an earlier build

The last frontend milestone was built against an *assumed* API contract, since only the
gateway's route list was available at the time. Now that the real backend controllers exist,
several of those assumptions turned out to be wrong. All fixed now, but worth knowing about if
anything looks different from before:

- **Orders use `{ order }` / `{ orders }`, not `{ data }`.** `place-order`, `/orders/my`,
  `/orders/:id`, cancel, and update-info all return `{ success, order }` or `{ success,
  orders, total, pages }` — not the generic `{ data }` envelope every other endpoint uses.
  Fixed by normalizing at the `orderApi.js` boundary (`.then((r) => ({ data: r.data.order }))`
  etc.) rather than changing every page that consumes it. **This was the highest-impact fix**
  — it silently broke the order-success page and order history entirely, since `res.data` was
  `undefined` against the real backend.
- **`GET /user/profile` returns the user object directly**, not `{ user }`. Normalized in
  `authApi.js` the same way.
- **`/products/related` takes `{ sport, type, excludeId }`, not `{ productId }`.** Fixed in
  `productApi.js` and `ProductDetails.jsx`'s call site — the "Related Products" section was
  silently returning nothing before this.
- **`/payments/create-intent` takes cart items, not an amount.** The real backend
  (`payment-service`) recomputes the authoritative charge from product-service's live prices
  itself — sending a client-computed total wouldn't have done anything except be ignored.
  Fixed in `paymentApi.js` and `Checkout.jsx`; also now surfaces per-item stock/pricing issues
  from a 409 response instead of a generic error.
- **Address Book is now backend-backed.** The old `useAddressBookStore` (localStorage-only
  placeholder) is deleted — `AddressBook.jsx` now uses real `GET/POST/PUT/DELETE
  /user/addresses` endpoints via a new `useAddresses.js` hook file.
- **Order Details now fetches directly** via the real `GET /orders/:orderId` endpoint
  (`useOrder` hook) instead of filtering the full `/orders/my` list client-side.

## ⚠️ Cart store bug fixed in an earlier round (still relevant)

`useCartStore.js` used to define `subtotal`/`itemCount`/`activeItems` as **getters** on the
state object, which zustand's `persist` middleware silently freezes into plain numbers on
rehydration — breaking the cart badge and getting Checkout stuck disabled. Fixed by replacing
them with plain selector functions (`selectCartSubtotal`, `selectCartItemCount`) computed
fresh from `items` on every call. Flagging here since it's easy to accidentally reintroduce
this pattern.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Set in `.env`:
- `VITE_API_BASE_URL` — your gateway base URL (default `http://localhost:3000/api`)
- `VITE_GOOGLE_CLIENT_ID` — **must match** the backend's `GOOGLE_CLIENT_ID` exactly (same
  Google OAuth Client ID, both sides verify against the same audience). Add your dev URL
  (`http://localhost:5174`) to that Client ID's "Authorized JavaScript origins" in Google
  Cloud Console.
- `VITE_STRIPE_PUBLISHABLE_KEY` — your Stripe **publishable** key (`pk_test_...`), matching
  the same Stripe account as the backend's `STRIPE_SECRET_KEY`.

## Stack

React 19 · Vite 7 · Tailwind CSS v4 · React Router 7 · Axios · Zustand · TanStack Query ·
React Hook Form + Zod · Swiper · Framer Motion · Lucide React · react-hot-toast ·
`@react-oauth/google` · `@stripe/react-stripe-js` + `@stripe/stripe-js`

## Backend is now fully live — nothing assumed anymore

Every endpoint this frontend calls now exists and has been cross-checked against the actual
backend controller code (not just the route list). The one thing still worth knowing: the
backend only recomputes the charge amount server-side for **card** payments — `cod`/`bkash`/
`nagad` orders still trust whatever `totalAmount` this frontend sends. See the backend repo's
README ("Known limitations / honest tradeoffs") for the full reasoning; nothing to fix here on
the frontend, just worth knowing the trust boundary if you're reasoning about this end-to-end.

## New in this milestone

- **Account section** (`/account/*`, behind `ProtectedRoute`) — Dashboard with quick stats and
  recent orders, Profile (edit name/email/phone), Address Book (add/edit/delete/set default —
  now real backend calls, not localStorage), Orders (list) and Order Details (status timeline,
  cancel with reason, shipping/payment summary — now a direct single-order fetch), Settings
  (change password). Sidebar nav + logout in `AccountLayout`.
- **Compare page** (`/compare`) — side-by-side table (brand, sport, type, availability,
  material, weight, color, sizes, discount) for up to 4 products, plus a floating
  `CompareBar` that appears globally whenever the compare list is non-empty.
- **Static pages** — FAQ (accordion), Terms, Privacy Policy, Refund Policy, Maintenance.
  Footer links updated to point at the real ones.
- **All the contract corrections above.**

## Still not built

Dark mode toggle UI (tokens already exist in `index.css`), multi-vendor readiness,
WebSocket/real-time stock updates, and a "use a saved address" shortcut in Checkout (the
Address Book backend now supports it — Checkout just doesn't offer picking from it yet, it's
manual entry only).

## Folder structure (additions this milestone)

```
src/
  components/
    account/    AccountLayout, OrderCard, OrderStatusTimeline, AddressForm
    product/    CompareBar
    ui/         FaqItem, LegalPage
  pages/
    account/    Dashboard, Profile, AddressBook, Orders, OrderDetails, Settings
    Compare.jsx, FAQ.jsx, Terms.jsx, PrivacyPolicy.jsx, RefundPolicy.jsx, Maintenance.jsx
  hooks/
    useOrders.js       useMyOrders, useOrder, useCancelOrder
    useAddresses.js    useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress
```

