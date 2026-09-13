const express = require("express");
const router = express.Router();
const { placeOrder, getAllOrders } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/auth");

router.post("/place", authMiddleware, placeOrder);
router.get("/list", authMiddleware, getAllOrders);

module.exports = router;
