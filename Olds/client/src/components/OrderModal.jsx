import { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { X } from "lucide-react";

const OrderModal = ({ order, onClose }) => {
  const [form, setForm] = useState(order.deliveryInfo);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/update-order/${order._id}`, { deliveryInfo: form });
      if (res.data?.success) {
        toast.success("Order updated successfully");
        onClose();
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      toast.error("Error updating order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold mb-4">Edit Delivery Info</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {Object.keys(form).map((key) => (
            <input
              key={key}
              type="text"
              name={key}
              value={form[key] || ""}
              onChange={handleChange}
              placeholder={key.replace(/([A-Z])/g, " $1")}
              className="border rounded-md p-2 text-sm"
            />
          ))}

          <div className="col-span-2 flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
