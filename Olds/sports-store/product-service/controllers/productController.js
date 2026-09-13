const Product = require("../models/Product");
const {
  publishProductAdded,
  publishStockUpdated,
  publishStockLow,
} = require("../publishers/productPublisher");

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD) || 5;

// Add new product (admin)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    const adminId = req.headers["x-admin-id"];

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images,
      createdBy: adminId,
    });

    await publishProductAdded(product, adminId);

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      await publishStockLow(product);
    }

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("addProduct error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Update stock (admin)
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;
    const adminId = req.headers["x-admin-id"];

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: "Valid stock value required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const previousStock = product.stock;
    product.stock = stock;
    await product.save();

    await publishStockUpdated(product, previousStock, adminId);

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      await publishStockLow(product);
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("updateStock error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update product details (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const adminId = req.headers["x-admin-id"];
    const updates = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const previousStock = product.stock;
    Object.assign(product, updates);
    await product.save();

    // If stock was part of the update, publish stock event
    if (updates.stock !== undefined && updates.stock !== previousStock) {
      await publishStockUpdated(product, previousStock, adminId);
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};