module.exports = {
  // Order domain
  ORDER_CREATED: "order.created",
  ORDER_STATUS_UPDATED: "order.status.updated",
  ORDER_CANCELLED: "order.cancelled",

  // Inventory domain
  INVENTORY_PRODUCT_ADDED: "inventory.product.added",
  INVENTORY_STOCK_UPDATED: "inventory.stock.updated",
  INVENTORY_STOCK_LOW: "inventory.stock.low",

  // Wildcard patterns (for consumers)
  ALL_ORDER_EVENTS: "order.#",
  ALL_INVENTORY_EVENTS: "inventory.#",
};