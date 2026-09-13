const mongoose = require("mongoose");

const reportSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    interval: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "monthly",
    },
    recipientEmail: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    lastRunAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportSettings", reportSettingsSchema);