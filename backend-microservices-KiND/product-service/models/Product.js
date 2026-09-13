const mongoose = require('mongoose');

// Dashboard spec's generic product lifecycle. "active" is the only
// customer-visible state for storefront queries (see clientController's
// stock>0 filters, which now also check status: 'active').
const PRODUCT_STATUSES = ['active', 'draft', 'out_of_stock', 'archived'];

const productSchema = new mongoose.Schema(
  {
    sku:         { type: String, index: true },
    name:        { type: String, required: true },
    description: { type: String },       // full description
    shortDescription: { type: String, default: '' },

    price:         { type: Number, required: true },
    discountPrice: { type: Number, default: null }, // null = no discount active

    stock: { type: Number, default: 0 },

    // Original sports-store taxonomy — kept as-is, the real storefront
    // queries by these. `category` is the dashboard spec's generic field;
    // for this store it mirrors `sport` so the admin UI has something to
    // bind to without forcing a second parallel taxonomy.
    sport: { type: String },
    type:  { type: String },
    category: { type: String }, // defaults to `sport` at save time, see pre-save hook below

    brand: { type: String, index: true },

    images: {
      type: [{ type: String }],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: 'A product can have at most 4 images',
      },
    },

    status: { type: String, enum: PRODUCT_STATUSES, default: 'active' },
    featured: { type: Boolean, default: false },
    bestSell: { type: Boolean, default: false }, // kept for backward compat with existing bestsellers route

    tags: { type: [String], default: [] },

    specifications: {
      size:     [{ type: String }],
      color:    { type: String },
      material: { type: String },
      weight:   { type: String },
      pack:     { type: String },
      capacity: { type: String },
    },

    // Dashboard's "product variants" (size, color, storage, etc.) — each
    // variant can carry its own price/stock delta and SKU suffix.
    variants: [
      {
        name:  { type: String, required: true },  // e.g. "Size", "Color"
        value: { type: String, required: true },   // e.g. "L", "Red"
        skuSuffix: { type: String, default: '' },
        priceModifier: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

productSchema.index(
  { name: 'text', description: 'text', brand: 'text', sport: 'text', type: 'text', sku: 'text' }
);

// Keep `category` in sync with `sport` unless explicitly set otherwise —
// lets the dashboard treat `category` as the canonical field without
// breaking the storefront's existing `sport`-based filtering.
productSchema.pre('save', function (next) {
  if (!this.category && this.sport) {
    this.category = this.sport;
  }
  next();
});

productSchema.statics.PRODUCT_STATUSES = PRODUCT_STATUSES;

module.exports = mongoose.model('Product', productSchema);
