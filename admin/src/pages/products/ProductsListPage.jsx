import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { productApi } from '@/api/productApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SkeletonTable } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { ConfirmDialog } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { ProductFilters } from '@/components/products/ProductFilters';

export default function ProductsListPage() {
  const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => setPage(1), [debouncedSearch, filters.status, filters.sort]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      sort: filters.sort,
    }),
    [page, debouncedSearch, filters.status, filters.sort]
  );

  async function load() {
    setStatus('loading');
    try {
      const { data } = await productApi.list(queryParams);
      setProducts(data.products);
      setPagination(data.pagination);
      setStatus('success');
    } catch (err) {
      toast.error(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  function toggleSelected(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.length === products.length ? [] : products.map((p) => p._id)));
  }

  async function handleBulkAction(action) {
    try {
      await productApi.bulkAction(selectedIds, action);
      toast.success(`${selectedIds.length} product(s) updated`);
      setSelectedIds([]);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await productApi.remove(deleteTarget._id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Products</h1>
        <Link to="/products/new">
          <Button icon={Plus}>Add Product</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark">
        <ProductFilters filters={filters} onChange={setFilters} />

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 border-b border-border dark:border-border-dark bg-brand-50 dark:bg-brand-500/10 px-4 py-2.5">
            <span className="text-sm font-medium text-ink dark:text-ink-dark">
              {selectedIds.length} selected
            </span>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('activate')}>Activate</Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('draft')}>Set as Draft</Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('archive')}>Archive</Button>
            <Button size="sm" variant="ghost" onClick={() => handleBulkAction('delete')}>Delete</Button>
          </div>
        )}

        {status === 'loading' && <div className="p-4"><SkeletonTable columns={6} /></div>}

        {status === 'error' && <ErrorState onRetry={load} description="Couldn't load products." />}

        {status === 'success' && products.length === 0 && (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your filters, or add your first product."
            action={<Link to="/products/new"><Button icon={Plus}>Add Product</Button></Link>}
          />
        )}

        {status === 'success' && products.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark text-left text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-brand-500"
                        checked={selectedIds.length === products.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-surface dark:hover:bg-surface-dark">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-brand-500"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => toggleSelected(product._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface dark:bg-surface-dark">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-ink dark:text-ink-dark">{product.name}</p>
                            <p className="text-xs text-muted dark:text-muted-dark">{product.sku || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">{product.brand}</td>
                      <td className="px-4 py-3">
                        <span className="text-ink dark:text-ink-dark">{formatCurrency(product.discountPrice ?? product.price)}</span>
                        {product.discountPrice && (
                          <span className="ml-1.5 text-xs text-muted line-through dark:text-muted-dark">{formatCurrency(product.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">{product.stock}</td>
                      <td className="px-4 py-3"><Badge status={product.status} /></td>
                      <td className="px-4 py-3 text-muted dark:text-muted-dark">{formatDate(product.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/products/${product._id}/edit`}>
                            <Button variant="ghost" size="sm" icon={Pencil} aria-label="Edit" />
                          </Link>
                          <Button variant="ghost" size="sm" icon={Trash2} aria-label="Delete" onClick={() => setDeleteTarget(product)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete product?"
        description={`"${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
