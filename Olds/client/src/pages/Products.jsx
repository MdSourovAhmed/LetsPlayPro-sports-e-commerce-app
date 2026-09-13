// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import products from '../assets/sportsData';

// const Products = () => {
//   const { productId } = useParams();
//   console.log(products);
//   const [productData, setProductData] = useState(false);
//   const [img, setImg] = useState("");

//   const fetchData=()=>{
//     products.map((item)=>{
//       console.log(item);
//       if(item.id===productId){
//         setProductData(item);
//         setImg(item.image);
//         return null;
//       }
//     })
//   }

//   useEffect(()=>{
//     fetchData();
//   },[productId]);

//   return productData? (
//   <div className="border-t-2 py-10 transition-opacity ease-in duration-500 opacity-100 ">
//     <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
//       <div className="flex sm:flex-col overflow-x sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
//         {
//           productData.image.map((imge,index)=>(
//             <img onClick={()=>setImg(imge)} src={imge} alt={index} className="w-[24%] sm:w-full " />
//           ))
//         }
//       </div>
//       <div className="w-full sm:w-[80%] ">
//         <img src={img} alt="Its here" className="w-full h-auto" />
//       </div>
//     </div>

//     {/* Product Details */}

//     <div className="flex-1">
//       <h1 className="font-medium text-2xl mt-2 ">{productData.name}</h1>
//       <p className="mt-2 text-gray-600">{productData.averageRating}</p>
//       <p className="mt-4 font-medium text-3xl text-gray-600">{productData.price}</p>
//       <p className="mt-4 text-gray-600 md:w-4/5">{productData.description}</p>
//       <div className="flex gap-4 my-8 flex-col">
//         <p>Select Size</p>
//         <div className="flex gap-4">
//             {
//               productData.size.map((itm,idx)=>(
//                 <button onClick={} className="border py-2 px-4 bg-gray-100">{itm}</button>
//               ))
//             }
//         </div>
//       </div>
//     </div>
//   </div>
// ):<div className="opacity-100">Nothig Found...</div>
// };

// export default Products;

// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ShopContext } from "../contexts/ShopContext"; // Adjust path as needed
// import products from "../assets/sportsData";
// import api from "../utils/api";

// const Products = () => {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const { addToCart, cartItems } = useContext(ShopContext);
//   console.log(products);
//   const [productData, setProductData] = useState(null);
//   const [img, setImg] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [addedToCart, setAddedToCart] = useState(false);

//   const fetchData = async () => {
//     // const foundProduct = products.find(
//     //   (item) => item.id === parseInt(productId)
//     // );
//     try {
//       const res = await api.get(`/product/${productId}`);
//       const foundProduct = res.data.data;
//       if (foundProduct) {
//         setProductData(foundProduct);
//         setImg(foundProduct.images?.[0] || foundProduct.image || "");
//         setSelectedSize(foundProduct.specifications?.size || ""); // Default to first size if available
//       } else {
//         // Optionally navigate to 404 or collection
//         navigate("/collection");
//       }
//     } catch {}
//   };

//   useEffect(() => {
//     fetchData();
//   }, [productId]);

//   const handleSizeClick = (size) => {
//     console.log("clicked");
//     setSelectedSize(size);
//     console.log(selectedSize);
//   };

//   const handleAddToCart = () => {
//     if (selectedSize && productData.stock > 0) {
//       // addToCart(productData.id);
//       addToCart(productData, selectedSize);

//       setAddedToCart(true);
//       setTimeout(() => setAddedToCart(false), 2000); // Toast-like feedback
//     }
//   };

//   if (!productData) {
//     return (
//       <div className="opacity-100 text-center py-10">Nothing Found...</div>
//     );
//   }

//   return (
//     <div className="border-t-2 py-10 transition-opacity ease-in duration-500 opacity-100">
//       <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
//         {/* Image Gallery */}
//         <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-hidden justify-between sm:justify-normal sm:w-[18.7%] w-full">
//           {productData.images && productData.images.length > 0 ? (
//             productData.images.map((imge, index) => (
//               <img
//                 key={index}
//                 onClick={() => setImg(imge)}
//                 src={imge}
//                 alt={`${productData.name} - view ${index + 1}`}
//                 // className={`w-[24%] sm:w-full cursor-pointer transition-opacity hover:opacity-80 ${img === imge ? "ring-2 ring-gray-500" : ""}`}
//                 className={`w-[24%] sm:w-full cursor-pointer h-auto sm:mb-3 flex-shrink-0}`}
//               />
//             ))
//           ) : (
//             <img
//               src={productData.image}
//               alt={productData.name}
//               className="w-[24%] sm:w-full"
//             />
//           )}
//         </div>
//         <div className="w-full sm:w-[80%]">
//           <img
//             src={img || productData.image}
//             alt={productData.name}
//             className="w-full h-auto rounded-lg"
//           />
//         </div>
//       </div>

