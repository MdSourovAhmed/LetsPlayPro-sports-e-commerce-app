const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const productClient = require('../clients/productClient');
const publisher = require('../rabbitmq/publisher');

/**
 * Recomputes the authoritative order total from product-service's current
 * prices. NEVER trust a client-supplied amount for anything that results in
 * a real charge — this is the one function in the whole payment flow that's
 * allowed to decide "how much money", and it decides it by asking the
 * system of record (product-service), not by reading req.body.
 *
 * Note: this deliberately ignores per-variant priceModifier (the frontend's
 * ProductDetails page applies that client-side when adding to cart) — see
 * README for why that's a known simplification, not an oversight.
 *
 * @param {Array<{productId: string, quantity: number, size?: string}>} items
 * @returns {Promise<{amountCents: number, currency: string, pricedItems: Array, issues: Array}>}
 */
async function priceItemsAuthoritatively(items) {
  const pricedItems = [];
  const issues = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await productClient.getProduct(item.productId);

    if (!product) {
      issues.push({ productId: item.productId, reason: 'Product no longer exists' });
      continue;
    }
    if (product.status && product.status !== 'active') {
      issues.push({ productId: item.productId, reason: 'Product is not currently available' });
      continue;
    }
    if ((item.quantity || 0) < 1) {
      issues.push({ productId: item.productId, reason: 'Invalid quantity' });
      continue;
    }
    if (product.stock < item.quantity) {
      issues.push({
        productId: item.productId,
        reason: `Only ${product.stock} left in stock`,
      });
      continue;
    }

    const unitPrice = product.discountPrice ?? product.price;
    subtotal += unitPrice * item.quantity;

    pricedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      unitPrice,
    });
  }

  // Same shipping/tax model as the frontend's utils/orderTotals.js —
  // keep these three numbers in sync if either side changes them.
  const FREE_SHIPPING_THRESHOLD = 75;
  const FLAT_SHIPPING = 7.5;
  const TAX_RATE = 0.05;

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = subtotal * TAX_RATE;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  return {
    amountCents: Math.round(total * 100),
    currency: 'usd',
    pricedItems,
    issues,
  };
}

// ─── POST /payments/create-intent ─────────────────────────────────────────────
// Public (guest checkout must work) — but the gateway's optional-auth
// middleware forwards x-user-id when the caller does have a valid session,
// purely for audit trail purposes.
async function createIntent(req, res) {
  try {
    const { items } = req.body;
    const userId = req.headers['x-user-id'] || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items is required and must be a non-empty array' });
    }

    const { amountCents, currency, pricedItems, issues } = await priceItemsAuthoritatively(items);

    if (issues.length > 0) {
      return res.status(409).json({
        message: 'Some items could not be priced — refresh your cart and try again.',
        issues,
      });
    }

    if (amountCents < 50) {
      // Stripe's own minimum for USD-like currencies — fail clearly instead
      // of letting Stripe's API error surface as an opaque 500 downstream.
      return res.status(400).json({ message: 'Order total is below the minimum chargeable amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: userId || 'guest', itemCount: String(pricedItems.length) },
    });

    await Payment.create({
      paymentIntentId: paymentIntent.id,
      userId: userId || null,
      items: pricedItems,
      amount: amountCents,
      currency,
      status: 'created',
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
      currency,
    });
  } catch (err) {
    console.error('[createIntent]', err);
    res.status(500).json({ message: 'Could not initialize payment' });
  }
}

// ─── GET /internal/payments/:paymentIntentId/verify ──────────────────────────
// Called server-to-server by order-service (never exposed through the public
// gateway) right before it marks a card order as paid. Retrieves the
// PaymentIntent from Stripe directly rather than trusting our own cached
// Payment doc, since Stripe is the actual system of record for "did the
// charge succeed".
async function verifyIntent(req, res) {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const verified = paymentIntent.status === 'succeeded';

    res.json({
      verified,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error('[verifyIntent]', err);
    res.status(404).json({ verified: false, message: 'Payment intent not found' });
  }
}

// ─── POST /payments/webhook ───────────────────────────────────────────────────
// Stripe calls this directly. Requires the raw request body (see index.js —
// this route is mounted with express.raw(), BEFORE the global express.json()
// middleware, exactly as Stripe's docs require for signature verification).
async function handleWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: intent.id },
        { status: 'succeeded' },
        { new: true }
      );
      if (payment) publisher.paymentConfirmed(payment);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: intent.id },
        { status: 'failed' },
        { new: true }
      );
      if (payment) publisher.paymentFailed(payment);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[webhook] handler error:', err);
    // Still 200 — Stripe retries on non-2xx, and retrying a broken handler
    // just repeats the same failure. Log it and rely on Stripe's dashboard
    // for reconciliation if this ever happens.
    res.json({ received: true, warning: 'processed with errors, see server logs' });
  }
}

// ─── POST /internal/payments/:paymentIntentId/refund ──────────────────────────
// Called server-to-server by order-service in exactly one scenario: a card
// payment succeeded, but the stock-reservation saga rejected the order
// afterward (a genuine race — stock can run out between "payment confirmed"
// and "order-service's saga reserves it"). Rather than leave the customer
// charged for something they can't get, order-service triggers this refund
// automatically as part of handling order.stock_rejected.
async function refundIntent(req, res) {
  try {
    const { paymentIntentId } = req.params;
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

    await Payment.findOneAndUpdate({ paymentIntentId }, { status: 'canceled' });

    res.json({ refunded: true, refundId: refund.id, status: refund.status });
  } catch (err) {
    console.error('[refundIntent]', err);
    res.status(500).json({ refunded: false, message: err.message });
  }
}

module.exports = { createIntent, verifyIntent, handleWebhook, refundIntent };
