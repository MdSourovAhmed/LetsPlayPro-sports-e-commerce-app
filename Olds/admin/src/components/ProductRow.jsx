// import { Trash2, Edit2, CheckSquare, Square } from "lucide-react";

// const ProductRow = ({ item, selectedItems, toggleSelect, onDelete, onEdit }) => {
//   return (
//     <div className="grid grid-cols-[40px_1fr_2fr_1fr_1fr_1fr_2fr] items-center py-2 px-3 border rounded-lg bg-white hover:shadow-sm transition">
//       <button onClick={() => toggleSelect(item._id)} className="flex items-center justify-center">
//         {selectedItems.includes(item._id) ? (
//           <CheckSquare className="w-5 h-5 text-blue-600" />
//         ) : (
//           <Square className="w-5 h-5 text-gray-500" />
//         )}
//       </button>

//       <div className="flex justify-center">
//         <img
//           src={item.images?.[0]"}
//           alt={item.name}
//           className="w-12 h-12 object-cover rounded-md"
//         />
//       </div>

//       <p className="font-medium text-gray-800 truncate">{item.name}</p>
//       <p className="hidden sm:block text-gray-600 text-sm capitalize">{item.sport || "-"}</p>
//       <p className="hidden sm:block text-gray-600 text-sm capitalize">{item.type || "-"}</p>
//       <p className="hidden sm:block text-gray-700 font-semibold">${(item.price || 0).toFixed(2)}</p>

//       <div className="flex justify-center gap-2">
//         <button
//           onClick={() => onEdit(item)}
//           className="p-2 rounded-full hover:bg-blue-100 transition"
//           title="Edit Product"
//         >
//           <Edit2 className="w-5 h-5 text-blue-600" />
//         </button>

//         <button
//           onClick={() => onDelete(item)}
//           className="p-2 rounded-full hover:bg-red-100 transition"
//           title="Remove Product"
//         >
//           <Trash2 className="w-5 h-5 text-red-600" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductRow;



import React from "react";
import { Trash2, Edit2, CheckSquare, Square } from "lucide-react";

const ProductRow = ({ item, selectedItems, toggleSelect, onDelete, onEdit }) => {
  return (
    <div className="grid grid-cols-[40px_1fr_2fr_1fr_1fr_1fr_1fr] items-center py-2 px-3 border rounded-lg bg-white hover:shadow-sm transition">
      <button onClick={() => toggleSelect(item._id)} className="flex items-center justify-center">
        {selectedItems.includes(item._id) ? (
          <CheckSquare className="w-5 h-5 text-blue-600" />
        ) : (
          <Square className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <div className="flex justify-center">
        <img
          src={item.images?.[0]}
          alt={item.name}
          className="w-12 h-12 object-cover rounded-md"
        />
      </div>

      <p className="font-medium text-gray-800 truncate">{item.name}</p>
      <p className="hidden sm:block text-gray-600 text-sm capitalize">{item.sport || "-"}</p>
      <p className="hidden sm:block text-gray-600 text-sm capitalize">{item.type || "-"}</p>
      <p className="hidden sm:block text-gray-700 font-semibold">${(item.price || 0).toFixed(2)}</p>

      <div className="flex justify-center gap-2">
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

export default ProductRow;