//       {/* Product Details */}
//       <div className="flex-1 mt-8">
//         {/* Header Info */}
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="font-medium text-2xl">{productData.name}</h1>
//             <p className="mt-2 text-gray-600 flex items-center">
//               {productData.averageRating} / 5 Stars • {productData.brand} •{" "}
//               {productData.sport} {productData.type}
//             </p>
//           </div>
//           <p className="font-medium text-3xl text-gray-600">
//             ${productData.price}
//           </p>
//         </div>

//         {/* Description */}
//         <p className="mt-4 text-gray-600 md:w-4/5">{productData.description}</p>

//         {/* Stock & Tags */}
//         <div className="mt-6 flex items-center justify-between">
//           <p className="text-gray-600">
//             {productData.stock > 0
//               ? `In Stock: ${productData.stock} left`
//               : "Out of Stock"}
//           </p>
//           <div className="flex gap-2">
//             {productData.tags?.map((tag, index) => (
//               <span
//                 key={index}
//                 className="px-2 py-1 bg-gray-100 text-xs rounded"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Size Selector */}
//         <div className="flex gap-4 my-8 flex-col">
//           <p className="font-medium">Select Size</p>
//           <div className="flex gap-4 flex-wrap">
//             {productData.specifications.size&&productData.specifications.size.length > 0 ? (
//               productData.specifications.size.map(
//                 (itm, indx) => (
//                   <button
//                     key={indx}
//                     onClick={() => handleSizeClick(itm)}
//                     className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
//                       selectedSize === itm
//                         ? "bg-gray-500 text-white border-gray-500"
//                         : "bg-gray-100 hover:bg-gray-200"
//                     }`}
//                   >
//                     {itm}
//                   </button>
//                 )
//                 // Array.isArray(productData.specifications.size) ? (
//                 //   productData.specifications.size.map((itm, idx) => (
//                 //     <button
//                 //       key={idx}
//                 //       onClick={() => handleSizeClick(itm)}
//                 //       className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
//                 //         selectedSize === itm
//                 //           ? "bg-gray-500 text-white border-gray-500"
//                 //           : "bg-gray-100 hover:bg-gray-200"
//                 //       }`}
//                 //     >
//                 //       {itm}
//                 //     </button>
//                 //   ))
//                 // ) : (
//                 //   <button
//                 //     onClick={() =>
//                 //       handleSizeClick(productData.specifications.size)
//                 //     }
//                 //     className="border  cursor-pointer py-2 px-4 bg-gray-100 rounded-md"
//                 //   >
//                 //     {productData.specifications.size}
//                 //   </button>
//                 // )
//               )
//             ) : (
//               <p className="text-gray-500">Size not specified</p>
//             )}
//           </div>
//         </div>

//         {/* Specifications */}
//         {productData.specifications &&
//           Object.keys(productData.specifications).length > 0 && (
//             <div className="mb-8">
//               <p className="font-medium mb-4">Specifications</p>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
//                 {Object.entries(productData.specifications).map(
//                   ([key, value]) => (
//                     <div key={key} className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-gray-600 capitalize">
//                         {key.replace(/_/g, " ")}:
//                       </p>
//                       <p className="font-medium">
//                         {Array.isArray(value) ? value.join(", ") : value}
//                       </p>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           )}

//         {/* Add to Cart */}
//         <div className="flex gap-4 items-center">
//           <button
//             onClick={handleAddToCart}
//             disabled={!selectedSize || productData.stock === 0}
//             className={`px-8 py-3 rounded-md font-medium transition-colors ${
//               !selectedSize || productData.stock === 0
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-gray-700 cursor-pointer hover:bg-gray-600 text-white"
//             }`}
//           >
//             {productData.stock === 0 ? "Out of Stock" : "Add to Cart"}
//           </button>
//           {addedToCart && (
//             <span className="text-green-600 font-medium">Added to Cart!</span>
//           )}
//         </div>

