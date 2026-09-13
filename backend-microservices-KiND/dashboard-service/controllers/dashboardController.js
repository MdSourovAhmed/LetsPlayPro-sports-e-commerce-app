const { UserSummary, ProductSummary, OrderSummary } = require('../models/readModels');

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

// Maps the order-service's 7-status enum down to the 3 buckets the
// dashboard's stat cards ask for. "completed" here means successfully
// fulfilled (delivered); "pending" covers everything still in flight;
// cancelled/returned both count toward the cancelled bucket since both
// represent revenue that didn't ultimately land.
const PENDING_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];
const COMPLETED_STATUSES = ['delivered'];
const CANCELLED_STATUSES = ['cancelled', 'returned'];

async function getSummary(req, res) {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenueAgg,
      recentOrdersRaw,
      recentUsersRaw,
      lowStockProductsRaw,
    ] = await Promise.all([
      ProductSummary.countDocuments(),
      UserSummary.countDocuments({ role: 'user' }), // customers only, not staff/admin
      OrderSummary.countDocuments(),
      OrderSummary.countDocuments({ status: { $in: PENDING_STATUSES } }),
      OrderSummary.countDocuments({ status: { $in: COMPLETED_STATUSES } }),
      OrderSummary.countDocuments({ status: { $in: CANCELLED_STATUSES } }),
      // Revenue only counts orders that actually completed — pending/cancelled
      // orders haven't (and may never) generate real revenue.
      OrderSummary.aggregate([
        { $match: { status: { $in: COMPLETED_STATUSES } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      OrderSummary.find().sort({ createdAt: -1 }).limit(5).lean(),
      UserSummary.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).lean(),
      ProductSummary.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ stock: 1 })
        .limit(5)
        .lean(),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: String(o._id),
      customerName: [o.deliveryInfo?.firstName, o.deliveryInfo?.lastName].filter(Boolean).join(' ') || 'Unknown',
      status: o.status,
      total: o.totalAmount,
    }));

    const recentUsers = recentUsersRaw.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    }));

    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      id: String(p._id),
      name: p.name,
      sku: p.sku,
      stock: p.stock,
    }));

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      recentOrders,
      recentUsers,
      lowStockProducts,
    });
  } catch (err) {
    console.error('[getSummary]', err);
    res.status(500).json({ message: 'Server error building dashboard summary' });
  }
}

module.exports = { getSummary };
