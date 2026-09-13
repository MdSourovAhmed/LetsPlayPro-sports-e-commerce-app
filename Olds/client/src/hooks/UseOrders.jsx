import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/my`); // authenticated route
      if (res.data?.success) {
        setOrders(res.data.orders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, updatedData) => {
    try {
      const res = await api.put(`/update-order/${orderId}`, updatedData);
      if (res.data?.success) {
        toast.success("Order updated");
        fetchOrders();
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await api.put(`/cancel-order/${orderId}`);
      if (res.data?.success) {
        toast.success("Order cancelled");
        fetchOrders();
      } else {
        toast.error(res.data?.message || "Cancel failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    selectedOrder,
    setSelectedOrder,
    modalOpen,
    setModalOpen,
    fetchOrders,
    updateOrder,
    cancelOrder,
  };
};
