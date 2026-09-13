const mongoose = require("mongoose");

// EventLog lives in the logger-service DB — we connect to the same MongoDB
// instance and reference the collection directly
const EventLog =
  mongoose.models.EventLog ||
  mongoose.model(
    "EventLog",
    new mongoose.Schema(
      {
        eventType: String,
        domain: String,
        actorRole: String,
        orderId: String,
        productId: String,
        productName: String,
        stockChange: Number,
        orderStatus: String,
        totalAmount: Number,
        payload: mongoose.Schema.Types.Mixed,
      },
      { timestamps: true, collection: "eventlogs" }
    )
  );

function getDateWindow(interval) {
  const to = new Date();
  const from = new Date();

  if (interval === "daily") {
    from.setDate(from.getDate() - 1);
  } else if (interval === "weekly") {
    from.setDate(from.getDate() - 7);
  } else {
    // monthly
    from.setMonth(from.getMonth() - 1);
  }

  return { from, to };
}

async function buildReport(interval) {
  const { from, to } = getDateWindow(interval);

  const logs = await EventLog.find({
    createdAt: { $gte: from, $lte: to },
  }).lean();

  const summary = {
    totalOrders: 0,
    totalRevenue: 0,
    cancelledOrders: 0,
    newProducts: 0,
    stockUpdates: 0,
    lowStockAlerts: 0,
    topProducts: [],
  };

  const productSales = {};

  for (const log of logs) {
    switch (log.eventType) {
      case "order.created":
        summary.totalOrders++;
        summary.totalRevenue += log.totalAmount || 0;
        if (log.payload?.items) {
          for (const item of log.payload.items) {
            if (!productSales[item.productId]) {
              productSales[item.productId] = { name: item.name, totalSold: 0 };
            }
            productSales[item.productId].totalSold += item.quantity;
          }
        }
        break;

      case "order.cancelled":
        summary.cancelledOrders++;
        break;

      case "inventory.product.added":
        summary.newProducts++;
        break;

      case "inventory.stock.updated":
        summary.stockUpdates++;
        break;

      case "inventory.stock.low":
        summary.lowStockAlerts++;
        break;
    }
  }

  // Top 5 products by units sold
  summary.topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  return { from, to, summary, rawEventCount: logs.length, interval };
}

module.exports = { buildReport, getDateWindow };