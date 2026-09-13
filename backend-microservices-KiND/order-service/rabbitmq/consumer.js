const { connect }  = require('./connection');
const Order        = require('../models/Order');
const publisher     = require('./publisher');
const paymentClient = require('../clients/paymentClient');

async function startConsumer() {
  const ch = await connect();
  if (!ch) {
    console.error('[Order/Consumer] channel unavailable, retrying in 5s');
    return setTimeout(startConsumer, 5000);
  }

  const { queue } = await ch.assertQueue('order.saga.queue', { durable: true });
  await ch.bindQueue(queue, 'app.events', 'order.stock_confirmed');
  await ch.bindQueue(queue, 'app.events', 'order.stock_rejected');
  // Durability backstop for card payments: the synchronous verify call in
  // createOrder is the primary path for marking paymentStatus 'paid', but if
  // the customer's browser dies between Stripe confirming and place-order
  // actually reaching us, this webhook-driven event is the only signal we'd
  // ever get. It's a no-op in the (normal) case where the order already
  // shows paid.
  await ch.bindQueue(queue, 'app.events', 'payment.confirmed');

  ch.prefetch(1);

  ch.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const payload     = JSON.parse(msg.content.toString());
      const routingKey  = msg.fields.routingKey;

      if (routingKey === 'payment.confirmed') {
        const order = await Order.findOne({ paymentIntentId: payload.paymentIntentId });
        if (!order) {
          // Genuinely rare: webhook arrived before place-order did (or the
          // customer abandoned checkout after paying but before submitting
          // the order). Nothing to reconcile yet — log for manual follow-up
          // rather than silently dropping real money on the floor.
          console.warn(`[Order/Consumer] payment.confirmed for unknown paymentIntent ${payload.paymentIntentId} — no matching order yet`);
        } else if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          await order.save();
          console.log(`[Order/Consumer] order ${order._id} reconciled to paid via webhook backstop`);
        }
        return ch.ack(msg);
      }

      const order = await Order.findById(payload.orderId);

      if (!order) {
        console.warn(`[Order/Consumer] order ${payload.orderId} not found — dropping ${routingKey}`);
        return ch.ack(msg);
      }

      if (routingKey === 'order.stock_confirmed') {
        order.stockStatus = 'confirmed';
        order.status       = 'processing';
        await order.save();

        // Now safe to notify the customer — stock is actually reserved
        publisher.orderStatusUpdated(order.toObject());
        console.log(`[Order/Consumer] order ${order._id} confirmed`);
      }

      if (routingKey === 'order.stock_rejected') {
        order.stockStatus      = 'rejected';
        order.status            = 'cancelled';
        order.rejectionReason   = payload.reason || 'Stock unavailable';

        // A card order that already succeeded payment but then lost the
        // stock race needs its money back — this is the one place in the
        // whole saga where a customer could otherwise be charged for
        // nothing.
        if (order.paymentMethod === 'card' && order.paymentStatus === 'paid' && order.paymentIntentId) {
          const refund = await paymentClient.refundPaymentIntent(order.paymentIntentId);
          if (refund.refunded) {
            order.paymentStatus = 'refunded';
            order.rejectionReason += ' — payment automatically refunded.';
          } else {
            // Refund call failed — don't silently swallow this. Flag it
            // loudly so a human catches it; the order itself still gets
            // cancelled either way so the customer isn't left thinking
            // it's being fulfilled.
            order.rejectionReason += ' — automatic refund FAILED, needs manual review.';
            console.error(`[Order/Consumer] REFUND FAILED for order ${order._id}, paymentIntent ${order.paymentIntentId} — manual refund required`);
          }
        }

        await order.save();

        publisher.orderCancelled(order.toObject());
        console.log(`[Order/Consumer] order ${order._id} rejected: ${order.rejectionReason}`);
      }

      ch.ack(msg);
    } catch (err) {
      console.error('[Order/Consumer] processing error:', err.message);
      ch.nack(msg, false, false);
    }
  });

  console.log('[Order/Consumer] listening on order.saga.queue');
}

module.exports = { startConsumer };
