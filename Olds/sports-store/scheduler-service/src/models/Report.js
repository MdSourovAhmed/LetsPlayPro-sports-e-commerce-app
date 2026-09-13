const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    interval: { type: String, enum: ["daily", "weekly", "monthly"] },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    summary: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      newProducts: { type: Number, default: 0 },
      stockUpdates: { type: Number, default: 0 },
      lowStockAlerts: { type: Number, default: 0 },
      topProducts: [
        {
          productId: String,
          name: String,
          totalSold: Number,
        },
      ],
    },
    rawEventCount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);