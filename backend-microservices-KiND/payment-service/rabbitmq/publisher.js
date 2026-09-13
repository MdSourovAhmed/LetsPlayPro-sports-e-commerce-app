const { getChannel } = require('./connection');

function publish(routingKey, payload) {
  try {
    const ch = getChannel();
    ch.publish(
      'app.events',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
    console.log(`[Payment/Publisher] ${routingKey} — ${payload.paymentIntentId}`);
  } catch (err) {
    console.error('[Payment/Publisher] failed to publish:', err.message);
  }
}

module.exports = {
  // order-service listens for this to auto-mark an order as paid if it
  // arrives after the order was already placed. If the order isn't found
  // yet (rare race — webhook beat the place-order call), order-service just
  // logs and drops it; the synchronous verify-on-place-order path (see
  // order-service's createOrder) is the primary mechanism, this is a
  // durability backstop, not the only path.
  paymentConfirmed: (payment) =>
    publish('payment.confirmed', {
      paymentIntentId: payment.paymentIntentId,
      amount: payment.amount,
      currency: payment.currency,
      userId: payment.userId,
    }),

  paymentFailed: (payment) =>
    publish('payment.failed', {
      paymentIntentId: payment.paymentIntentId,
      userId: payment.userId,
    }),
};
