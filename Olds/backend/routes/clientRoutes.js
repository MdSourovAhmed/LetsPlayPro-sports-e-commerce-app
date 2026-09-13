const express = require("express");
const {
  relatedProducts,
  getProductById,
  getFilteredProducts,
  getLatestProducts,
  getBestSellers,
  searchProducts,
} = require("../controllers/clientController");

const router = express.Router();

// General filtered products (for Collection)
router.get("/products/related", relatedProducts);
router.get("/products", getFilteredProducts);
router.get("/product/:id", getProductById);

// Latest collections
router.get("/latest", getLatestProducts);

// Best sellers
router.get("/bestsellers", getBestSellers);

// NEW: Search products (combines text search with filters)
router.get("/search", searchProducts);

module.exports = router;
