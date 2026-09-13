import { useOrders } from "../hooks/UseOrders";
import { useState } from "react";
import { Loader2, Pencil, XCircle } from "lucide-react";
import OrderModal from "../components/OrderModal";

const Order = () => {
  const {
    orders,
    loading,
    selectedOrder,
    setSelectedOrder,
    modalOpen,
    setModalOpen,
    cancelOrder,
  } = useOrders();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading orders...
      </div>
    );

  if (!orders.length)
    return (
      <div className="text-center text-gray-600 py-16">
        No orders found yet.
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow rounded-lg p-4 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">
                  Order #{order._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "shipped"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-3 text-gray-700">
              <p>
                <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
              </p>
              <p>
                <strong>Items:</strong> {order.items.length}
              </p>
              <p>
                <strong>Payment:</strong> {order.paymentMethod.toUpperCase()}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              {["pending", "processing"].includes(order.status) && (
                <>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Order;
