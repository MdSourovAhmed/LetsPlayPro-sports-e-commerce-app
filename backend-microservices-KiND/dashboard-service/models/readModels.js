const mongoose = require('mongoose');
const { authConn, productConn, orderConn } = require('../config/db');

// These are intentionally minimal — only the fields this service actually
// reads for aggregation. No password field, no business-logic methods, no
// write capability implied anywhere. If a field you need isn't here, add
// it deliberately rather than copy the full source schema wholesale.

const UserSummary = authConn.model(
  'User',
  new mongoose.Schema(
    { name: String, email: String, role: String, createdAt: Date },
    { collection: 'users' }
  )
);

const ProductSummary = productConn.model(
  'Product',
  new mongoose.Schema(
    { name: String, sku: String, stock: Number, category: String, brand: String, createdAt: Date },
    { collection: 'products' }
  )
);

const OrderSummary = orderConn.model(
  'Order',
  new mongoose.Schema(
    {
      status: String,
      paymentMethod: String,
      paymentStatus: String,
      totalAmount: Number,
      items: [
        {
          productId: mongoose.Schema.Types.ObjectId,
          quantity: Number,
          priceAtPurchase: Number,
        },
      ],
      deliveryInfo: { firstName: String, lastName: String },
      createdAt: Date,
    },
    { collection: 'orders' }
  )
);

module.exports = { UserSummary, ProductSummary, OrderSummary };
