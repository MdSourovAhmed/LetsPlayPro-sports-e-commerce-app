const { consumeEvents, publishEvent } = require("../rabbitmq/connection");
const EVENTS = require("../rabbitmq/events");
const StockLedger = require("../models/StockLedger");
const { v4: uuidv4 } = require("uuid");

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD) || 5;

async function handleOrderCreated(payload) {
  console.log("Inventory: processing order.created for order", payload.orderId);

  for (const item of payload.items) {
    const ledger = await StockLedger.findOne({ productId: item.productId });

    if (!ledger) {
      console.warn(`Inventory: no ledger entry for product ${item.productId}`);
      continue;
    }

    if (ledger.currentStock < item.quantity) {
      console.warn(`Inventory: insufficient stock for ${item.name}`);
      await publishEvent(EVENTS.ORDER_STATUS_UPDATED, {
        eventId: uuidv4(),
        orderId: payload.orderId,
        userId: payload.userId,
        userEmail: payload.userEmail,
        status: "cancelled",
        reason: `Insufficient stock for ${item.name}`,
      });
      return;
    }

    ledger.currentStock -= item.quantity;
    ledger.lastUpdated = new Date();
    await ledger.save();

    if (ledger.currentStock <= LOW_STOCK_THRESHOLD) {
      await publishEvent(EVENTS.INVENTORY_STOCK_LOW, {
        eventId: uuidv4(),
        productId: item.productId,
        name: item.name,
        currentStock: ledger.currentStock,
      });
    }
  }

  // All items cleared — move to processing
  await publishEvent(EVENTS.ORDER_STATUS_UPDATED, {
    eventId: uuidv4(),
    orderId: payload.orderId,
    userId: payload.userId,
    userEmail: payload.userEmail,
    status: "processing",
  });

  console.log("Inventory: stock deducted, order moving to processing");
}

async function handleOrderCancelled(payload) {
  console.log("Inventory: restoring stock for cancelled order", payload.orderId);

  for (const item of payload.items) {
    await StockLedger.findOneAndUpdate(
      { productId: item.productId },
      {
        $inc: { currentStock: item.quantity },
        $set: { lastUpdated: new Date() },
      }
    );
  }
}

async function handleProductAdded(payload) {
  await StockLedger.findOneAndUpdate(
    { productId: payload.productId },
    {
      productId: payload.productId,
      name: payload.name,
      currentStock: payload.stock,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
  console.log(`Inventory: ledger created for new product "${payload.name}"`);
}

async function handleStockUpdated(payload) {
  await StockLedger.findOneAndUpdate(
    { productId: payload.productId },
    {
      currentStock: payload.newStock,
      lastUpdated: new Date(),
    }
  );
  console.log(`Inventory: ledger updated for "${payload.name}" → stock ${payload.newStock}`);
}

async function startConsuming() {
  await consumeEvents(
    "inventory.order.queue",
    [EVENTS.ORDER_CREATED, EVENTS.ORDER_CANCELLED],
    async (payload, routingKey) => {
      if (routingKey === EVENTS.ORDER_CREATED) await handleOrderCreated(payload);
      if (routingKey === EVENTS.ORDER_CANCELLED) await handleOrderCancelled(payload);
    }
  );

  await consumeEvents(
    "inventory.product.queue",
    [EVENTS.INVENTORY_PRODUCT_ADDED, EVENTS.INVENTORY_STOCK_UPDATED],
    async (payload, routingKey) => {
      if (routingKey === EVENTS.INVENTORY_PRODUCT_ADDED) await handleProductAdded(payload);
      if (routingKey === EVENTS.INVENTORY_STOCK_UPDATED) await handleStockUpdated(payload);
    }
  );
}

module.exports = { startConsuming };