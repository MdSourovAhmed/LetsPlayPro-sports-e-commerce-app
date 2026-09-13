// const Order = require("../models/Order");

// exports.placeOrder = async (req, res) => {
//   try {
//     const newOrder = new Order(req.body);
//     await newOrder.save();
//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "Order placed successfully!",
//         order: newOrder,
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error placing order" });
//   }
// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("userId")
//       .sort({ createdAt: -1 });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching orders" });
//   }
// };

// const Order = require("../models/Order");
// const Product = require("../models/Product");

// // ✅ Create new order
// exports.createOrder = async (req, res) => {
//   console.log("Creating New Order: ", req.body);
//   try {
//     const { userId, items, deliveryInfo, paymentMethod, totalAmount } =
//       req.body;

//     if (!userId || !items?.length || !totalAmount) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }

//     // Optional: verify products exist & reduce stock
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product)
//         return res
//           .status(404)
//           .json({ success: false, message: "Product not found" });
//       if (product.stock < item.quantity)
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: `Insufficient stock for ${product.name}`,
//           });

//       // Decrease stock
//       product.stock -= item.quantity;
//       await product.save();
//     }

//     const newOrder = new Order({
//       userId,
//       items,
//       deliveryInfo,
//       paymentMethod,
//       totalAmount,
//     });

//     await newOrder.save();
//     res.status(201).json({ success: true, order: newOrder });
//   } catch (err) {
//     console.error("❌ createOrder error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ✅ Get all orders (admin)
// exports.getAllOrders = async (req, res) => {
//   console.log("Getting all Orders....");
//   try {
//     const orders = await Order.find()
//       .populate("userId", "name email")
//       .populate("items.productId", "name price image")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, orders });
//   } catch (err) {
//     console.error("❌ getAllOrders error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Get user-specific orders
// exports.getUserOrders = async (req, res) => {
//   console.log("Getting all Orders for id: ", req.user._id);
//   try {
//     const userId = req.user._id;
//     const orders = await Order.find({ userId })
//       .populate("items.productId", "name price image")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, orders });
//   } catch (err) {
//     console.error("❌ getUserOrders error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// exports.updateOrderInfo = async (req, res) => {
//   console.log("updating Orders for id: ", req.params.orderId);
//   try {
//     const { orderId } = req.params;
//     // const { status } = req.body;

//     const order = await Order.findByIdAndUpdate({
//       deliveryInfo: req.body,
//       new: true,
//     });
//     if (!order)
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });

//     // order.status = status;
//     // await order.save();

//     res.status(200).json({ success: true, order });
//   } catch (err) {
//     console.error("❌ updateOrderStatus error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Update order status (admin)
// exports.updateOrderStatus = async (req, res) => {
//   console.log("updating Orders for id: ", req.params.orderId);
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order)
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });

//     order.status = status;
//     await order.save();

//     res.status(200).json({ success: true, order });
//   } catch (err) {
//     console.error("❌ updateOrderStatus error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Cancel order (user)
// exports.cancelOrder = async (req, res) => {
//   console.log("Canceling Orders for id: ", req.params.id);
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order)
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });
//     if (order.status !== "pending")
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Only pending orders can be cancelled",
//         });

//     order.status = "cancelled";
//     await order.save();

//     res.status(200).json({ success: true, order });
//   } catch (err) {
//     console.error("❌ cancelOrder error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };



const Order = require("../models/Order");
const Product = require("../models/Product");

// ✅ Create new order
exports.createOrder = async (req, res) => {
  console.log("🟢 Creating New Order:", req.body);
  try {
    const { userId, items, deliveryInfo, paymentMethod, totalAmount } = req.body;

    if (!userId || !Array.isArray(items) || !items.length || !totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 🔎 Verify each product and adjust stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Decrease stock
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Create and save the new order
    const newOrder = await Order.create({
      userId,
      items,
      deliveryInfo,
      paymentMethod,
      totalAmount,
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  console.log("🟢 Fetching all orders...");
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("❌ getAllOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get logged-in user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id; // ensure `req.user` is set by auth middleware
    console.log("🟢 Fetching orders for user:", userId);

    const orders = await Order.find({ userId })
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("❌ getUserOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update order delivery info (user)
exports.updateOrderInfo = async (req, res) => {
  console.log("updating OrderInfo for id: ", req.params.orderId);
  try {
    const { orderId } = req.params;
    const { deliveryInfo } = req.body;

    if (!deliveryInfo) {
      return res
        .status(400)
        .json({ success: false, message: "Delivery info required" });
    }

    // Find and update only delivery info
    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // ❌ Prevent editing after shipped
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order`,
      });
    }

    order.deliveryInfo = { ...order.deliveryInfo, ...deliveryInfo };
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ updateOrderInfo error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  console.log("updating Order status for id: ", req.params.orderId);
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Cancel order (user)
exports.cancelOrder = async (req, res) => {
  console.log("Cancelling Orders for id: ", req.params.orderId);
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    // 🧾 Optional: restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ cancelOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
