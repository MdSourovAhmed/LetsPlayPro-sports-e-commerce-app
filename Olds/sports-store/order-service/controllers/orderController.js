const Order = require("../models/Order");
const {
  publishOrderCreated,
  publishOrderStatusUpdated,
  publishOrderCancelled,
} = require("../publishers/orderPublisher");

// Create new order — stock check now handled by Inventory Service via event
exports.createOrder = async (req, res) => {
  try {
    const { userId, userEmail, items, deliveryInfo, paymentMethod, totalAmount } = req.body;

    if (!userId || !Array.isArray(items) || !items.length || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newOrder = await Order.create({
      userId,
      items,
      deliveryInfo,
      paymentMethod,
      totalAmount,
      status: "pending",
    });

    await publishOrderCreated(newOrder, userEmail);

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userEmail } = req.body;

    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    await publishOrderStatusUpdated(order, userEmail);

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update delivery info (user)
exports.updateOrderInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryInfo } = req.body;

    if (!deliveryInfo) {
      return res.status(400).json({ success: false, message: "Delivery info required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order`,
      });
    }

    order.deliveryInfo = { ...order.deliveryInfo.toObject(), ...deliveryInfo };
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel order (user)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userEmail } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    await publishOrderCancelled(order, userEmail);

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};