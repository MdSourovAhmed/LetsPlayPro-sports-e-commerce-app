const { consumeEvents } = require("../rabbitmq/connection");
const EVENTS = require("../rabbitmq/events");
const { sendMail } = require("../models/Mailer");
const {
  orderConfirmationTemplate,
  orderStatusTemplate,
  lowStockAlertTemplate,
} = require("../templates/emailTemplates");

// Simple in-memory dedup store (use Redis in production)
const processedEvents = new Set();

function isDuplicate(eventId) {
  if (!eventId) return false;
  if (processedEvents.has(eventId)) return true;
  processedEvents.add(eventId);
  // Keep set bounded
  if (processedEvents.size > 5000) {
    const first = processedEvents.values().next().value;
    processedEvents.delete(first);
  }
  return false;
}

async function handleOrderCreated(payload) {
  if (isDuplicate(payload.eventId)) return;
  if (!payload.userEmail) return;

  await sendMail({
    to: payload.userEmail,
    subject: `Order Confirmed — #${payload.orderId}`,
    html: orderConfirmationTemplate(payload),
  });
}

async function handleOrderStatusUpdated(payload) {
  if (isDuplicate(payload.eventId)) return;
  if (!payload.userEmail) return;

  await sendMail({
    to: payload.userEmail,
    subject: `Your order is now: ${payload.status} — #${payload.orderId}`,
    html: orderStatusTemplate(payload),
  });
}

async function handleStockLow(payload) {
  if (isDuplicate(payload.eventId)) return;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendMail({
    to: adminEmail,
    subject: `Low Stock Alert: ${payload.name}`,
    html: lowStockAlertTemplate(payload),
  });
}

async function startConsuming() {
  await consumeEvents(
    "notification.order.queue",
    [EVENTS.ORDER_CREATED, EVENTS.ORDER_STATUS_UPDATED, EVENTS.ORDER_CANCELLED],
    async (payload, routingKey) => {
      if (routingKey === EVENTS.ORDER_CREATED) await handleOrderCreated(payload);
      if (routingKey === EVENTS.ORDER_STATUS_UPDATED) await handleOrderStatusUpdated(payload);
      if (routingKey === EVENTS.ORDER_CANCELLED) await handleOrderStatusUpdated(payload);
    }
  );

  await consumeEvents(
    "notification.inventory.queue",
    [EVENTS.INVENTORY_STOCK_LOW],
    async (payload) => {
      await handleStockLow(payload);
    }
  );
}

module.exports = { startConsuming };