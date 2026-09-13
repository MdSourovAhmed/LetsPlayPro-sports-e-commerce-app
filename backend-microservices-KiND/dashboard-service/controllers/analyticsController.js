const { OrderSummary, ProductSummary } = require('../models/readModels');
const { resolveDateRange } = require('../utils/dateRange');

const REVENUE_STATUSES = ['delivered']; // same definition of "realized revenue" as the dashboard summary

// Buckets a date range into day-sized groups for line/bar chart data.
// For yearly ranges this would produce ~365 points — fine for a chart,
// but if you need month-granularity for yearly views, swap the $dateToString
// format below to '%Y-%m'.
function dateBucketStage(field = '$createdAt') {
  return { $dateToString: { format: '%Y-%m-%d', date: field } };
}

// ─── GET /admin/analytics/overview ─────────────────────────────────────────────
async function getOverview(req, res) {
  try {
    const { start, end } = resolveDateRange(req.query);
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    const [orderStats, newUsersCount] = await Promise.all([
      OrderSummary.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalAmount', 0] },
            },
            totalUnitsSold: { $sum: { $sum: '$items.quantity' } },
          },
        },
      ]),
      // newUsersCount intentionally left out — auth-service owns that data
      // and dashboard-service has read access via UserSummary, but adding
      // it here would require importing UserSummary too; see getOverview's
      // sibling call in dashboardController for the pattern if you want to
      // extend this.
      Promise.resolve(null),
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, totalUnitsSold: 0 };
    const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

    res.json({
      range: { start, end },
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      totalProductsSold: stats.totalUnitsSold,
      averageOrderValue,
    });
  } catch (err) {
    console.error('[getOverview]', err);
    res.status(500).json({ message: 'Server error building analytics overview' });
  }
}

// ─── GET /admin/analytics/sales ────────────────────────────────────────────────
// Time-series data for the line/bar chart — one point per day in range.
async function getSales(req, res) {
  try {
    const { start, end } = resolveDateRange(req.query);

    const series = await OrderSummary.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: dateBucketStage(),
          revenue: {
            $sum: { $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalAmount', 0] },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
    ]);

    res.json({ range: { start, end }, series });
  } catch (err) {
    console.error('[getSales]', err);
    res.status(500).json({ message: 'Server error building sales report' });
  }
}

// ─── GET /admin/analytics/top-products ─────────────────────────────────────────
async function getTopProducts(req, res) {
  try {
    const { start, end } = resolveDateRange(req.query);
    const limit = Number(req.query.limit) || 10;

    const topProductIds = await OrderSummary.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: limit },
    ]);

    // Join product names/SKUs in a second query — these live in a different
    // database, so this can't be a single aggregation pipeline.
    const productIds = topProductIds.map((p) => p._id);
    const products = await ProductSummary.find({ _id: { $in: productIds } })
      .select('name sku')
      .lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const topProducts = topProductIds.map((p) => ({
      productId: String(p._id),
      name: productMap.get(String(p._id))?.name || 'Unknown product',
      sku: productMap.get(String(p._id))?.sku || '—',
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    }));

    res.json({ range: { start, end }, topProducts });
  } catch (err) {
    console.error('[getTopProducts]', err);
    res.status(500).json({ message: 'Server error building top products report' });
  }
}

// ─── GET /admin/analytics/categories ───────────────────────────────────────────
// Revenue by category — requires joining order line items to product
// categories, which again means two queries since they're separate DBs.
async function getCategoryBreakdown(req, res) {
  try {
    const { start, end } = resolveDateRange(req.query);

    const lineItems = await OrderSummary.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] } },
        },
      },
    ]);

    const productIds = lineItems.map((i) => i._id);
    const products = await ProductSummary.find({ _id: { $in: productIds } })
      .select('category')
      .lean();
    const categoryByProduct = new Map(products.map((p) => [String(p._id), p.category || 'Uncategorized']));

    const byCategory = new Map();
    for (const item of lineItems) {
      const category = categoryByProduct.get(String(item._id)) || 'Uncategorized';
      const existing = byCategory.get(category) || { category, unitsSold: 0, revenue: 0 };
      existing.unitsSold += item.unitsSold;
      existing.revenue += item.revenue;
      byCategory.set(category, existing);
    }

    res.json({
      range: { start, end },
      categories: Array.from(byCategory.values()).sort((a, b) => b.revenue - a.revenue),
    });
  } catch (err) {
    console.error('[getCategoryBreakdown]', err);
    res.status(500).json({ message: 'Server error building category report' });
  }
}

// ─── GET /admin/analytics/payment-methods ──────────────────────────────────────
// No date range in the dashboard's contract for this one — all-time breakdown.
async function getPaymentMethodBreakdown(req, res) {
  try {
    const breakdown = await OrderSummary.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalAmount', 0] } },
        },
      },
      { $project: { _id: 0, paymentMethod: '$_id', count: 1, revenue: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.json({ breakdown });
  } catch (err) {
    console.error('[getPaymentMethodBreakdown]', err);
    res.status(500).json({ message: 'Server error building payment method report' });
  }
}

// ─── GET /admin/analytics/export ───────────────────────────────────────────────
// format=csv is fully implemented. format=pdf is intentionally NOT
// implemented in this pass — it would need a charting-to-PDF pipeline
// (e.g. render charts server-side, which is a meaningfully separate body of
// work from a tabular invoice PDF). Returns 501 with a clear message rather
// than silently returning something wrong.
async function exportReport(req, res) {
  try {
    const { format = 'csv' } = req.query;

    if (format === 'pdf') {
      return res.status(501).json({
        message: 'PDF export is not yet implemented. Use format=csv for now.',
      });
    }

    const { start, end } = resolveDateRange(req.query);
    const series = await OrderSummary.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: dateBucketStage(),
          revenue: { $sum: { $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalAmount', 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const rows = ['Date,Orders,Revenue'];
    for (const row of series) {
      rows.push(`${row._id},${row.orders},${row.revenue.toFixed(2)}`);
    }
    const csv = rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${start.toISOString().slice(0, 10)}-to-${end.toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('[exportReport]', err);
    res.status(500).json({ message: 'Server error generating export' });
  }
}

module.exports = {
  getOverview,
  getSales,
  getTopProducts,
  getCategoryBreakdown,
  getPaymentMethodBreakdown,
  exportReport,
};
