const mongoose = require("mongoose");

// Local stock mirror — source of truth is Product Service,
// but Inventory Service keeps its own ledger for fast reads
const stockLedgerSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true },
    currentStock: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockLedger", stockLedgerSchema);