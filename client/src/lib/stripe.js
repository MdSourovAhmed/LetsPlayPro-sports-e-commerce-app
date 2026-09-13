import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../utils/constants";

// loadStripe caches internally, but we still only want to call it once per app load.
let stripePromise;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = STRIPE_PUBLISHABLE_KEY
      ? loadStripe(STRIPE_PUBLISHABLE_KEY)
      : Promise.resolve(null);
  }
  return stripePromise;
}
