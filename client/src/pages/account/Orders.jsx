import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { useMyOrders } from "../../hooks/useOrders";
import { OrderCard } from "../../components/account/OrderCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";

export default function Orders() {
  const { data, isLoading, isError, error, refetch } = useMyOrders();
  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-10 w-10" strokeWidth={1.25} />}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it here."
        action={
          <Link to="/shop" className="btn-primary mt-2">
            Start Shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}
