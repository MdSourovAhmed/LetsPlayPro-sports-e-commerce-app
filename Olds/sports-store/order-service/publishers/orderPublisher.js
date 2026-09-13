const { publishEvent } = require("../rabbitmq/connection");
const EVENTS = require("../rabbitmq/events");
const { v4: uuidv4 } = require("uuid");

exports.publishOrderCreated = (order, userEmail) => {
  return publishEvent(EVENTS.ORDER_CREATED, {
    eventId: uuidv4(),
    orderId: order._id.toString(),
    userId: order.userId.toString(),
    userEmail,
    items: order.items,
    totalAmount: order.totalAmount,
    deliveryInfo: order.deliveryInfo,
    paymentMethod: order.paymentMethod,
    status: order.status,
  });
};

exports.publishOrderStatusUpdated = (order, userEmail) => {
  return publishEvent(EVENTS.ORDER_STATUS_UPDATED, {
    eventId: uuidv4(),
    orderId: order._id.toString(),
    userId: order.userId.toString(),
    userEmail,
    status: order.status,
  });
};

exports.publishOrderCancelled = (order, userEmail) => {
  return publishEvent(EVENTS.ORDER_CANCELLED, {
    eventId: uuidv4(),
    orderId: order._id.toString(),
    userId: order.userId.toString(),
    userEmail,
    items: order.items,
    status: "cancelled",
  });
};