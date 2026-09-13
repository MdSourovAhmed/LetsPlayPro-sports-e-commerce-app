// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api from "../utils/api.js";
// import upload from "../assets/image-upload.png";

// const Add = () => {
//   // --- Product state ---
//   const [product, setProduct] = useState({
//     name: "",
//     description: "",
//     price: "",
//     stock: "",
//     sport: "",
//     type: "",
//     brand: "",
//     bestSell: false, // ✅ New boolean field
//     specifications: { size: [], color: "", material: "" },
//   });

//   // --- Images + UI state ---
//   const [images, setImages] = useState([]); // Array of { file, preview }
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // --- Predefined size options by product type ---
//   const sizeOptions = {
//     jersey: ["S", "M", "L", "XL"],
//     shoes: ["6", "7", "8", "9", "10", "11"],
//     gloves: ["S", "M", "L"],
//   };

//   /* ==========================
//         HANDLERS
//   ========================== */

//   // --- Handle image upload and validation ---
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = [];

//     files.forEach((file) => {
//       if (!file.type.startsWith("image/")) {
//         toast.error("Only image files are allowed.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Each image must be smaller than 5 MB.");
//         return;
//       }
//       validFiles.push({ file, preview: URL.createObjectURL(file) });
//     });

//     // limit total images to 4
//     if (images.length + validFiles.length > 4) {
//       toast.error("You can upload up to 4 images only.");
//       return;
//     }

//     setImages((prev) => [...prev, ...validFiles]);
//     setError("");
//   };

//   // --- Remove image from list ---
//   const handleRemoveImage = (index) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   // --- General input change handler ---
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     // handle boolean for checkbox
//     setProduct({
//       ...product,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   // --- Update nested specification fields ---
//   const handleSpecChange = (key, value) => {
//     setProduct((prev) => ({
//       ...prev,
//       specifications: { ...prev.specifications, [key]: value },
//     }));
//   };

//   // --- Toggle size selections ---
//   const handleSizeToggle = (size) => {
//     setProduct((prev) => {
//       const selectedSizes = prev.specifications.size.includes(size)
//         ? prev.specifications.size.filter((s) => s !== size)
//         : [...prev.specifications.size, size];
//       return {
//         ...prev,
//         specifications: { ...prev.specifications, size: selectedSizes },
//       };
//     });
//   };

//   // --- Convert image files to base64 for backend upload ---
//   const convertToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (err) => reject(err);
//     });

//   // --- Submit new product ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (images.length === 0) {
//       toast.error("Please upload at least one image.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       // Convert all selected images to base64
//       const base64Images = await Promise.all(
//         images.map((img) => convertToBase64(img.file))
//       );

//       // Construct payload for API
//       const productData = {
//         ...product,
//         price: parseFloat(product.price),
//         stock: parseInt(product.stock),
//         images: base64Images,
//       };

//       await api.post("/product/create", productData);

//       toast.success("✅ Product added successfully!");

//       // Reset form
//       setProduct({
//         name: "",
//         description: "",
//         price: "",
//         stock: "",
//         sport: "",
//         type: "",
//         brand: "",
//         bestSell: false,
//         specifications: { size: [], color: "", material: "" },
//       });
//       setImages([]);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to add product.";
//       toast.error(msg);
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Dynamic size rendering based on selected type ---
//   const currentSizes = sizeOptions[product.type] || [];

//   /* ==========================
//         UI RENDER
//   ========================== */
//   return (
//     <div className="w-full flex justify-center">
//       <form
//         onSubmit={handleSubmit}
//         className="flex flex-col gap-6 w-full max-w-[700px] bg-white shadow-md rounded-2xl p-6 mt-6"
//       >
//         <h2 className="text-2xl font-semibold text-gray-800 mb-2">
//           Add New Product
//         </h2>

//         {/* --- Image Upload Section --- */}
//         <div>
//           <p className="font-medium mb-3 text-gray-700">Product Images</p>
//           {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

//           <div className="flex flex-wrap gap-5">
//             {images.map((img, index) => (
//               <div
//                 key={index}
//                 className="relative w-24 h-24 border rounded-lg overflow-hidden group"
//               >
//                 <img
//                   src={img.preview}
//                   alt={`preview-${index}`}
//                   className="w-full h-full object-cover"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveImage(index)}
//                   className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
//                 >
//                   ✖
//                 </button>
//               </div>
//             ))}

//             {/* Upload Button (max 4 images) */}
//             {images.length < 4 && (
//               <label
//                 htmlFor="upload-input"
//                 className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
//               >
//                 <img src={upload} alt="Upload" className="w-10 opacity-70" />
//                 <input
//                   id="upload-input"
//                   type="file"
//                   multiple
//                   hidden
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </label>
//             )}
//           </div>
//         </div>

//         {/* --- Product Basic Info --- */}
//         <div>
//           <p className="mb-1 text-gray-700">Product Name</p>
//           <input
//             type="text"
//             name="name"
//             value={product.name}
//             onChange={handleChange}
//             required
//             className="w-full px-3 py-2 border rounded-md"
//           />
//         </div>

