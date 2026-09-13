const mongoose = require('mongoose');

// Customer-facing order lifecycle, expanded to match the admin dashboard's
// spec-exact 7-status model. "confirmed" sits between pending and
// processing (order acknowledged, stock reserved, not yet being packed).
// "returned" is a terminal state distinct from "cancelled" (cancelled =
// never fulfilled; returned = fulfilled, then sent back by the customer).
const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
];

const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // cross-service — no ref
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity:  { type: Number, required: true },
        size:      { type: String },
        priceAtPurchase: { type: Number },
      },
    ],
    deliveryInfo: {
      firstName: String,
      lastName:  String,
      email:     String,
      street:    String,
      city:      String,
      zip:       String,
      country:   String,
      phone:     String,
    },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'cod', 'card'], default: 'cod' },
    // Only set for paymentMethod: 'card' — links this order back to the
    // Stripe PaymentIntent that paid for it, via payment-service's Payment
    // audit doc. Used both for the synchronous verify-before-create check
    // in createOrder and for the async payment.confirmed/refund reconciliation
    // paths in rabbitmq/consumer.js.
    paymentIntentId: { type: String, default: null, index: true },
    totalAmount:   { type: Number, required: true },

    status: {
      type:    String,
      enum:    ORDER_STATUSES,
      default: 'pending',
    },

    // Dashboard's "mark payment as paid/unpaid/refunded" admin action.
    // Independent of order status — an order can be "delivered" but still
    // "unpaid" (e.g. cash-on-delivery awaiting confirmation).
    paymentStatus: {
      type:    String,
      enum:    PAYMENT_STATUSES,
      default: 'unpaid',
    },

    // Why an order was cancelled, when an admin or user cancels it directly
    // (as opposed to rejectionReason below, which is the saga's own
    // automatic rejection for insufficient stock).
    cancellationReason: { type: String, default: '' },

    // Internal admin notes — never shown to the customer.
    adminNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // admin user id
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Saga state — tracks the stock-confirmation handshake with product-service.
    // "pending"   -> order.placed published, awaiting product-service response
    // "confirmed" -> stock was reserved successfully
    // "rejected"  -> stock unavailable, order auto-cancelled
    // NOTE: this is an internal/technical field, unrelated to the
    // customer-facing `status` field above, even though both can hold the
    // string "confirmed" — they mean different things.
    stockStatus: {
      type:    String,
      enum:    ['awaiting_confirmation', 'confirmed', 'rejected'],
      default: 'awaiting_confirmation',
    },

    // Why the saga rejected this order, if it did (e.g. "Insufficient stock for Tennis Racket")
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;
orderSchema.statics.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
