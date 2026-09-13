// import React, { useEffect, useState } from "react";
// import api from "../utils/api";
// import { toast } from "react-toastify";
// import { Loader2, CheckCircle, XCircle } from "lucide-react";

// const statusColors = {
//   pending: "bg-yellow-100 text-yellow-800",
//   processing: "bg-blue-100 text-blue-800",
//   shipped: "bg-purple-100 text-purple-800",
//   delivered: "bg-green-100 text-green-800",
//   cancelled: "bg-red-100 text-red-800",
// };

// const OrdersManage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [search, setSearch] = useState("");

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/orders");
//       if (res.data.success) {
//         setOrders(res.data.orders);
//       } else {
//         toast.error("Failed to fetch orders");
//       }
//     } catch (err) {
//       console.error("❌ Fetch orders error:", err);
//       toast.error("Error fetching orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const handleStatusChange = async (orderId, newStatus) => {
//     try {
//       const res = await api.patch(`/update-order-status/${orderId}`, {
//         status: newStatus,
//       });
//       if (res.data.success) {
//         toast.success(`Order marked as ${newStatus}`);
//         setOrders((prev) =>
//           prev.map((order) =>
//             order._id === orderId ? { ...order, status: newStatus } : order
//           )
//         );
//       }
//     } catch (err) {
//       console.error("❌ Status update error:", err);
//       toast.error("Error updating order status");
//     }
//   };

//   const filteredOrders = orders.filter((o) => {
//     const matchesStatus =
//       selectedStatus === "all" || o.status === selectedStatus;
//     const matchesSearch =
//       o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
//       o.deliveryInfo?.email?.toLowerCase().includes(search.toLowerCase()) ||
//       o._id?.toLowerCase().includes(search.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-64 text-gray-600">
//         <Loader2 className="animate-spin mr-2" /> Loading orders...
//       </div>
//     );

//   return (
//     <div className="p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
//         <h1 className="text-2xl font-semibold">Manage Orders</h1>
//         <div className="flex gap-3 w-full sm:w-auto">
//           <input
//             type="text"
//             placeholder="Search by name, email, or ID"
//             className="border rounded-lg px-3 py-2 w-full sm:w-64"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <select
//             className="border rounded-lg px-3 py-2"
//             value={selectedStatus}
//             onChange={(e) => setSelectedStatus(e.target.value)}
//           >
//             <option value="all">All</option>
//             <option value="pending">Pending</option>
//             <option value="processing">Processing</option>
//             <option value="shipped">Shipped</option>
//             <option value="delivered">Delivered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       {/* Orders List */}
//       <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-100 text-left text-gray-700">
//             <tr>
//               <th className="p-3">Order ID</th>
//               <th className="p-3">Customer</th>
//               <th className="p-3">Total</th>
//               <th className="p-3">Items</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Date</th>
//               <th className="p-3 text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredOrders.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="text-center py-6 text-gray-500">
//                   No orders found
//                 </td>
//               </tr>
//             ) : (
//               filteredOrders.map((order) => (
//                 <tr
//                   key={order._id}
//                   className="border-t hover:bg-gray-50 transition"
//                 >
//                   <td className="p-3 font-mono text-sm">{order._id}</td>
//                   <td className="p-3">
//                     <p className="font-medium">
//                       {order.userId?.name || "Unknown User"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {order.deliveryInfo?.email}
//                     </p>
//                   </td>
//                   <td className="p-3 font-semibold">${order.totalAmount}</td>
//                   <td className="p-3 text-sm text-gray-700">
//                     {order.items.map((it, i) => (
//                       <div key={i} className="flex items-center gap-2">
//                         <img
//                           src={it.productId?.images?.[0]}
//                           alt={it.productId?.name}
//                           className="w-8 h-8 object-cover rounded"
//                         />
//                         <span>{it.productId?.name}</span>
//                         <span className="text-gray-400 text-xs">
//                           x{it.quantity}
//                         </span>
//                       </div>
//                     ))}
//                   </td>
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         statusColors[order.status] ||
//                         "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="p-3 text-sm text-gray-600">
//                     {new Date(order.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="p-3 text-center">
//                     {order.status !== "cancelled" &&
//                     order.status !== "delivered" ? (
//                       <select
//                         className="border rounded-md px-2 py-1 text-sm"
//                         value={order.status}
//                         onChange={(e) =>
//                           handleStatusChange(order._id, e.target.value)
//                         }
//                       >
//                         <option value="pending">Pending</option>
//                         <option value="processing">Processing</option>
//                         <option value="shipped">Shipped</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="cancelled">Cancel</option>
//                       </select>
//                     ) : (
//                       <span className="text-gray-400 text-sm">Locked</span>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OrdersManage;



import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // for modal

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      if (res.data.success) setOrders(res.data.orders);
      else toast.error("Failed to fetch orders");
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/update-order-status/${orderId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder?._id === orderId)
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("❌ Status update error:", err);
      toast.error("Error updating order status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    const matchesSearch =
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryInfo?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o._id?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading orders...
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Manage Orders</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, or ID"
            className="border rounded-lg px-3 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table (desktop) */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-3 font-mono text-sm">{order._id}</td>
                  <td className="p-3">
                    <p className="font-medium">{order.userId?.name}</p>
                    <p className="text-sm text-gray-500">{order.deliveryInfo?.email}</p>
                  </td>
                  <td className="p-3 font-semibold">${order.totalAmount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center text-blue-600 text-sm underline">
                    View
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Cards (mobile) */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg bg-white p-4 shadow-sm"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-sm text-gray-500">{order._id}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="font-medium">{order.userId?.name}</p>
            <p className="text-sm text-gray-500">{order.deliveryInfo?.email}</p>
            <p className="mt-2 text-sm font-semibold">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* ✅ MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg relative p-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500">Order ID:</p>
              <p className="font-mono">{selectedOrder._id}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Info</h3>
                <p>{selectedOrder.userId?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.deliveryInfo?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.deliveryInfo?.phone}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-700">
                  {selectedOrder.deliveryInfo?.street}, {selectedOrder.deliveryInfo?.city}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.deliveryInfo?.country} - {selectedOrder.deliveryInfo?.zip}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Items</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {selectedOrder.items.map((item, i) => (
                  <li key={i}>
                    {item.productId?.name || "Unnamed"} x{item.quantity}
                    {item.size && (
                      <span className="text-gray-500 text-xs"> ({item.size})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700">
                Payment:{" "}
                <span className="font-medium">{selectedOrder.paymentMethod}</span>
              </p>
              <p className="font-semibold text-lg">
                Total: ${selectedOrder.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[selectedOrder.status]
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              {["pending", "processing", "shipped"].includes(selectedOrder.status) && (
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder._id, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancel</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManage;