//         {/* Reviews Placeholder */}
//         <div className="mt-12">
//           <h2 className="font-medium text-xl mb-4">
//             Reviews ({Math.round(productData.averageRating * 20)}% Positive)
//           </h2>
//           <p className="text-gray-600">
//             No reviews yet. Be the first to review this product.
//           </p>
//           {/* Add review form or list here in future */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Products;

// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ShopContext } from "../contexts/ShopContext";
// import api from "../utils/api";
// import { toast } from "react-toastify";

// const Products = () => {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useContext(ShopContext);

//   const [productData, setProductData] = useState(null);
//   const [img, setImg] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       const res = await api.get(`/product/${productId}`);
//       const foundProduct = res.data;
//       console.log("foundProduct: ",foundProduct);

//       if (!foundProduct) {
//         navigate("/collection");
//         return;
//       }

//       setProductData(foundProduct);
//       setImg(foundProduct?.images?.[0] || foundProduct?.image || "");
//       const sizeValue = foundProduct?.specifications?.size;
//       setSelectedSize(
//         Array.isArray(sizeValue) ? sizeValue[0] : sizeValue || ""
//       );
//     } catch (err) {
//       console.error("Failed to fetch product:", err);
//       navigate("/collection");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [productId]);

//   const handleSizeClick = (size) => setSelectedSize(size);

//   const handleAddToCart = () => {
//     if (!selectedSize || productData?.stock <= 0) {
//       toast.warn("Please select a valid size or check stock!");
//       return;
//     }

//     addToCart(productData, selectedSize);
//     toast.success(`${productData.name} added to cart! 🛒`, {
//       position: "bottom-right",
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: false,
//       draggable: true,
//       progress: undefined,
//     });
//   };

//   if (loading)
//     return <div className="text-center py-10 text-gray-500">Loading...</div>;

//   if (!productData)
//     return <div className="text-center py-10 text-gray-500">Nothing Found...</div>;

//   const {
//     name = "Unnamed Product",
//     price = 0,
//     description = "No description available.",
//     brand = "Unknown Brand",
//     sport = "General",
//     type = "Item",
//     stock = 0,
//     averageRating = 0,
//     tags = [],
//     specifications = {},
//     images = [],
//     image,
//   } = productData;

//   const displayImg = img || image || "/placeholder.png";

//   const sizeArray = Array.isArray(specifications.size)
//     ? specifications.size
//     : specifications.size
//     ? [specifications.size]
//     : [];

//   return (
//     <div className="border-t-2 py-10 transition-opacity ease-in duration-500 opacity-100">
//       {/* Image Gallery */}
//       <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
//         <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-hidden justify-between sm:w-[18.7%] w-full">
//           {images.length > 0 ? (
//             images.map((imge, index) => (
//               <img
//                 key={index}
//                 onClick={() => setImg(imge)}
//                 src={imge}
//                 alt={`${name} - view ${index + 1}`}
//                 className={`w-[24%] sm:w-full cursor-pointer h-auto sm:mb-3 flex-shrink-0 ${
//                   img === imge ? "ring-2 ring-gray-400" : ""
//                 }`}
//               />
//             ))
//           ) : (
//             <img src={displayImg} alt={name} className="w-[24%] sm:w-full" />
//           )}
//         </div>

//         <div className="w-full sm:w-[80%]">
//           <img
//             src={displayImg}
//             alt={name}
//             className="w-full h-auto rounded-lg"
//           />
//         </div>
//       </div>

//       {/* Product Details */}
//       <div className="flex-1 mt-8">
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="font-medium text-2xl">{name}</h1>
//             <p className="mt-2 text-gray-600 flex items-center flex-wrap gap-1">
//               {averageRating?.toFixed(1) ?? 0} / 5 Stars • {brand} • {sport} {type}
//             </p>
//           </div>
//           <p className="font-medium text-3xl text-gray-600">${price}</p>
//         </div>

//         <p className="mt-4 text-gray-600 md:w-4/5">{description}</p>

