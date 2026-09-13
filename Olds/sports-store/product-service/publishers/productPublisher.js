const { publishEvent } = require("../rabbitmq/connection");
const EVENTS = require("../rabbitmq/events");
const { v4: uuidv4 } = require("uuid");

exports.publishProductAdded = (product, adminId) => {
  return publishEvent(EVENTS.INVENTORY_PRODUCT_ADDED, {
    eventId: uuidv4(),
    productId: product._id.toString(),
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    adminId: adminId?.toString(),
  });
};

exports.publishStockUpdated = (product, previousStock, adminId) => {
  const diff = product.stock - previousStock;
  return publishEvent(EVENTS.INVENTORY_STOCK_UPDATED, {
    eventId: uuidv4(),
    productId: product._id.toString(),
    name: product.name,
    previousStock,
    newStock: product.stock,
    change: diff,
    changeDirection: diff >= 0 ? "increase" : "decrease",
    adminId: adminId?.toString(),
  });
};

exports.publishStockLow = (product) => {
  return publishEvent(EVENTS.INVENTORY_STOCK_LOW, {
    eventId: uuidv4(),
    productId: product._id.toString(),
    name: product.name,
    currentStock: product.stock,
  });
};