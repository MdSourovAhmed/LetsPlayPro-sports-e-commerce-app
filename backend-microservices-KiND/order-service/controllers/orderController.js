const Order     = require('../models/Order');
const publisher = require('../rabbitmq/publisher');
const paymentClient = require('../clients/paymentClient');
const { generateInvoicePdf } = require('../utils/invoice');

/**
 * Refunds a paid card order in place (mutates but does not save — caller is
 * expected to already be about to order.save()). No-ops for every other
 * payment method/status combination. Used by both user-initiated
 * cancellation and admin status changes to cancelled/returned — the
 * saga-rejection path in rabbitmq/consumer.js has its own copy of this
 * logic since it runs in the async consumer rather than a request handler.
 * @param {import('../models/Order')} order
 */
async function refundIfPaidCardOrder(order) {
  if (order.paymentMethod !== 'card' || order.paymentStatus !== 'paid' || !order.paymentIntentId) {
    return;
  }
  const refund = await paymentClient.refundPaymentIntent(order.paymentIntentId);
  if (refund.refunded) {
    order.paymentStatus = 'refunded';
  } else {
    console.error(`[refundIfPaidCardOrder] REFUND FAILED for order ${order._id}, paymentIntent ${order.paymentIntentId} — manual refund required`);
  }
}