//         {/* Stock & Tags */}
//         <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
//           <p className="text-gray-600">
//             {stock > 0 ? `In Stock: ${stock} left` : "Out of Stock"}
//           </p>
//           <div className="flex gap-2 flex-wrap">
//             {tags.map((tag, index) => (
//               <span
//                 key={index}
//                 className="px-2 py-1 bg-gray-100 text-xs rounded"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Size Selector */}
//         <div className="flex gap-4 my-8 flex-col">
//           <p className="font-medium">Select Size</p>
//           {sizeArray.length > 0 ? (
//             <div className="flex gap-4 flex-wrap">
//               {sizeArray.map((itm, indx) => (
//                 <button
//                   key={indx}
//                   onClick={() => handleSizeClick(itm)}
//                   className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
//                     selectedSize === itm
//                       ? "bg-gray-500 text-white border-gray-500"
//                       : "bg-gray-100 hover:bg-gray-200"
//                   }`}
//                 >
//                   {itm}
//                 </button>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500">Size not specified</p>
//           )}
//         </div>

//         {/* Specifications */}
//         {specifications && Object.keys(specifications).length > 0 && (
//           <div className="mb-8">
//             <p className="font-medium mb-4">Specifications</p>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
//               {Object.entries(specifications).map(([key, value]) => (
//                 <div key={key} className="bg-gray-50 p-3 rounded-md">
//                   <p className="text-gray-600 capitalize">
//                     {key.replace(/_/g, " ")}:
//                   </p>
//                   <p className="font-medium">
//                     {Array.isArray(value) ? value.join(", ") : value || "N/A"}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Add to Cart */}
//         <div className="flex gap-4 items-center">
//           <button
//             onClick={handleAddToCart}
//             disabled={!selectedSize || stock <= 0}
//             className={`px-8 py-3 rounded-md font-medium transition-colors ${
//               !selectedSize || stock <= 0
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-gray-700 hover:bg-gray-600 text-white"
//             }`}
//           >
//             {stock <= 0 ? "Out of Stock" : "Add to Cart"}
//           </button>
//         </div>

//         {/* Reviews */}
//         <div className="mt-12">
//           <h2 className="font-medium text-xl mb-4">
//             Reviews ({Math.round(averageRating * 20)}% Positive)
//           </h2>
//           <p className="text-gray-600">
//             No reviews yet. Be the first to review this product.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Products;




// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ShopContext } from "../contexts/ShopContext";
// import ProductItem from "../components/ProductItem";
// import api from "../utils/api";

// const Products = () => {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useContext(ShopContext);

//   const [productData, setProductData] = useState(null);
//   const [relatedProductData, setRelatedProductData] = useState(null);
//   const [img, setImg] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [addedToCart, setAddedToCart] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Fetch product data from backend
//   const fetchData = async () => {
//     try {
//       const res = await api.get(`/product/${productId}`);
//       const data = res.data.data;
//       if (data) {
//         setProductData(data);
//         setImg(data.images?.[0] || data.image || "");
//         // Default to first available size if any
//         const firstSize =
//           Array.isArray(data.specifications?.size) &&
//           data.specifications.size.length > 0
//             ? data.specifications.size[0]
//             : "";
//         setSelectedSize(firstSize);
//       } else {
//         navigate("/collection");
//       }
//     } catch (err) {
//       console.error("Error fetching product:", err);
//       navigate("/collection");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const relatedProducts = async () => {
//       //   const params = { sport: productData.sport, type: productData.type };
//       //   const res = await api.get("/related", params);
//       //   setrelatedProductData(res.data.data);
//       const relatedRes = await api.get("/product/related", {
//         params: {
//           sport: productData.sport,
//           type: productData.type,
//           excludeId: productId,
//         },
//       });
//       setRelatedProductData(relatedRes?.data?.products || []);
//     };
//     relatedProducts();

//   }, [productId]);

//   const handleSizeClick = (size) => {
//     setSelectedSize(size);
//   };

//   const handleAddToCart = () => {
//     if (!selectedSize || productData?.stock <= 0) return;
//     // console.log('productData: ',productData);
//     addToCart(productData, selectedSize);
//     setAddedToCart(true);
//     setTimeout(() => setAddedToCart(false), 2000);
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-12 text-gray-500">Loading product...</div>
//     );
//   }

//   if (!productData) {
//     return (
//       <div className="text-center py-12 text-gray-500">Product not found.</div>
//     );
//   }

//   // Destructure safely (no default overrides)
//   const {
//     name,
//     price,
//     description,
//     brand,
//     sport,
//     type,
//     stock,
//     averageRating,
//     tags,
//     specifications,
//     images,
//     image,
//   } = productData;

//   const productImages =
//     Array.isArray(images) && images.length > 0
//       ? images
//       : [image].filter(Boolean);
//   const sizes =
//     Array.isArray(specifications?.size) && specifications.size.length > 0
//       ? specifications.size
//       : specifications?.size
//       ? [specifications.size]
//       : [];

