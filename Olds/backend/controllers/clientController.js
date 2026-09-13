const express = require("express");
// const { query } = require('express-validator'); // For optional query validation if needed
const Product = require("../models/Product");
const auth = require("../middleware/auth");
// const admin = require("../middleware/admin");

const getProductById = async (req, res) => {
  // console.log("Received req with id: ", req.params.id);
  try {
    const product = await Product.findById(req.params.id );
    // console.log(data);
    res.json({ data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


const relatedProducts = async (req, res) => {
  console.log("📦 Fetching related products...");

  try {
    const { sport, type, excludeId } = req.query;

    if (!sport && !type) {
      return res.status(400).json({
        success: false,
        message: "Sport or type must be provided to find related products",
      });
    }

    // 🧠 Build a dynamic filter
    const filter = {};
    if (sport) filter.sport = sport;
    if (type) filter.type = type;
    if (excludeId) filter._id = { $ne: excludeId }; // exclude the current product

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(6); // limit to 6 related items

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("❌ Error fetching related products:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching related products",
      error: err.message,
    });
  }
};

// List products (public: with filters, sorting, pagination) - Existing
// const getFilteredProducts = async (req, res) => {
//   try {
//     const {
//       sport,
//       type,
//       brand,
//       price_min,
//       price_max,
//       sort = "relevant",
//       page = 1,
//       limit = 20,
//     } = req.query;

//     // Build query
//     let filterQuery = { stock: { $gt: 0 } }; // Only in-stock

//     // Multi-select filters (comma-separated → $in array)
//     if (sport) filterQuery.sport = { $in: sport.split(",") };
//     if (type) filterQuery.type = { $in: type.split(",") };
//     if (brand) filterQuery.brand = { $in: brand.split(",") };

//     // Price range
//     if (price_min || price_max) {
//       filterQuery.price = {};
//       if (price_min) filterQuery.price.$gte = parseFloat(price_min);
//       if (price_max) filterQuery.price.$lte = parseFloat(price_max);
//     }

//     // Sorting
//     let sortOptions = { createdAt: -1 }; // Default: newest
//     switch (sort) {
//       case "low-high":
//         sortOptions = { price: 1 };
//         break;
//       case "high-low":
//         sortOptions = { price: -1 };
//         break;
//       default:
//         sortOptions = { createdAt: -1 }; // Relevant = newest
//     }

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Execute query
//     const products = await Product.find(filterQuery)
//       .sort(sortOptions)
//       .limit(parseInt(limit))
//       .skip(skip);

//     const total = await Product.countDocuments(filterQuery);
//     const pages = Math.ceil(total / parseInt(limit));

//     res.json({ products, total, pages });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// const mongoose = require("mongoose");
// const Product = require("../models/Product");

// In-memory cache (can use Redis for production)
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // cache results for 60s

const getFilteredProducts = async (req, res) => {
  try {
    const {
      sport,
      type,
      brand,
      price_min,
      price_max,
      sort = "relevant",
      page = 1,
      limit = 20,
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Safety limit
    const skip = (parseInt(page) - 1) * parsedLimit;

    // Cache key
    const cacheKey = JSON.stringify({ sport, type, brand, price_min, price_max, sort, page, parsedLimit });
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    // Build query
    const filterQuery = { stock: { $gt: 0 } };
    if (sport) filterQuery.sport = { $in: sport.split(",") };
    if (type) filterQuery.type = { $in: type.split(",") };
    if (brand) filterQuery.brand = { $in: brand.split(",") };

    if (price_min || price_max) {
      filterQuery.price = {};
      if (price_min) filterQuery.price.$gte = parseFloat(price_min);
      if (price_max) filterQuery.price.$lte = parseFloat(price_max);
    }

    // Sorting options
    const sortOptions =
      sort === "low-high"
        ? { price: 1 }
        : sort === "high-low"
        ? { price: -1 }
        : { createdAt: -1 };

    // Projection - only return necessary fields
    const projection = { name: 1, sport: 1, type: 1, price: 1, brand: 1, images: { $slice: 1 } };

    // Query execution
    const [products, total] = await Promise.all([
      Product.find(filterQuery, projection).sort(sortOptions).skip(skip).limit(parsedLimit).lean(),
      Product.countDocuments(filterQuery),
    ]);

    const pages = Math.ceil(total / parsedLimit);

    const response = { products, total, pages };
    cache.set(cacheKey, response); // Cache the response

    res.json(response);
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getFilteredProducts };



// NEW: Get latest products (newest arrivals, paginated)
const getLatestProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default limit 10 for "latest collections"

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ stock: { $gt: 0 } }) // In-stock only
      .sort({ createdAt: -1 }) // Newest first
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments({ stock: { $gt: 0 } });
    const pages = Math.ceil(total / parseInt(limit));

    res.json({ products, total, pages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// NEW: Get best sellers (filtered by badminton, sorted by price desc as popularity proxy)
const getBestSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default limit 10

    const filterQuery = {
      stock: { $gt: 0 },
      bestSell: true, // Fixed for BestSeller page
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filterQuery)
      .sort({ price: -1 }) // High price first (proxy for "best sellers"; change to sales field later)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filterQuery);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({ products, total, pages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// const searchProducts = async (req, res) => {
//   try {
//     const {
//       q, // Search query
//       sport,
//       type,
//       brand,
//       price_min,
//       price_max,
//       sort = "relevant",
//       page = 1,
//       limit = 20,
//     } = req.query;

//     // Build query
//     let filterQuery = { stock: { $gt: 0 } }; // Only in-stock

//     // Text search if 'q' provided
//     if (q && q.trim()) {
//       filterQuery.$text = { $search: q.trim() }; // MongoDB text search
//     }

//     // Multi-select filters
//     if (sport) filterQuery.sport = { $in: sport.split(",") };
//     if (type) filterQuery.type = { $in: type.split(",") };
//     if (brand) filterQuery.brand = { $in: brand.split(",") };

//     // Price range
//     if (price_min || price_max) {
//       filterQuery.price = {};
//       if (price_min) filterQuery.price.$gte = parseFloat(price_min);
//       if (price_max) filterQuery.price.$lte = parseFloat(price_max);
//     }

//     // Scoring for relevance (if text search)
//     let projection = {};
//     if (q && q.trim()) {
//       projection.score = { $meta: "textScore" };
//     }

//     // Sorting (text search prioritizes score, else custom)
//     let sortOptions = { createdAt: -1 }; // Default
//     if (q && q.trim()) {
//       sortOptions = { score: { $meta: "textScore" } }; // Relevance first
//     } else {
//       switch (sort) {
//         case "low-high":
//           sortOptions = { price: 1 };
//           break;
//         case "high-low":
//           sortOptions = { price: -1 };
//           break;
//         default:
//           sortOptions = { createdAt: -1 };
//       }
//     }

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Execute
//     const products = await Product.find(filterQuery, projection)
//       .sort(sortOptions)
//       .limit(parseInt(limit))
//       .skip(skip);

//     const total = await Product.countDocuments(filterQuery);
//     const pages = Math.ceil(total / parseInt(limit));

//     res.json({ products, total, pages });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };




const searchProducts = async (req, res) => {
  console.log("Searching with: ",req.query);
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 10;

    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    // 🔍 Use MongoDB text index for fast search
    let products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit);

    // 🧩 If no text results, fallback to regex partial match
    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { sport: { $regex: query, $options: "i" } },
          { type: { $regex: query, $options: "i" } },
        ],
      }).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("❌ Error in searchProducts:", err);
    res.status(500).json({
      success: false,
      message: "Server error while searching products.",
    });
  }
};




module.exports = {
  relatedProducts,
  getProductById,
  getFilteredProducts,
  getLatestProducts,
  getBestSellers,
  searchProducts, // Export new function
};
