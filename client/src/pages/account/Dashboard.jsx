import { Link } from "react-router-dom";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { useMyOrders } from "../../hooks/useOrders";
import { useWishlistStore } from "../../store/useWishlistStore";
import { OrderCard } from "../../components/account/OrderCard";
import { Skeleton } from "../../components/ui/Skeleton";

export default function Dashboard() {
  const { data, isLoading } = useMyOrders();
  const orders = data?.data ?? [];
  const recentOrders = orders.slice(0, 3);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/account/orders" className="flex items-center gap-3 border border-line p-5 hover:border-ink">
          <Package className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />
          <div>
            <p className="text-xl font-medium text-ink">{orders.length}</p>
            <p className="text-xs text-ink-soft">Orders placed</p>
          </div>
        </Link>
        <Link to="/wishlist" className="flex items-center gap-3 border border-line p-5 hover:border-ink">
          <Heart className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />
          <div>
            <p className="text-xl font-medium text-ink">{wishlistCount}</p>
            <p className="text-xs text-ink-soft">Wishlist items</p>
          </div>
        </Link>
        <Link to="/account/addresses" className="flex items-center gap-3 border border-line p-5 hover:border-ink">
          <MapPin className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />
          <div>
            <p className="text-xl font-medium text-ink">Manage</p>
            <p className="text-xs text-ink-soft">Saved addresses</p>
          </div>
        </Link>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink">Recent Orders</h3>
          {orders.length > 0 && (
            <Link to="/account/orders" className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-ink-soft">No orders yet — your recent orders will show up here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
