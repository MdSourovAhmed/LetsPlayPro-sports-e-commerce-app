const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

const client = axios.create({ baseURL: PAYMENT_SERVICE_URL, timeout: 8000 });

/**
 * Confirms a Stripe PaymentIntent actually succeeded, by asking
 * payment-service to check with Stripe directly — never trust the client's
 * "payment succeeded" callback alone, since the browser can disappear
 * mid-flow after a real charge already went through.
 * @param {string} paymentIntentId
 * @returns {Promise<{verified: boolean, amount?: number, currency?: string}>}
 */
async function verifyPaymentIntent(paymentIntentId) {
  try {
    const { data } = await client.get(`/api/internal/payments/${paymentIntentId}/verify`);
    return data;
  } catch (err) {
    console.error('[paymentClient] verify failed:', err.message);
    return { verified: false };
  }
}

/**
 * Refunds a succeeded charge — used when the stock-reservation saga rejects
 * an order that was already paid by card (a genuine race between payment
 * confirmation and stock reservation).
 * @param {string} paymentIntentId
 */
async function refundPaymentIntent(paymentIntentId) {
  try {
    const { data } = await client.post(`/api/internal/payments/${paymentIntentId}/refund`);
    return data;
  } catch (err) {
    console.error('[paymentClient] refund failed:', err.message);
    return { refunded: false };
  }
}

module.exports = { verifyPaymentIntent, refundPaymentIntent };
