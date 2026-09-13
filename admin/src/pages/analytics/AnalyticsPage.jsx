import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi } from '@/api/analyticsApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/States';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';

const BRAND = '#5B5FEF';
const PIE_COLORS = ['#5B5FEF', '#3FB67F', '#E8A33D', '#E5484D', '#7A7EF2', '#6B6F76'];

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-4">
      <p className="text-xs uppercase tracking-wide text-muted dark:text-muted-dark">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink dark:text-ink-dark">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState({ range: 'monthly', from: '', to: '' });
  const [status, setStatus] = useState('loading');
  const [overview, setOverview] = useState(null);
  const [series, setSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const params = { range: range.range, from: range.from || undefined, to: range.to || undefined };

  async function load() {
    if (range.range === 'custom' && !range.from) return; // wait for a real "from" date before querying
    setStatus('loading');
    try {
      const [overviewRes, salesRes, topRes, catRes, paymentRes] = await Promise.all([
        analyticsApi.getOverview(params),
        analyticsApi.getSales(params),
        analyticsApi.getTopProducts({ ...params, limit: 5 }),
        analyticsApi.getCategoryBreakdown(params),
        analyticsApi.getPaymentMethodBreakdown(),
      ]);
      setOverview(overviewRes.data);
      setSeries(salesRes.data.series);
      setTopProducts(topRes.data.topProducts);
      setCategories(catRes.data.categories);
      setPaymentBreakdown(paymentRes.data.breakdown);
      setStatus('success');
    } catch (err) {
      toast.error(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.range, range.from, range.to]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await analyticsApi.exportReport({ ...params, format: 'csv' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sales-report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "Couldn't export report");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Analytics</h1>
        <div className="flex items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
          <Button variant="secondary" icon={Download} isLoading={isExporting} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {status === 'error' && <ErrorState onRetry={load} description="Couldn't load analytics." />}

      {status === 'success' && overview && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatBox label="Revenue" value={formatCurrency(overview.totalRevenue)} />
            <StatBox label="Orders" value={overview.totalOrders} />
            <StatBox label="Units Sold" value={overview.totalProductsSold} />
            <StatBox label="Avg. Order Value" value={formatCurrency(overview.averageOrderValue)} />
          </div>

          <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
            <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Revenue Over Time</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} width={80} />
                  <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(d) => formatDate(d)} />
                  <Line type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
              <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Top Products</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark text-left text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Units</th>
                    <th className="pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.productId} className="border-b border-border dark:border-border-dark last:border-0">
                      <td className="py-2 text-ink dark:text-ink-dark">{p.name}</td>
                      <td className="py-2 text-ink dark:text-ink-dark">{p.unitsSold}</td>
                      <td className="py-2 text-ink dark:text-ink-dark">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr><td colSpan={3} className="py-4 text-center text-muted dark:text-muted-dark">No sales in this range</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
              <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Revenue by Category</h2>
              {categories.length === 0 ? (
                <p className="mt-4 text-sm text-muted dark:text-muted-dark">No sales in this range</p>
              ) : (
                <div className="mt-2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categories} dataKey="revenue" nameKey="category" outerRadius={80}>
                        {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
            <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Payment Methods</h2>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {paymentBreakdown.map((p) => (
                <div key={p.paymentMethod} className="rounded-lg bg-surface dark:bg-surface-dark p-3">
                  <p className="text-xs uppercase text-muted dark:text-muted-dark">{p.paymentMethod}</p>
                  <p className="mt-1 text-sm font-medium text-ink dark:text-ink-dark">{p.count} orders</p>
                  <p className="text-xs text-muted dark:text-muted-dark">{formatCurrency(p.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
