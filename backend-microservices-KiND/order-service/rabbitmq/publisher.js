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
    console.log(`[Order/Publisher] ${routingKey} — order ${payload._id}`);
  } catch (err) {
    console.error('[Order/Publisher] failed to publish:', err.message);
  }
}

module.exports = {
  // Saga kickoff — product-service listens and validates/reserves stock
  orderPlaced: (order) => publish('order.placed', order),

  // Customer-status-change notifications (post-confirmation only)
  orderStatusUpdated: (order) => publish('order.status_updated', order),

  // Cancellation after the order was already confirmed (e.g. user-initiated)
  orderCancelled: (order) => publish('order.cancelled', order),
};
