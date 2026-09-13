const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  updateOrderInfo,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/user/:userId", getUserOrders);
router.put("/:orderId/status", updateOrderStatus);
router.put("/:orderId/delivery", updateOrderInfo);
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;