const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: { type: String },
    // id: { type: Number, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sport: { type: String },
    type: { type: String },
    brand: { type: String },
    images: [{ type: String }],
    bestSell: { type: Boolean, default: false },
    specifications: {
      size: [{ type: String }],
      color: { type: String },
      material: { type: String },
      weight: { type: String },
      pack: { type: String },
      capacity: { type: String },
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', sport: 'text', type: 'text' });

module.exports = mongoose.model("Product", productSchema);

// const mongoose = require("mongoose");
// const autoIncrement = require('mongoose-auto-increment');

// // Initialize auto-increment
// autoIncrement.initialize(mongoose.connection);

// const productSchema = new mongoose.Schema(
//   {
//     sku: { type: String, required: true, unique: true },
//     id: { type: Number, unique: true }, // Auto-increment will handle this
//     name: { type: String, required: true },
//     description: { type: String },
//     price: { type: Number, required: true },
//     stock: { type: Number, default: 0 },
//     sport: { type: String },
//     type: { type: String },
//     brand: { type: String },
//     images: [{ type: String }],
//     bestSell: { type: Boolean, default: false },
//     specifications: {
//       size: [{ type: String }],
//       color: { type: String },
//       material: { type: String },
//       weight: { type: String },
//       pack: { type: String },
//       capacity: { type: String },
//     },
//   },
//   { timestamps: true }
// );

// // Apply auto-increment plugin
// productSchema.plugin(autoIncrement.plugin, {
//   model: 'Product',
//   field: 'id',
//   startAt: 1,
//   incrementBy: 1
// });

// module.exports = mongoose.model("Product", productSchema);
