const { connect, getChannel } = require('./connection');
const Product = require('../models/Product');
const { invalidateProduct } = require('../utils/cache');

function publishResult(routingKey, orderId, extra = {}) {
  const ch = getChannel();
  ch.publish(
    'app.events',
    routingKey,
    Buffer.from(JSON.stringify({ orderId, ...extra })),
    { persistent: true }
  );
  console.log(`[Product/Consumer] published ${routingKey} for order ${orderId}`);
}

// Atomically reserve stock for a single line item.
// Returns true if the decrement succeeded, false if there wasn't enough stock.
async function reserveStock(productId, quantity) {
  const result = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } }, // only matches if enough stock
    { $inc: { stock: -quantity } },
    { new: true }
  );
  if (result) await invalidateProduct(productId);
  return Boolean(result);
}

// Roll back any items that were already reserved before a later item failed.
async function releaseStock(productId, quantity) {
  await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
  await invalidateProduct(productId);
}

async function handleOrderPlaced(order) {
  const reserved = []; // track successfully reserved items for rollback

  for (const item of order.items) {
    const ok = await reserveStock(item.productId, item.quantity);

    if (!ok) {
      // Roll back everything reserved so far for this order
      for (const r of reserved) {
        await releaseStock(r.productId, r.quantity);
      }

      const product = await Product.findById(item.productId).select('name').lean();
      const reason  = product
        ? `Insufficient stock for ${product.name}`
        : `Product not found: ${item.productId}`;

      return publishResult('order.stock_rejected', order._id, { reason });
    }

    reserved.push(item);
  }

  publishResult('order.stock_confirmed', order._id);
}

async function handleOrderCancelled(order) {
  // Only restock items that were actually confirmed/reserved.
  // (If the order was rejected, stock was already rolled back in handleOrderPlaced.)
  if (order.stockStatus !== 'confirmed') {
    console.log(`[Product/Consumer] skip restock — order ${order._id} stock was never confirmed`);
    return;
  }

  for (const item of order.items) {
    await releaseStock(item.productId, item.quantity);
  }
  console.log(`[Product/Consumer] restocked ${order.items.length} item(s) for cancelled order ${order._id}`);
}

async function startConsumer() {
  const ch = await connect();
  if (!ch) {
    console.error('[Product/Consumer] channel unavailable, retrying in 5s');
    return setTimeout(startConsumer, 5000);
  }

  const { queue } = await ch.assertQueue('product.stock.queue', { durable: true });
  await ch.bindQueue(queue, 'app.events', 'order.placed');
  await ch.bindQueue(queue, 'app.events', 'order.cancelled');

  ch.prefetch(1);

  ch.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const order      = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;

      if (routingKey === 'order.placed')    await handleOrderPlaced(order);
      if (routingKey === 'order.cancelled') await handleOrderCancelled(order);

      ch.ack(msg);
    } catch (err) {
      console.error('[Product/Consumer] processing error:', err.message);
      ch.nack(msg, false, false);
    }
  });

  console.log('[Product/Consumer] listening on product.stock.queue');
}

module.exports = { startConsumer };