//   return (
//     <div className="border-t-2 py-10 transition-opacity ease-in duration-500 opacity-100">
//       <div className="flex lg:justify-between gap-12 sm:gap-12 flex-col sm:flex-row">
//         {/* Image Gallery */}
//         <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-hidden justify-between sm:justify-normal sm:w-[18.7%] w-full">
//           {productImages.map((imge, index) => (
//             <img
//               key={index}
//               onClick={() => setImg(imge)}
//               src={imge}
//               alt={`${name || "Product"} - view ${index + 1}`}
//               className={`w-[14%] sm:w-[50%] cursor-pointer rounded-md mb-3 border ${
//                 img === imge ? "border-gray-500" : "border-transparent"
//               }`}
//             />
//           ))}
//         </div>

//         {/* Main Image */}
//         <div className="w-full sm:w-[70%]">
//           <img
//             src={img}
//             alt={name || "Product Image"}
//             className="w-[full] h-auto rounded-lg shadow-sm"
//           />
//         </div>
//       </div>

//       {/* Product Details */}
//       <div className="flex-1 mt-8">
//         {/* Header Info */}
//         <div className="flex items-start justify-between flex-wrap">
//           <div>
//             <h1 className="font-medium text-2xl">
//               {name || "Unnamed Product"}
//             </h1>
//             <p className="mt-2 text-gray-600 flex flex-wrap items-center gap-1">
//               {(averageRating ?? 0).toFixed(1)} / 5 Stars •{" "}
//               {brand || "Unknown Brand"} • {sport || "General"} {type || ""}
//             </p>
//           </div>
//           <p className="font-medium text-3xl text-gray-600">${price ?? 0}</p>
//         </div>

//         {/* Description */}
//         <p className="mt-4 text-gray-600 md:w-4/5">
//           {description || "No description available."}
//         </p>

//         {/* Stock & Tags */}
//         <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
//           <p
//             className={`font-medium ${
//               stock > 0 ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {stock > 0 ? `In Stock: ${stock} left` : "Out of Stock"}
//           </p>
//           <div className="flex gap-2 flex-wrap">
//             {Array.isArray(tags) && tags.length > 0 ? (
//               tags.map((tag, i) => (
//                 <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
//                   {tag}
//                 </span>
//               ))
//             ) : (
//               <span className="text-gray-400 text-sm">No tags</span>
//             )}
//           </div>
//         </div>

//         {/* Size Selector */}
//         <div className="flex gap-4 my-8 flex-col">
//           <p className="font-medium">Select Size</p>
//           <div className="flex gap-4 flex-wrap">
//             {sizes.length > 0 ? (
//               sizes.map((itm, indx) => (
//                 <button
//                   key={indx}
//                   onClick={() => handleSizeClick(itm)}
//                   className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
//                     selectedSize === itm
//                       ? "bg-gray-800 text-white border-gray-800"
//                       : "bg-gray-100 hover:bg-gray-200"
//                   }`}
//                 >
//                   {itm}
//                 </button>
//               ))
//             ) : (
//               <p className="text-gray-500">No size options</p>
//             )}
//           </div>
//         </div>

//         {/* Specifications */}
//         {specifications && Object.keys(specifications).length > 0 && (
//           <div className="mb-8">
//             <p className="font-medium mb-4">Specifications</p>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
//               {Object.entries(specifications).map(([key, value]) => {
//                 if (!value) return null;
//                 const displayValue = Array.isArray(value)
//                   ? value.join(", ")
//                   : typeof value === "object"
//                   ? JSON.stringify(value)
//                   : value;
//                 return (
//                   <div key={key} className="bg-gray-50 p-3 rounded-md">
//                     <p className="text-gray-600 capitalize">
//                       {key.replace(/_/g, " ")}:
//                     </p>
//                     <p className="font-medium break-words">{displayValue}</p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Add to Cart */}
//         <div className="flex gap-4 items-center mt-6">
//           <button
//             onClick={handleAddToCart}
//             disabled={!selectedSize || stock <= 0}
//             className={`px-8 py-3 rounded-md font-medium transition-colors ${
//               !selectedSize || stock <= 0
//                 ? "bg-gray-300 cursor-not-allowed text-gray-600"
//                 : "bg-gray-800 hover:bg-gray-700 text-white"
//             }`}
//           >
//             {stock <= 0 ? "Out of Stock" : "Add to Cart"}
//           </button>
//           {addedToCart && (
//             <span className="text-green-600 font-medium transition-opacity duration-500">
//               ✅ Added to Cart!
//             </span>
//           )}
//         </div>
//       </div>
//       {/* </div> */}
//       {/* Reviews Placeholder */}
//       <div className="mt-12">
//         <h2 className="font-medium text-xl mb-4">
//           Reviews ({Math.round((averageRating ?? 0) * 20)}% Positive)
//         </h2>
//         <p className="text-gray-600">
//           No reviews yet. Be the first to review this product.
//         </p>
//       </div>

