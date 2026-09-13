const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
      },
    ],
    deliveryInfo: {
      firstName: String,
      lastName: String,
      email: String,
      street: String,
      city: String,
      zip: String,
      country: String,
      phone: String,
    },
    paymentMethod: { type: String, enum: ["bkash", "nagad", "cod"], default: "cod" },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
