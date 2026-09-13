// src/hooks/useProductList.js
// import { useEffect, useState, useMemo } from "react";
// import api from "../utils/api";
// import { toast } from "react-toastify";

// const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// export const useProductList = () => {
//   const [list, setList] = useState([]);
//   const [filteredList, setFilteredList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // UI state
//   const [search, setSearch] = useState("");
//   const [sportFilter, setSportFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [sortOrder, setSortOrder] = useState("none");

//   // selection & deleting
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // ✅ Unified API paths (aligned with your backend)
//   const fetchList = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/product/list');
//       if (res.data?.success && res.data.products) {
//         setList(res.data.products);
//         setFilteredList(res.data.products);
//       } else {
//         setList([]);
//         setFilteredList([]);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching products:", err);
//       toast.error("Failed to fetch products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchList();
//   }, []);

//   // ✅ Delete single product
//   const removeProduct = async (id) => {
//     try {
//       const res = await api.delete(`/product/${id}`);
//       if (res.data?.success) {
//         setList((prev) => prev.filter((p) => p._id !== id));
//         toast.success("Product removed successfully");
//       } else {
//         toast.error(res.data?.message || "Failed to remove product");
//       }
//     } catch (err) {
//       console.error("❌ Error deleting product:", err);
//       toast.error("Error deleting product");
//     }
//   };

//   // ✅ Delete multiple selected products
//   const removeSelected = async () => {
//     if (!selectedItems.length) return toast.info("No products selected");
//     if (!window.confirm(`Delete ${selectedItems.length} selected product(s)?`))
//       return;

//     setDeleting(true);
//     try {
//       await Promise.all(
//         selectedItems.map((id) =>
//           api.delete(`/product/${id}`)
//         )
//       );

//       setList((prev) => prev.filter((p) => !selectedItems.includes(p._id)));
//       setSelectedItems([]);
//       setSelectAll(false);
//       toast.success("Selected products deleted");
//     } catch (err) {
//       console.error("❌ Error deleting selected products:", err);
//       toast.error("Error deleting selected products");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ✅ Client-side filter & sort
//   useEffect(() => {
//     let result = [...list];

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       result = result.filter(
//         (p) =>
//           p.name.toLowerCase().includes(q) ||
//           (p.sku && p.sku.toLowerCase().includes(q))
//       );
//     }

//     if (sportFilter !== "all")
//       result = result.filter((p) => p.sport === sportFilter);
//     if (typeFilter !== "all")
//       result = result.filter((p) => p.type === typeFilter);

//     if (sortOrder === "asc")
//       result.sort((a, b) => (a.price || 0) - (b.price || 0));
//     if (sortOrder === "desc")
//       result.sort((a, b) => (b.price || 0) - (a.price || 0));

//     setFilteredList(result);
//   }, [search, sportFilter, typeFilter, sortOrder, list]);

//   const sports = useMemo(
//     () => [
//       "all",
//       ...Array.from(new Set(list.map((p) => p.sport).filter(Boolean))),
//     ],
//     [list]
//   );

//   const types = useMemo(
//     () => [
//       "all",
//       ...Array.from(new Set(list.map((p) => p.type).filter(Boolean))),
//     ],
//     [list]
//   );

//   return {
//     list,
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
//     refetch: fetchList,
//   };
// };



import { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

export const useProductList = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  // selection & deleting
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Fetch products from backend
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/product/list");
      if (res.data?.success && res.data.products) {
        setList(res.data.products);
        setFilteredList(res.data.products);
        setSelectedItems([]);
        setSelectAll(false);
      } else {
        setList([]);
        setFilteredList([]);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // ✅ Delete single product
  const removeProduct = async (id) => {
    try {
      const res = await api.delete(`/product/${id}`);
      if (res.data?.success) {
        setList((prev) => prev.filter((p) => p._id !== id));
        setFilteredList((prev) => prev.filter((p) => p._id !== id));
        setSelectedItems((prev) => prev.filter((i) => i !== id));
        toast.success("Product removed successfully");
      } else {
        toast.error(res.data?.message || "Failed to remove product");
      }
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      toast.error("Error deleting product");
    }
  };

  // ✅ Delete multiple selected products
  const removeSelected = async () => {
    if (!selectedItems.length) return toast.info("No products selected");
    if (!window.confirm(`Delete ${selectedItems.length} selected product(s)?`)) return;

    setDeleting(true);
    try {
      await Promise.all(selectedItems.map((id) => api.delete(`/product/${id}`)));

      setList((prev) => prev.filter((p) => !selectedItems.includes(p._id)));
      setFilteredList((prev) => prev.filter((p) => !selectedItems.includes(p._id)));
      setSelectedItems([]);
      setSelectAll(false);
      toast.success("Selected products deleted");
    } catch (err) {
      console.error("❌ Error deleting selected products:", err);
      toast.error("Error deleting selected products");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Filter & sort
  useEffect(() => {
    let result = [...list];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (sportFilter !== "all") result = result.filter((p) => p.sport === sportFilter);
    if (typeFilter !== "all") result = result.filter((p) => p.type === typeFilter);

    if (sortOrder === "asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortOrder === "desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));

    setFilteredList(result);
  }, [search, sportFilter, typeFilter, sortOrder, list]);

  // ✅ Sports & types for dropdowns
  const sports = useMemo(() => ["all", ...Array.from(new Set(list.map((p) => p.sport).filter(Boolean)))], [list]);
  const types = useMemo(() => ["all", ...Array.from(new Set(list.map((p) => p.type).filter(Boolean)))], [list]);

  return {
    list,
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
    refetch: fetchList, // ✅ Can be called after add/edit
  };
};
