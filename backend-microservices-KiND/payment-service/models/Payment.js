const mongoose = require('mongoose');

const PAYMENT_STATUSES = ['created', 'succeeded', 'failed', 'canceled'];

const paymentSchema = new mongoose.Schema(
  {
    paymentIntentId: { type: String, required: true, unique: true, index: true },

    // Optional — set only when the request came from a logged-in user (the
    // gateway's optional-auth middleware forwards x-user-id when a valid
    // Bearer token is present; guest checkout leaves this null).
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Snapshot of what was priced, for audit/dispute purposes — this is NOT
    // what's trusted for the charge itself, which is Stripe's own amount.
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        unitPrice: { type: Number, required: true }, // server-computed, not client-supplied
      },
    ],

    amount: { type: Number, required: true }, // smallest currency unit (cents)
    currency: { type: String, default: 'usd' },

    status: { type: String, enum: PAYMENT_STATUSES, default: 'created' },
  },
  { timestamps: true }
);

paymentSchema.statics.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = mongoose.model('Payment', paymentSchema);
