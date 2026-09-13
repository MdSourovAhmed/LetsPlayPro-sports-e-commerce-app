import React from "react";
import { Trash2, Edit2 } from "lucide-react";

const ProductCard = ({ item, onDelete, onEdit }) => {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition flex flex-col gap-2">
      <img
        src={item.images?.[0]}
        alt={item.name}
        className="w-full h-36 object-cover rounded-md"
      />
      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
      <p className="text-gray-600 text-sm">{item.sport || "-"}</p>
      <p className="text-gray-600 text-sm">{item.type || "-"}</p>
      <p className="text-gray-700 font-semibold">
        ${(item.price || 0).toFixed(2)}
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(item)}
          className="p-2 rounded-full hover:bg-blue-100 transition"
          title="Edit Product"
        >
          <Edit2 className="w-5 h-5 text-blue-600" />
        </button>

        <button
          onClick={() => onDelete(item)}
          className="p-2 rounded-full hover:bg-red-100 transition"
          title="Remove Product"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
