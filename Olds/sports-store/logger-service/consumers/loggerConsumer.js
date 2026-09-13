const { consumeEvents } = require("../rabbitmq/connection");
const EVENTS = require("../rabbitmq/events");
const EventLog = require('../models/EventLog');

// Pre-compute time bucket fields from a date
function timeBuckets(date = new Date()) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    week,
    day: d.toISOString().slice(0, 10),
  };
}

// Map a routing key to its domain
function getDomain(routingKey) {
  if (routingKey.startsWith("order.")) return "order";
  if (routingKey.startsWith("inventory.")) return "inventory";
  return "system";
}

// Map routing key + payload to a flat, queryable log shape
function buildLogEntry(payload, routingKey) {
  const buckets = timeBuckets(payload.timestamp || new Date());
  const domain = getDomain(routingKey);
  const base = {
    eventId: payload.eventId,
    eventType: routingKey,
    domain,
    payload,
    ...buckets,
  };

  switch (routingKey) {
    case EVENTS.ORDER_CREATED:
      return {
        ...base,
        actorId: payload.userId,
        actorRole: "customer",
        orderId: payload.orderId,
        orderStatus: payload.status,
        totalAmount: payload.totalAmount,
      };

    case EVENTS.ORDER_STATUS_UPDATED:
      return {
        ...base,
        actorId: payload.userId,
        actorRole: "customer",
        orderId: payload.orderId,
        orderStatus: payload.status,
      };

    case EVENTS.ORDER_CANCELLED:
      return {
        ...base,
        actorId: payload.userId,
        actorRole: "customer",
        orderId: payload.orderId,
        orderStatus: "cancelled",
        totalAmount: payload.totalAmount,
      };

    case EVENTS.INVENTORY_PRODUCT_ADDED:
      return {
        ...base,
        actorId: payload.adminId,
        actorRole: "admin",
        productId: payload.productId,
        productName: payload.name,
        stockChange: payload.stock,
      };

    case EVENTS.INVENTORY_STOCK_UPDATED:
      return {
        ...base,
        actorId: payload.adminId,
        actorRole: "admin",
        productId: payload.productId,
        productName: payload.name,
        stockChange: payload.change,
      };

    case EVENTS.INVENTORY_STOCK_LOW:
      return {
        ...base,
        actorRole: "system",
        productId: payload.productId,
        productName: payload.name,
        stockChange: 0,
      };

    default:
      return base;
  }
}

async function handleEvent(payload, routingKey, logger) {
  try {
    const entry = buildLogEntry(payload, routingKey);

    // Upsert by eventId to guarantee idempotency
    if (entry.eventId) {
      await EventLog.findOneAndUpdate(
        { eventId: entry.eventId },
        { $setOnInsert: entry },
        { upsert: true, new: true }
      );
    } else {
      await EventLog.create(entry);
    }

    logger.info(`Logged [${routingKey}]`, {
      eventType: routingKey,
      domain: entry.domain,
      orderId: entry.orderId,
      productId: entry.productId,
    });
  } catch (err) {
    // Ignore duplicate key errors (idempotent re-delivery)
    if (err.code === 11000) {
      logger.warn(`Duplicate event skipped: ${payload.eventId}`);
      return;
    }
    logger.error(`Failed to log event [${routingKey}]: ${err.message}`);
    throw err;
  }
}

async function startConsuming(logger) {
  // Single wildcard queue catches every event in both domains
  await consumeEvents(
    "logger.all.queue",
    [EVENTS.ALL_ORDER_EVENTS, EVENTS.ALL_INVENTORY_EVENTS],
    (payload, routingKey) => handleEvent(payload, routingKey, logger)
  );

  logger.info("Logger Service: consuming all order.# and inventory.# events");
}

module.exports = { startConsuming };