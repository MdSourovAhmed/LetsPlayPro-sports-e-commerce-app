const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Payment] STRIPE_SECRET_KEY is not set — card payments will fail until it is configured.');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

module.exports = stripe;
