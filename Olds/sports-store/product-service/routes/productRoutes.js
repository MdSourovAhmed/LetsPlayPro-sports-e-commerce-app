const express = require("express");
const router = express.Router();
const {
  addProduct,
  updateStock,
  updateProduct,
  getAllProducts,
  getProduct,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:productId", getProduct);
router.post("/", addProduct);
router.put("/:productId", updateProduct);
router.patch("/:productId/stock", updateStock);

module.exports = router;