// ─── POST /place-order ────────────────────────────────────────────────────────
// Saga step 1: create the order as "pending" and hand stock validation off to
// product-service via the order.placed event. We do NOT touch Product here —
// order-service has no access to product-service's database.
async function createOrder(req, res) {
  try {
    const { items, deliveryInfo, paymentMethod, paymentIntentId } = req.body;
    let { totalAmount } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let paymentStatus = 'unpaid';

    // Card payments went through payment-service's Stripe flow already —
    // confirm that actually succeeded before creating the order, and use
    // Stripe's own confirmed amount rather than the client-supplied
    // totalAmount (which for every other payment method here is still
    // trusted as-is — see README for that tradeoff and how to close it).
    if (paymentMethod === 'card') {
      if (!paymentIntentId) {
        return res.status(400).json({ success: false, message: 'paymentIntentId is required for card orders' });
      }

      const verification = await paymentClient.verifyPaymentIntent(paymentIntentId);
      if (!verification.verified) {
        return res.status(402).json({ success: false, message: 'Payment could not be verified' });
      }

      totalAmount = verification.amount / 100; // Stripe amounts are in cents
      paymentStatus = 'paid';
    }

    if (!totalAmount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      deliveryInfo,
      paymentMethod,
      paymentIntentId: paymentMethod === 'card' ? paymentIntentId : null,
      totalAmount,
      status: 'pending',
      paymentStatus,
      stockStatus: 'awaiting_confirmation',
    });

    // Kicks off the saga — product-service will validate/reserve stock and
    // publish order.stock_confirmed or order.stock_rejected back. If this
    // ends up rejected for a card order, the consumer refunds it — see
    // rabbitmq/consumer.js.
    publisher.orderPlaced(order.toObject());

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('[createOrder]', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

// ─── GET /admin/orders ─────────────────────────────────────────────────────────
// Dashboard's order list: search by id/customer name/email/phone, filter by
// status/payment-status/date-range/min-max total, paginate, sort.
async function getAllOrders(req, res) {
  console.log('[getAllOrders] fetching all orders with filters...');
  try {
    const {
      search, status, paymentStatus,
      dateFrom, dateTo, minTotal, maxTotal,
      page = 1, limit = 20,
      sort = 'newest',
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        // Inclusive of the whole "to" day, not just midnight
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (minTotal || maxTotal) {
      filter.totalAmount = {};
      if (minTotal) filter.totalAmount.$gte = Number(minTotal);
      if (maxTotal) filter.totalAmount.$lte = Number(maxTotal);
    }

    if (search) {
      const orClauses = [
        { 'deliveryInfo.firstName': { $regex: search, $options: 'i' } },
        { 'deliveryInfo.lastName': { $regex: search, $options: 'i' } },
        { 'deliveryInfo.email': { $regex: search, $options: 'i' } },
        { 'deliveryInfo.phone': { $regex: search, $options: 'i' } },
      ];
      // Order IDs are ObjectIds — only attempt the id match if the search
      // term actually looks like one, otherwise Mongoose throws a cast error.
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        orClauses.push({ _id: search });
      }
      filter.$or = orClauses;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      total_desc: { totalAmount: -1 },
      total_asc: { totalAmount: 1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).sort(sortOrder).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[getAllOrders]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── GET /admin/orders/:id (and GET /orders/my for self-service) ────────────────
async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    console.error('[getOrderById]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── GET /orders/:orderId (user, self-service) ────────────────────────────────
// Distinct from admin getOrderById above: this one is scoped to the
// requesting user's own orders, so a customer can't fetch someone else's
// order by guessing its id.
async function getMyOrderById(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    console.error('[getMyOrderById]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── GET /orders/my ────────────────────────────────────────────────────────────
async function getUserOrders(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments({ userId: req.user.id }),
    ]);

    res.status(200).json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[getUserOrders]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── PUT /update-order/:orderId ───────────────────────────────────────────────
// User edits delivery info — only while the order is still pending/processing.
async function updateOrderInfo(req, res) {
  console.log('[updateOrderInfo] updating order:', req.params.orderId);
  try {
    const { orderId } = req.params;
    const { deliveryInfo } = req.body;

    if (!deliveryInfo) {
      return res.status(400).json({ success: false, message: 'Delivery info required' });
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order`,
      });
    }

    order.deliveryInfo = { ...order.deliveryInfo, ...deliveryInfo };
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('[updateOrderInfo]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── PATCH /admin/orders/:id/status (and legacy /update-order-status/:orderId) ──
// Body: { status, reason? }. `reason` is required when status is
// 'cancelled' or 'returned' — surfaced in the dashboard's cancellation modal.
async function updateOrderStatus(req, res) {
  console.log('[updateOrderStatus] updating status for order:', req.params.orderId || req.params.id);
  try {
    const orderId = req.params.orderId || req.params.id;
    const { status, reason } = req.body;

    if (!Order.ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Order.ORDER_STATUSES.join(', ')}`,
      });
    }

    if (['cancelled', 'returned'].includes(status) && !reason) {
      return res.status(400).json({ success: false, message: 'A reason is required for this status change' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const wasCancelled = order.status === 'cancelled';
    order.status = status;
    if (reason) order.cancellationReason = reason;

    if (['cancelled', 'returned'].includes(status)) {
      await refundIfPaidCardOrder(order);
    }

    await order.save();

    publisher.orderStatusUpdated(order.toObject());

    // If admin is cancelling/returning a confirmed order, also restock via product-service
    if (['cancelled', 'returned'].includes(status) && !wasCancelled) {
      publisher.orderCancelled(order.toObject());
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('[updateOrderStatus]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── PATCH /admin/orders/:id/payment ──────────────────────────────────────────
async function updatePaymentStatus(req, res) {
  console.log('[updatePaymentStatus]', req.params.id, req.body);
  try {
    const { paymentStatus } = req.body;

    if (!Order.PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Must be one of: ${Order.PAYMENT_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    console.error('[updatePaymentStatus]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── POST /admin/orders/:id/notes ─────────────────────────────────────────────
// Internal admin notes — never exposed to the customer-facing order views.
async function addAdminNote(req, res) {
  console.log('[addAdminNote]', req.params.id);
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'note is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { adminNotes: { note: note.trim(), addedBy: req.user.id, addedAt: new Date() } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    console.error('[addAdminNote]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── GET /admin/orders/:id/invoice ────────────────────────────────────────────
async function downloadInvoice(req, res) {
  console.log('[downloadInvoice]', req.params.id);
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);

    generateInvoicePdf(order, res); // streams directly to the response
  } catch (err) {
    console.error('[downloadInvoice]', err);
    res.status(500).json({ success: false, message: 'Server error generating invoice' });
  }
}

// ─── PUT /cancel-order/:orderId (user) ────────────────────────────────────────
async function cancelOrder(req, res) {
  console.log('[cancelOrder] cancelling order:', req.params.orderId);
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'pending' && order.status !== 'processing' && order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only pending, confirmed, or processing orders can be cancelled',
      });
    }

    order.status = 'cancelled';
    if (reason) order.cancellationReason = reason;
    await refundIfPaidCardOrder(order);
    await order.save();

    // Publish: product-service will restock the reserved items
    publisher.orderCancelled(order.toObject());

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('[cancelOrder]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─── GET /admin/users/:userId/orders ──────────────────────────────────────────
// Admin viewing a specific customer's order history from the user detail page.
// Routed here directly by the gateway (not through auth-service) since
// order-service owns this data — see api-gateway routing notes.
async function getOrdersByUserId(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { userId: req.params.userId };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[getOrdersByUserId]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrderById,
  getUserOrders,
  getOrdersByUserId,
  updateOrderInfo,
  updateOrderStatus,
  updatePaymentStatus,
  addAdminNote,
  downloadInvoice,
  cancelOrder,
};
