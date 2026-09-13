import { axiosInstance } from "./axiosInstance";

/**
 * POST /payments/create-intent takes cart *items*, not an amount — the backend looks up each
 * item's current price directly from product-service and computes the authoritative total
 * itself before ever talking to Stripe. Never send a client-computed total here; the backend
 * would ignore it even if you did.
 *
 * Returns { clientSecret, paymentIntentId, amount, currency } — `amount` is in cents and is
 * the server-confirmed total, useful for a final "you're being charged $X" confirmation UI.
 *
 * Can 409 with { message, issues: [{ productId, reason }] } if any item is out of stock, no
 * longer exists, or isn't active — surface `issues` to the user rather than a generic error.
 */
export const paymentApi = {
  createStripeIntent: (items) =>
    axiosInstance.post("/payments/create-intent", { items }).then((r) => r.data),
};