//       {/* Related Products */}

//       {relatedProductData&&(<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
//         {relatedProductData.map((item) => (
//           <ProductItem
//             key={item._id || item.sku}
//             id={item._id || item.sku}
//             image={item.images?.[0]}
//             name={item.name}
//             price={item.price}
//             brand={item.brand} // Optional: Pass brand if ProductItem supports it
//           />
//         ))}
//       </div>)
//       }
//     </div>
//   );
// };

// export default Products;



import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";
import ProductItem from "../components/ProductItem";
import api from "../utils/api";

const Products = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [img, setImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch single product data
  const fetchProductData = async () => {
    try {
      const res = await api.get(`/product/${productId}`);
      const data = res.data.data;
      if (!data) return navigate("/collection");

      setProductData(data);
      setImg(data.images?.[0] || data.image || "");

      // Default to first available size if present
      const firstSize =
        Array.isArray(data.specifications?.size) &&
        data.specifications.size.length > 0
          ? data.specifications.size[0]
          : "";
      setSelectedSize(firstSize);
    } catch (err) {
      console.error("Error fetching product:", err);
      navigate("/collection");
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products (after productData available)
  const fetchRelatedProducts = async (product) => {
    if (!product?.sport && !product?.type) return;
    try {
      const relatedRes = await api.get("/products/related", {
        params: {
          sport: product.sport,
          type: product.type,
          excludeId: productId,
        },
      });
      setRelatedProductData(relatedRes?.data?.products || []);
    } catch (err) {
      console.error("Error fetching related products:", err);
      setRelatedProductData([]);
    }
  };

  // Handle product + related fetch sequence
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProductData();
    };
    loadData();
  }, [productId]);

  // Fetch related once productData is ready
  useEffect(() => {
    if (productData) fetchRelatedProducts(productData);
  }, [productData]);

  const handleSizeClick = (size) => setSelectedSize(size);

  const handleAddToCart = () => {
    if (!selectedSize || productData?.stock <= 0) return;
    addToCart(productData, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading product...</div>
    );
  }

  if (!productData) {
    return (
      <div className="text-center py-12 text-gray-500">Product not found.</div>
    );
  }

  // Destructure safely
  const {
    name,
    price,
    description,
    brand,
    sport,
    type,
    stock,
    averageRating,
    tags,
    specifications,
    images,
    image,
  } = productData;

  const productImages =
    Array.isArray(images) && images.length > 0
      ? images
      : [image].filter(Boolean);

  const sizes =
    Array.isArray(specifications?.size) && specifications.size.length > 0
      ? specifications.size
      : specifications?.size
      ? [specifications.size]
      : [];

  return (
    <div className="border-t border-gray-400 py-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Image Gallery Section */}
      <div className="flex lg:justify-between gap-12 flex-col sm:flex-row">
        {/* Thumbnail images */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-hidden justify-between sm:w-[18.7%] w-full">
          {productImages.map((imge, index) => (
            <img
              key={index}
              onClick={() => setImg(imge)}
              src={imge}
              alt={`${name || "Product"} - view ${index + 1}`}
              className={`w-[14%] sm:w-[50%] cursor-pointer rounded-md mb-3 border ${
                img === imge ? "border-gray-500" : "border-transparent"
              }`}
            />
          ))}
          </div>

        {/* Main product image */}
          <div className="w-full sm:w-[70%]">
          <img
            src={img}
            alt={name || "Product Image"}
            // className="w-full h-auto rounded-lg shadow-sm"
            className="w-full max-h-3/4 rounded-lg shadow-sm"
          />
          </div>
        </div>
      {/* </div> */}

      {/* Product Details */}
      <div className="flex-1 mt-8">
        <h1 className="font-medium text-2xl mt-2 ">{name || "Unnamed Product"}</h1>
          <div className="flec items-center gap-1 mt-2">
            <p className="pl-2">  {(averageRating ?? 0).toFixed(1)} / 5 Stars •{" "}
              {brand || "Unknown Brand"} • {sport || "General"} {type || ""}</p>
          </div>
          <p className="mt-5 text-3xl font-medium ">${price ?? 0}</p>
          <p className="mt-5 text-gray-500 md:w-4/5 ">{description || "No description available."}</p>
          <p
            className={`font-medium ${
              stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stock > 0 ? `In Stock: ${stock} left` : "Out of Stock"}
          </p>
        {/* <div className="flex items-start justify-between flex-wrap"> */}
          {/* <div> */}
            {/* <h1 className="font-medium text-2xl">{name || "Unnamed Product"}</h1> */}
            {/* <p className="mt-2 text-gray-600 flex flex-wrap items-center gap-1">
              {(averageRating ?? 0).toFixed(1)} / 5 Stars •{" "}
              {brand || "Unknown Brand"} • {sport || "General"} {type || ""}
            </p> */}
          {/* </div> */}
          {/* <p className="font-medium text-3xl text-gray-600">${price ?? 0}</p> */}
        {/* </div> */}

        {/* <p className="mt-4 text-gray-600 md:w-4/5">
          {description || "No description available."}
        </p> */}

        {/* Stock & Tags */}
        {/* <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          <p
            className={`font-medium ${
              stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stock > 0 ? `In Stock: ${stock} left` : "Out of Stock"}
          </p> */}
          {/* <div className="flex gap-2 flex-wrap">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No tags</span>
            )}
          </div> */}
        {/* </div> */}

        {/* Size Selector */}

        <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
               {sizes.length > 0 ? (
              sizes.map((itm, indx) => (
                <button
                  key={indx}
                  onClick={() => handleSizeClick(itm)}
                  className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
                    selectedSize == itm ? "border-orange-500" : ""
                    // selectedSize === itm
                    //   ? "bg-gray-800 text-white border-gray-800"
                    //   : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {itm}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No size options</p>
            )}
                {/* <button className={`border py-2 px-4 bg-gray-100 ${item==size?'border-orange-500':''}`}>Size</button> */}
            </div>
          </div>
        {/* <div className="flex gap-4 my-8 flex-col"> */}
          {/* <p className="font-medium">Select Size</p> */}
          {/* <div className="flex gap-4 flex-wrap"> */}
            {/* {sizes.length > 0 ? (
              sizes.map((itm, indx) => (
                <button
                  key={indx}
                  onClick={() => handleSizeClick(itm)}
                  className={`border cursor-pointer py-2 px-4 rounded-md transition-colors ${
                    selectedSize === itm
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {itm}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No size options</p>
            )} */}
          {/* </div> */}
        {/* </div> */}

        {/* Add to Cart */}
        {/* <div className="flex gap-4 items-center mt-6">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || stock <= 0}
            className={`px-8 py-3 rounded-md font-medium transition-colors ${
              !selectedSize || stock <= 0
                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            }`}
          >
            {stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          {addedToCart && (
            <span className="text-green-600 font-medium transition-opacity duration-500">
              ✅ Added to Cart!
            </span>
          )}
        </div> */}
        <button
            onClick={handleAddToCart}
            disabled={!selectedSize || stock <= 0}
            className={`px-8 py-3 rounded-md font-medium transition-colors ${
              !selectedSize || stock <= 0
                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            } cursor-pointer`}
          >
            {stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          {addedToCart && (
            <span className="text-green-600 font-medium transition-opacity duration-500">
              ✅ Added to Cart!
            </span>
          )}
          {/* <button className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 ">Add to Cart</button> */}
          <hr className="mt-8 sm:w-4/5" />
      </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="font-medium text-xl mb-4">
          Reviews ({Math.round((averageRating ?? 0) * 20)}% Positive)
        </h2>
        <p className="text-gray-600">
          No reviews yet. Be the first to review this product.
        </p>
      </div>

      {/* Related Products */}
      {relatedProductData.length > 0 && (
        <div className="mt-12">
          <h2 className="font-medium text-xl mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
            {relatedProductData.map((item) => (
              <ProductItem
                key={item._id || item.sku}
                id={item._id || item.sku}
                image={item.images?.[0]}
                name={item.name}
                price={item.price}
                brand={item.brand}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
