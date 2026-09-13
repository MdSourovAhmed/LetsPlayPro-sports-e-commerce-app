const express = require("express");
const router = express.Router();
const {
  // relatedProducts,
  createProduct,
  listProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

const { authMiddleware, adminOnly } = require("../middleware/auth");

router.post("/product/create", createProduct);
// router.post("/create", authMiddleware, adminOnly, createProduct);
router.get("/product/list", listProducts);
// router.get("/product/related", relatedProducts);
router.delete("/product/:id", deleteProduct);
// router.delete("/product/:id", authMiddleware, adminOnly, deleteProduct);
router.put("/product/:id", updateProduct);
// router.put("/product/:id", authMiddleware, adminOnly, updateProduct);

module.exports = router;
