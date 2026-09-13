const express = require('express');
const { createIntent, verifyIntent, refundIntent } = require('../controllers/paymentController');

const router = express.Router();

// Public — guest checkout must be able to pay by card without logging in.
router.post('/payments/create-intent', createIntent);

// NOTE: POST /payments/webhook is intentionally NOT here — it's registered
// directly in index.js with express.raw() so Stripe's signature check gets
// the untouched request body. Registering it again here (with the JSON
// parser already applied) would just be dead code shadowed by the first
// match, so it's left out entirely to avoid the confusion.

// Internal only — never routed through the public gateway. Called directly
// by order-service over the Docker network.
router.get('/internal/payments/:paymentIntentId/verify', verifyIntent);
router.post('/internal/payments/:paymentIntentId/refund', refundIntent);

module.exports = router;
