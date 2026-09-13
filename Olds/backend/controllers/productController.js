// const Product = require("../models/Product");
// // const cloudinary = require("cloudinary").v2;

// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // });

// const cloudinary = require("../config/cloudinary");

// // CREATE PRODUCT
// exports.createProduct = async (req, res) => {
//   console.log('Creating New product....');
//   try {
//     const { name, sport, category, price, description, sizes, images } = req.body;
//     let uploadedImages = [];

//     if (images && images.length) {
//       for (const img of images) {
//         const uploadRes = await cloudinary.uploader.upload(img, {
//           folder: "sports-shop/products",
//         });
//         uploadedImages.push(uploadRes.secure_url);
//       }
//     }

//     const product = new Product({
//       name,
//       sport,
//       category,
//       price,
//       description,
//       sizes,
//       images: uploadedImages,
//     });

//     await product.save();
//     res.status(201).json({ success: true, product });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error adding product" });
//   }
// };

// // LIST PRODUCTS
// exports.listProducts = async (req, res) => {
//   console.log('getting Lists');
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, products });
//     console.log('getting Lists done');
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error fetching products" });
//   }
// };

// // DELETE PRODUCT
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     // Delete images from Cloudinary
//     if (product.images.length) {
//       for (const imgUrl of product.images) {
//         const publicId = imgUrl.split("/").pop().split(".")[0];
//         await cloudinary.uploader.destroy(`sports-shop/products/${publicId}`);
//       }
//     }

//     await product.remove();
//     res.status(200).json({ success: true, message: "Product deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error deleting product" });
//   }
// };

// // UPDATE PRODUCT
// exports.updateProduct = async (req, res) => {
//   try {
//     const { name, sport, category, price, description, sizes, images } = req.body;
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     let uploadedImages = [];

//     if (images && images.length) {
//       // Delete old images from Cloudinary
//       if (product.images.length) {
//         for (const imgUrl of product.images) {
//           const publicId = imgUrl.split("/").pop().split(".")[0];
//           await cloudinary.uploader.destroy(`sports-shop/products/${publicId}`);
//         }
//       }

//       // Upload new images
//       for (const img of images) {
//         const uploadRes = await cloudinary.uploader.upload(img, {
//           folder: "sports-shop/products",
//         });
//         uploadedImages.push(uploadRes.secure_url);
//       }
//     }

//     product.name = name || product.name;
//     product.sport = sport || product.sport;
//     product.category = category || product.category;
//     product.price = price || product.price;
//     product.description = description || product.description;
//     product.sizes = sizes || product.sizes;
//     if (uploadedImages.length) product.images = uploadedImages;

//     await product.save();
//     res.status(200).json({ success: true, product });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error updating product" });
//   }
// };

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const getNextId = async () => {
  const lastProduct = await Product.findOne().sort({ id: -1 });
  return lastProduct ? lastProduct._id + 1 : 1 * 7 - 3;
};

// ✅ CREATE PRODUCT
exports.createProduct = async (req, res) => {
  console.log("🆕 Creating new product...");
  try {
    const {
      sku,
      name,
      sport,
      category,
      type,
      brand,
      price,
      description,
      stock,
      bestSell,
      specifications,
      images, // base64 array from frontend
    } = req.body;

    let uploadedImages = [];

    if (images && images.length > 0) {
      for (const img of images) {
        const uploadRes = await cloudinary.uploader.upload(img, {
          folder: "sports-shop/products",
        });
        uploadedImages.push(uploadRes.secure_url);
      }
    }

    const id = await getNextId();

    const product = new Product({
      sku,
      // id,
      name,
      sport,
      category,
      type,
      brand,
      price,
      description,
      stock,
      bestSell,
      images: uploadedImages,
      specifications: {
        size: specifications?.size || [],
        color: specifications?.color || "",
        material: specifications?.material || "",
        weight: specifications?.weight || "",
        pack: specifications?.pack || "",
        capacity: specifications?.capacity || "",
      },
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ success: false, message: "Error adding product" });
  }
};

// ✅ LIST PRODUCTS
exports.listProducts = async (req, res) => {
  console.log("📦 Fetching products...");
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

// ✅ DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  console.log("📦 Deleting products...");

  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Delete images from Cloudinary
    if (product.images && product.images.length) {
      for (const imgUrl of product.images) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`sports-shop/products/${publicId}`);
      }
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

// ✅ UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  console.log("✏️ Updating product...");
  try {
    const {
      sku,
      name,
      sport,
      category,
      type,
      brand,
      price,
      description,
      stock,
      bestSell,
      specifications,
      images,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    let uploadedImages = product.images;

    if (images && images.length) {
      // Optional: delete old images if new ones provided
      for (const imgUrl of product.images) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        const res = await cloudinary.uploader.destroy(
          `sports-shop/products/${publicId}`
        );
        if (res.result === "ok" || res.result === "not found") {
          console.log("Image removed successfully");
          product[imgUrl]='';
        } else {
          console.log("Unexpected response:", res);
        }
      }

      uploadedImages = [];
      for (const img of images) {
        const uploadRes = await cloudinary.uploader.upload(img, {
          folder: "sports-shop/products",
        });
        uploadedImages.push(uploadRes.secure_url);
      }
    }

    product.name = name || product.name;
    product.sport = sport || product.sport;
    product.category = category || product.category;
    product.type = type || product.type;
    product.brand = brand || product.brand;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock ?? product.stock;
    product.bestSell = bestSell ?? product.bestSell;
    product.images = uploadedImages;

    // ✅ update nested specifications safely
    product.specifications = {
      ...product.specifications,
      size: specifications?.size || product.specifications.size,
      color: specifications?.color || product.specifications.color,
      material: specifications?.material || product.specifications.material,
      weight: specifications?.weight || product.specifications.weight,
      pack: specifications?.pack || product.specifications.pack,
      capacity: specifications?.capacity || product.specifications.capacity,
    };

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};
