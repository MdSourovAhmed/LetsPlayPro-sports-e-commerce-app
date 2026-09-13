// import { useState } from "react";

// const ProductForm = ({ initialData = {}, onSubmit, loading }) => {
//   const [formData, setFormData] = useState({
//     name: initialData.name || "",
//     sport: initialData.sport || "",
//     type: initialData.type || "",
//     brand: initialData.brand || "",
//     price: initialData.price || "",
//     description: initialData.description || "",
//     stock: initialData.stock || "",
//     bestSell: initialData.bestSell || false,
//     images: initialData.images || [],
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     files.forEach((file) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData((prev) => ({
//           ...prev,
//           images: [...prev.images, reader.result],
//         }));
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white p-6 rounded-lg shadow-md space-y-4"
//     >
//       <div>
//         <label className="block font-medium">Name</label>
//         <input
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className="border rounded-md w-full px-3 py-2"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block font-medium">Sport</label>
//           <input
//             name="sport"
//             value={formData.sport}
//             onChange={handleChange}
//             className="border rounded-md w-full px-3 py-2"
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Type</label>
//           <input
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//             className="border rounded-md w-full px-3 py-2"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block font-medium">Brand</label>
//           <input
//             name="brand"
//             value={formData.brand}
//             onChange={handleChange}
//             className="border rounded-md w-full px-3 py-2"
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Price</label>
//           <input
//             type="number"
//             name="price"
//             value={formData.price}
//             onChange={handleChange}
//             className="border rounded-md w-full px-3 py-2"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block font-medium">Description</label>
//         <textarea
//           name="description"
//           value={formData.description}
//           onChange={handleChange}
//           className="border rounded-md w-full px-3 py-2"
//         />
//       </div>

//       <div className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           name="bestSell"
//           checked={formData.bestSell}
//           onChange={handleChange}
//         />
//         <label>Mark as Best Seller</label>
//       </div>

//       <div>
//         <label className="block font-medium">Images</label>
//         <input type="file" multiple onChange={handleImageUpload} />
//         <div className="flex gap-2 mt-2 flex-wrap">
//           {formData.images.map((img, i) => (
//             <div key={i} className="relative">
//               <img
//                 src={img}
//                 alt="preview"
//                 className="w-20 h-20 rounded-md object-cover border"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(i)}
//                 className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded-md"
//       >
//         {loading ? "Saving..." : "Save Product"}
//       </button>
//     </form>
//   );
// };

// export default ProductForm;

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import upload from "../assets/image-upload.png";

const ProductForm = ({
  initialData = null,
  onSubmit,
  buttonLabel = "Add Product",
  loading = false,
}) => {
  // --- Initialize Product State ---
  const [product, setProduct] = useState(
    initialData || {
      sku: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      sport: "",
      type: "",
      brand: "",
      bestSell: false,
      specifications: { size: [], color: "", material: "" },
    }
  );

  // --- Images State ---
  const [images, setImages] = useState(
    initialData?.images?.map((url) => ({ file: null, preview: url })) || []
  );
  const [error, setError] = useState("");

  // --- Predefined Size Options ---
  const sizeOptions = {
    jersey: ["S", "M", "L", "XL"],
    shoes: ["6", "7", "8", "9", "10", "11"],
    gloves: ["S", "M", "L"],
  };

  // ================================
  //           HANDLERS
  // ================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be smaller than 5 MB.");
        return;
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    });

    if (images.length + validFiles.length > 4) {
      toast.error("You can upload up to 4 images only.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError("");
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSpecChange = (key, value) => {
    setProduct((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
  };

  const handleSizeToggle = (size) => {
    setProduct((prev) => {
      const selectedSizes = prev.specifications.size.includes(size)
        ? prev.specifications.size.filter((s) => s !== size)
        : [...prev.specifications.size, size];
      return {
        ...prev,
        specifications: { ...prev.specifications, size: selectedSizes },
      };
    });
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setError("");

    try {
      const base64Images = await Promise.all(
        images.map(async (img) =>
          img.file ? await convertToBase64(img.file) : img.preview
        )
      );

      const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        images: base64Images,
      };

      await onSubmit(productData);
    } catch (err) {
      toast.error("Something went wrong during submission.");
      console.error(err);
    }
  };

  const currentSizes = sizeOptions[product.type] || [];

  // ================================
  //           UI RENDER
  // ================================

  return (
    <div className="w-full flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-[700px] bg-white shadow-md rounded-2xl p-6 mt-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {initialData ? "Edit Product" : "Add New Product"}
        </h2>

        {/* --- Image Upload Section --- */}
        <div>
          <p className="font-medium mb-3 text-gray-700">Product Images</p>
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          <div className="flex flex-wrap gap-5">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 border rounded-lg overflow-hidden group"
              >
                <img
                  src={img.preview}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✖
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label
                htmlFor="upload-input"
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
              >
                <img src={upload} alt="Upload" className="w-10 opacity-70" />
                <input
                  id="upload-input"
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* --- Product Basic Info --- */}
        <div>
          <p className="mb-1 text-gray-700">SKU</p>
          <input
            type="text"
            name="sku"
            value={product.sku}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <p className="mb-1 text-gray-700">Product Name</p>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <p className="mb-1 text-gray-700">Description</p>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* --- Dropdown Fields --- */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col">
            <p className="mb-1 text-gray-700">Sport</p>
            <select
              name="sport"
              value={product.sport}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Select</option>
              {["Cricket", "Football", "Basketball", "Badminton", "Tennis","Fitness"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <p className="mb-1 text-gray-700">Type</p>
            <select
              name="type"
              value={product.type}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Select</option>
              {[
                "Accessory",
                "Jersey",
                "Shoes",
                "Gloves",
                "Bat",
                "Ball",
                "Bag",
                "Racket",
                "Shutle",
                "Net",
                "Cap",
              ].map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <p className="mb-1 text-gray-700">Brand</p>
            <input
              name="brand"
              value={product.brand}
              onChange={handleChange}
              placeholder="e.g. Nike, Adidas"
              className="border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* --- Best Seller Toggle --- */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="bestSell"
            name="bestSell"
            checked={product.bestSell}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="bestSell" className="text-gray-700">
            Mark as Best Seller
          </label>
        </div>

        {/* --- Available Sizes --- */}
        {currentSizes.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 mb-2">Available Sizes</p>
            <div className="flex flex-wrap gap-3">
              {currentSizes.map((size) => (
                <label
                  key={size}
                  className={`px-4 py-2 border rounded-full cursor-pointer ${
                    product.specifications.size.includes(size)
                      ? "bg-blue-600 text-white"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={product.specifications.size.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* --- Color & Material --- */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="mb-1 text-gray-700">Color</p>
            <input
              type="text"
              value={product.specifications.color}
              onChange={(e) => handleSpecChange("color", e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <p className="mb-1 text-gray-700">Material</p>
            <input
              type="text"
              value={product.specifications.material}
              onChange={(e) => handleSpecChange("material", e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* --- Pricing & Stock --- */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="mb-1 text-gray-700">Price</p>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <p className="mb-1 text-gray-700">Stock</p>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              required
              min="0"
              className="border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* --- Submit Button --- */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-full mt-4 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : buttonLabel}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
