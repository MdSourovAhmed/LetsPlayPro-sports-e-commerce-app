// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import ProductForm from "../components/ProductForm";
// import axios from "axios";
// import { toast } from "react-toastify";

// const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// const EditProduct = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await axios.get(`${backendUrl}/api/admin/product/${id}`);
//         setProduct(res.data.product);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load product");
//       }
//     };
//     fetchProduct();
//   }, [id]);

//   const handleUpdate = async (data) => {
//     setLoading(true);
//     try {
//       const res = await axios.put(`${backendUrl}/api/admin/product/${id}`, data);
//       if (res.data.success) {
//         toast.success("Product updated successfully");
//         navigate("/list");
//       } else {
//         toast.error("Failed to update product");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error updating product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!product) return <p className="text-center mt-10">Loading product...</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
//       <ProductForm initialData={product} onSubmit={handleUpdate} loading={loading} />
//     </div>
//   );
// };


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import ProductForm from "../ProductForm";

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/product/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  const handleUpdate = async (productData) => {
    const res = await api.put(`/product/${id}`, productData);
    if (res.data.success) {
      toast.success("✅ Product updated successfully!");
      navigate("/admin/list");
    }
  };

  if (!product) return <p className="text-center mt-8">Loading...</p>;

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleUpdate}
      buttonLabel="Update Product"
    />
  );
};

export default EditProduct;
