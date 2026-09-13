// import React, { useState } from "react";
// import { useProductList } from "../hooks/useProductList";
// import ProductRow from "../components/ProductRow";
// import ProductCard from "../components/ProductCard";
// import ProductForm from "../components/ProductForm";
// import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
// import { Search, CheckSquare, Square } from "lucide-react";

// const List = () => {
//   const {
//     filteredList,
//     loading,
//     search,
//     setSearch,
//     sportFilter,
//     setSportFilter,
//     typeFilter,
//     setTypeFilter,
//     sortOrder,
//     setSortOrder,
//     removeProduct,
//     removeSelected,
//     selectedItems,
//     setSelectedItems,
//     selectAll,
//     setSelectAll,
//     deleting,
//     sports,
//     types,
//     refetch, // ✅ added
//   } = useProductList();

//   const [editingProduct, setEditingProduct] = useState(null);
//   const [formOpen, setFormOpen] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [toDeleteProduct, setToDeleteProduct] = useState(null);

//   const handleDeleteClick = (product) => {
//     setToDeleteProduct(product);
//     setModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!toDeleteProduct) return;
//     await removeProduct(toDeleteProduct._id);
//     setToDeleteProduct(null);
//     setModalOpen(false);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedItems([]);
//       setSelectAll(false);
//     } else {
//       setSelectedItems(filteredList.map((p) => p._id));
//       setSelectAll(true);
//     }
//   };

//   const toggleSelect = (id) => {
//     setSelectedItems((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="w-full p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-semibold">All Products</h2>
//         {selectedItems.length > 0 && (
//           <button
//             onClick={removeSelected}
//             className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition"
//             disabled={deleting}
//           >
//             {deleting
//               ? "Deleting..."
//               : `Delete Selected (${selectedItems.length})`}
//           </button>
//         )}
//       </div>

//       {/* Search & Filters */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
//         <div className="flex items-center gap-2 border px-3 py-2 rounded-md w-full sm:w-[320px] bg-white shadow-sm">
//           <Search className="w-4 h-4 text-gray-500" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by name or SKU..."
//             className="outline-none w-full text-sm"
//           />
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           <select
//             value={sportFilter}
//             onChange={(e) => setSportFilter(e.target.value)}
//             className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
//           >
//             {sports.map((s) => (
//               <option key={s} value={s}>
//                 {s === "all" ? "All Sports" : s}
//               </option>
//             ))}
//           </select>

//           <select
//             value={typeFilter}
//             onChange={(e) => setTypeFilter(e.target.value)}
//             className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
//           >
//             {types.map((t) => (
//               <option key={t} value={t}>
//                 {t === "all" ? "All Types" : t}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
//           >
//             <option value="none">Sort by Price</option>
//             <option value="asc">Low → High</option>
//             <option value="desc">High → Low</option>
//           </select>
//         </div>
//       </div>

//       {/* Table Header */}
//       <div className="hidden md:grid grid-cols-[40px_1fr_2fr_1fr_1fr_1fr_1fr] items-center py-2 px-3 border bg-gray-100 text-sm font-semibold text-gray-700 mb-2">
//         <button onClick={toggleSelectAll}>
//           {selectAll ? (
//             <CheckSquare className="w-5 h-5 text-blue-600" />
//           ) : (
//             <Square className="w-5 h-5 text-gray-500" />
//           )}
//         </button>
//         <p>Image</p>
//         <p>Name</p>
//         <p>Sport</p>
//         <p>Type</p>
//         <p>Price</p>
//         <p className="text-center">Action</p>
//       </div>

//       {/* Body */}
//       {loading ? (
//         <p className="text-center text-gray-500">Loading...</p>
//       ) : filteredList.length === 0 ? (
//         <p className="text-center text-gray-500">No products found.</p>
//       ) : (
//         <div className="flex flex-col gap-2">
//           <div className="hidden md:block">
//             {filteredList.map((item) => (
//               <ProductRow
//                 key={item._id}
//                 item={item}
//                 selectedItems={selectedItems}
//                 toggleSelect={toggleSelect}
//                 onDelete={handleDeleteClick}
//                 onEdit={(p) => {
//                   setEditingProduct(p);
//                   setFormOpen(true);
//                 }}
//               />
//             ))}
//           </div>