//         <div>
//           <p className="mb-1 text-gray-700">Description</p>
//           <textarea
//             name="description"
//             value={product.description}
//             onChange={handleChange}
//             required
//             className="w-full px-3 py-2 border rounded-md"
//           />
//         </div>

//         {/* --- Dropdown Fields --- */}
//         <div className="flex gap-4 flex-wrap">
//           {/* Sport */}
//           <div className="flex flex-col">
//             <p className="mb-1 text-gray-700">Sport</p>
//             <select
//               name="sport"
//               value={product.sport}
//               onChange={handleChange}
//               required
//               className="border px-3 py-2 rounded-md"
//             >
//               <option value="">Select</option>
//               {["cricket", "football", "basketball", "badminton", "tennis"].map(
//                 (s) => (
//                   <option key={s} value={s}>
//                     {s.charAt(0).toUpperCase() + s.slice(1)}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           {/* Type */}
//           <div className="flex flex-col">
//             <p className="mb-1 text-gray-700">Type</p>
//             <select
//               name="type"
//               value={product.type}
//               onChange={handleChange}
//               required
//               className="border px-3 py-2 rounded-md"
//             >
//               <option value="">Select</option>
//               {["jersey", "shoes", "gloves", "bat", "ball", "bag", "racket"].map(
//                 (t) => (
//                   <option key={t} value={t}>
//                     {t.charAt(0).toUpperCase() + t.slice(1)}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           {/* Brand */}
//           <div className="flex flex-col">
//             <p className="mb-1 text-gray-700">Brand</p>
//             <input
//               name="brand"
//               value={product.brand}
//               onChange={handleChange}
//               placeholder="e.g. Nike, Adidas"
//               className="border px-3 py-2 rounded-md"
//             />
//           </div>
//         </div>

//         {/* --- Best Seller Toggle --- */}
//         <div className="flex items-center gap-3 mt-2">
//           <input
//             type="checkbox"
//             id="bestSell"
//             name="bestSell"
//             checked={product.bestSell}
//             onChange={handleChange}
//             className="w-5 h-5"
//           />
//           <label htmlFor="bestSell" className="text-gray-700">
//             Mark as Best Seller
//           </label>
//         </div>

//         {/* --- Available Sizes --- */}
//         {currentSizes.length > 0 && (
//           <div>
//             <p className="font-semibold text-gray-700 mb-2">Available Sizes</p>
//             <div className="flex flex-wrap gap-3">
//               {currentSizes.map((size) => (
//                 <label
//                   key={size}
//                   className={`px-4 py-2 border rounded-full cursor-pointer ${
//                     product.specifications.size.includes(size)
//                       ? "bg-blue-600 text-white"
//                       : "bg-white"
//                   }`}
//                 >
//                   <input
//                     type="checkbox"
//                     className="hidden"
//                     checked={product.specifications.size.includes(size)}
//                     onChange={() => handleSizeToggle(size)}
//                   />
//                   {size}
//                 </label>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* --- Color & Material --- */}
//         <div className="flex gap-4 flex-wrap">
//           <div>
//             <p className="mb-1 text-gray-700">Color</p>
//             <input
//               type="text"
//               value={product.specifications.color}
//               onChange={(e) => handleSpecChange("color", e.target.value)}
//               className="border px-3 py-2 rounded-md"
//             />
//           </div>
//           <div>
//             <p className="mb-1 text-gray-700">Material</p>
//             <input
//               type="text"
//               value={product.specifications.material}
//               onChange={(e) => handleSpecChange("material", e.target.value)}
//               className="border px-3 py-2 rounded-md"
//             />
//           </div>
//         </div>

//         {/* --- Pricing & Stock --- */}
//         <div className="flex gap-4 flex-wrap">
//           <div>
//             <p className="mb-1 text-gray-700">Price</p>
//             <input
//               type="number"
//               name="price"
//               value={product.price}
//               onChange={handleChange}
//               required
//               step="0.01"
//               min="0"
//               className="border px-3 py-2 rounded-md"
//             />
//           </div>
//           <div>
//             <p className="mb-1 text-gray-700">Stock</p>
//             <input
//               type="number"
//               name="stock"
//               value={product.stock}
//               onChange={handleChange}
//               required
//               min="0"
//               className="border px-3 py-2 rounded-md"
//             />
//           </div>
//         </div>

//         {/* --- Submit Button --- */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-6 py-2 rounded-full mt-4 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? "Adding Product..." : "Add Product"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Add;



import { toast } from "react-toastify";
import api from "../utils/api";
import ProductForm from "../components/ProductForm";

const AddProduct = () => {
  const handleAdd = async (productData) => {
    const res = await api.post("/product/create", productData);
    if (res.data.success) toast.success("✅ Product added successfully!");
  };

  return <ProductForm onSubmit={handleAdd} buttonLabel="Add Product" />;
};

export default AddProduct;
