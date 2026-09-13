const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true, sparse: true },
    eventType: { type: String, required: true },
    domain: {
      type: String,
      enum: ["order", "inventory"],
      required: true,
    },
    actorId: { type: String },
    actorRole: { type: String, enum: ["customer", "admin", "system"], default: "system" },
    // Denormalized fields for fast report queries (no joins needed)
    orderId: { type: String },
    productId: { type: String },
    productName: { type: String },
    stockChange: { type: Number },
    orderStatus: { type: String },
    totalAmount: { type: Number },
    // Full payload snapshot
    payload: { type: mongoose.Schema.Types.Mixed },
    // Pre-computed time buckets for interval-based report queries
    year: { type: Number },
    month: { type: Number },   // 1–12
    week: { type: Number },    // ISO week number
    day: { type: String },     // "YYYY-MM-DD"
  },
  { timestamps: true }
);

// Indexes for report queries
eventLogSchema.index({ eventType: 1, createdAt: -1 });
eventLogSchema.index({ domain: 1, year: 1, month: 1 });
eventLogSchema.index({ domain: 1, week: 1 });
eventLogSchema.index({ productId: 1, createdAt: -1 });
eventLogSchema.index({ orderId: 1 });

module.exports = mongoose.model("EventLog", eventLogSchema);