//           <div className="md:hidden flex flex-col gap-3">
//             {filteredList.map((item) => (
//               <ProductCard
//                 key={item._id}
//                 item={item}
//                 onDelete={handleDeleteClick}
//                 onEdit={(p) => {
//                   setEditingProduct(p);
//                   setFormOpen(true);
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Product Form Modal */}
//       {formOpen && (
//         <ProductForm
//           product={editingProduct} // if null → add new product
//           onClose={() => {
//             setEditingProduct(null);
//             setFormOpen(false);
//           }}
//           onSuccess={() => {
//             setEditingProduct(null);
//             setFormOpen(false);
//             refetch(); // reload the product list after edit/add
//           }}
//         />
//       )}

//       {/* Confirm Delete Modal */}
//       <ConfirmDeleteModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onConfirm={confirmDelete}
//         title="Confirm delete"
//         message={`Delete "${toDeleteProduct?.name}"? This action cannot be undone.`}
//       />
//     </div>
//   );
// };

// export default List;

import React, { useState, useRef, useEffect } from "react";
import { useProductList } from "../hooks/useProductList";
import ProductRow from "../components/ProductRow";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Search, CheckSquare, Square } from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";

const List = () => {
  const {
    filteredList,
    loading,
    search,
    setSearch,
    sportFilter,
    setSportFilter,
    typeFilter,
    setTypeFilter,
    sortOrder,
    setSortOrder,
    removeProduct,
    removeSelected,
    selectedItems,
    setSelectedItems,
    selectAll,
    setSelectAll,
    deleting,
    sports,
    types,
    refetch, // needed for refreshing list
  } = useProductList();

  const modalRef = useRef();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDeleteProduct, setToDeleteProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Close modal on click outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setFormOpen(false);
      setEditingProduct(null);
    }
  };

  // --- Delete logic ---
  const handleDeleteClick = (product) => {
    setToDeleteProduct(product);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteProduct) return;
    await removeProduct(toDeleteProduct._id);
    setToDeleteProduct(null);
    setModalOpen(false);
  };

  // --- Select logic ---
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(filteredList.map((p) => p._id));
      setSelectAll(true);
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- Submit handler for ProductForm (Add / Edit) ---
  const handleFormSubmit = async (productData) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        // Edit existing product
        await api.put(`/product/${editingProduct._id}`, productData);
        toast.success("Product updated successfully");
      } else {
        // Add new product
        await api.post("/product/create", productData);
        toast.success("Product added successfully");
      }
      refetch(); // Refresh product list
      setFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      setFormOpen(false);
      setEditingProduct(null);
    }
  };

  useEffect(() => {
    if (formOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [formOpen]);

  return (
    <div className="w-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">All Products</h2>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={removeSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition"
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : `Delete Selected (${selectedItems.length})`}
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null); // null → add new
              setFormOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 border px-3 py-2 rounded-md w-full sm:w-[320px] bg-white shadow-sm">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Sports" : s}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All Types" : t}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="none">Sort by Price</option>
            <option value="asc">Low → High</option>
            <option value="desc">High → Low</option>
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[40px_1fr_2fr_1fr_1fr_1fr_1fr] items-center py-2 px-3 border bg-gray-100 text-sm font-semibold text-gray-700 mb-2">
        <button onClick={toggleSelectAll}>
          {selectAll ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-500" />
          )}
        </button>
        <p>Image</p>
        <p>Name</p>
        <p>Sport</p>
        <p>Type</p>
        <p>Price</p>
        <p className="text-center">Action</p>
      </div>

      {/* Body */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredList.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Desktop Rows */}
          <div className="hidden md:block">
            {filteredList.map((item) => (
              <ProductRow
                key={item._id}
                item={item}
                selectedItems={selectedItems}
                toggleSelect={toggleSelect}
                onDelete={handleDeleteClick}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setFormOpen(true);
                }}
              />
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredList.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onDelete={handleDeleteClick}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setFormOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}


      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto p-6 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-[700px]  rounded-2xl p-6 mt-20 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setFormOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
              aria-label="Close modal"
            >
              ✖
            </button>

            <ProductForm
              initialData={editingProduct || null}
              onSubmit={handleFormSubmit}
              buttonLabel={editingProduct ? "Update Product" : "Add Product"}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm delete"
        message={`Delete "${toDeleteProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default List;
