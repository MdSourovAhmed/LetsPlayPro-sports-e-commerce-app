const Product = require('../models/Product');
const { cached, getCacheVersion, keyFromParams, LIST_TTL_SECONDS, DETAIL_TTL_SECONDS } = require('../utils/cache');

// ─── GET /product/:id ──────────────────────────────────────────────────────────
async function getProductById(req, res) {
  try {
    const key = `product:detail:${req.params.id}`;

    const product = await cached(key, DETAIL_TTL_SECONDS, async () => {
      return Product.findById(req.params.id).lean();
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ data: product });
  } catch (err) {
    console.error('[getProductById]', err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// ─── GET /products/related?sport=&type=&excludeId= ───────────────────────────
async function relatedProducts(req, res) {
  try {
    const { sport, type, excludeId } = req.query;

    if (!sport && !type) {
      return res.status(400).json({
        success: false,
        message: 'Sport or type must be provided to find related products',
      });
    }

    const version = await getCacheVersion();
    const key = keyFromParams(`products:related:v${version}`, { sport, type, excludeId });

    const relatedProducts = await cached(key, LIST_TTL_SECONDS, async () => {
      const filter = {};
      if (sport) filter.sport = sport;
      if (type) filter.type = type;
      if (excludeId) filter._id = { $ne: excludeId };
      return Product.find(filter).sort({ createdAt: -1 }).limit(6).lean();
    });

    res.json({ success: true, data: relatedProducts });
  } catch (err) {
    console.error('[relatedProducts]', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: err.message,
    });
  }
}

// ─── GET /products ─────────────────────────────────────────────────────────────
// Cache-aside via Redis, keyed on the version counter + full query so a write anywhere in
// the catalog invalidates every cached filter/sort/page combination at once (see
// utils/cache.js for why — enumerating every possible combination to delete isn't feasible).
async function getFilteredProducts(req, res) {
  try {
    const {
      sport, type, brand, size, gender,
      minPrice, maxPrice, minRating, inStock, onDiscount,
      sort = 'relevant', page = 1, limit = 20, search,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const version = await getCacheVersion();
    const key = keyFromParams(`products:list:v${version}`, {
      sport, type, brand, size, gender, minPrice, maxPrice, minRating,
      inStock, onDiscount, sort, page: parsedPage, limit: parsedLimit, search,
    });

    const response = await cached(key, LIST_TTL_SECONDS, async () => {
      const filterQuery = { stock: { $gt: 0 } };

      if (sport) filterQuery.sport = { $in: sport.split(',') };
      if (type) filterQuery.type = { $in: type.split(',') };
      if (brand) filterQuery.brand = { $in: brand.split(',') };
      if (size) filterQuery.size = { $in: size.split(',') };
      if (gender) filterQuery.gender = { $in: gender.split(',') };

      if (minPrice || maxPrice) {
        filterQuery.price = {};
        if (minPrice) filterQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) filterQuery.price.$lte = parseFloat(maxPrice);
      }

      if (onDiscount === 'true') {
        filterQuery.discount = { $gt: 0 };
      }

      if (search) {
        filterQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
        ];
      }

      const sortOptions =
        sort === 'low-high' ? { price: 1 } :
        sort === 'high-low' ? { price: -1 } :
        { createdAt: -1 };

      const projection = {
        name: 1, sport: 1, type: 1, price: 1, brand: 1,
        images: { $slice: 1 }, rating: 1, stock: 1,
      };

      const [products, total] = await Promise.all([
        Product.find(filterQuery, projection).sort(sortOptions).skip(skip).limit(parsedLimit).lean(),
        Product.countDocuments(filterQuery),
      ]);

      return {
        success: true,
        data: products,
        total,
        totalPages: Math.ceil(total / parsedLimit),
        currentPage: parsedPage,
      };
    });

    res.json(response);
  } catch (err) {
    console.error('[getFilteredProducts]', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

// ─── GET /latest ────────────────────────────────────────────────────────────────
async function getLatestProducts(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const version = await getCacheVersion();
    const key = keyFromParams(`products:latest:v${version}`, { page, limit });

    const response = await cached(key, LIST_TTL_SECONDS, async () => {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [products, total] = await Promise.all([
        Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip).lean(),
        Product.countDocuments({ stock: { $gt: 0 } }),
      ]);
      return { success: true, data: products, total, pages: Math.ceil(total / parseInt(limit)) };
    });

    res.json(response);
  } catch (err) {
    console.error('[getLatestProducts]', err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// ─── GET /bestsellers ───────────────────────────────────────────────────────────
async function getBestSellers(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const version = await getCacheVersion();
    const key = keyFromParams(`products:bestsellers:v${version}`, { page, limit });

    const response = await cached(key, LIST_TTL_SECONDS, async () => {
      const filterQuery = { stock: { $gt: 0 }, bestSell: true };
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(filterQuery).sort({ price: -1 }).limit(parseInt(limit)).skip(skip).lean(),
        Product.countDocuments(filterQuery),
      ]);

      return { success: true, data: products, total, pages: Math.ceil(total / parseInt(limit)) };
    });

    res.json(response);
  } catch (err) {
    console.error('[getBestSellers]', err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// ─── GET /search ─────────────────────────────────────────────────────────────────
async function searchProducts(req, res) {
  try {
    const {
      q, sport, type, brand, price_min, price_max,
      sort = 'relevant', page = 1, limit = 20,
    } = req.query;

    const version = await getCacheVersion();
    const key = keyFromParams(`products:search:v${version}`, {
      q, sport, type, brand, price_min, price_max, sort, page, limit,
    });

    const response = await cached(key, LIST_TTL_SECONDS, async () => {
      const filterQuery = { stock: { $gt: 0 }, status: 'active' };

      if (q && q.trim()) filterQuery.$text = { $search: q.trim() };
      if (sport) filterQuery.sport = { $in: sport.split(',') };
      if (type) filterQuery.type = { $in: type.split(',') };
      if (brand) filterQuery.brand = { $in: brand.split(',') };

      if (price_min || price_max) {
        filterQuery.price = {};
        if (price_min) filterQuery.price.$gte = parseFloat(price_min);
        if (price_max) filterQuery.price.$lte = parseFloat(price_max);
      }

      const projection = {};
      let sortOptions = { createdAt: -1 };
      if (q && q.trim()) {
        projection.score = { $meta: 'textScore' };
        sortOptions = { score: { $meta: 'textScore' } };
      } else if (sort === 'low-high') {
        sortOptions = { price: 1 };
      } else if (sort === 'high-low') {
        sortOptions = { price: -1 };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(filterQuery, projection).sort(sortOptions).limit(parseInt(limit)).skip(skip).lean(),
        Product.countDocuments(filterQuery),
      ]);

      return { products, total, pages: Math.ceil(total / parseInt(limit)) };
    });

    res.json(response);
  } catch (err) {
    console.error('[searchProducts]', err);
    res.status(500).json({ message: 'Server Error' });
  }
}

module.exports = {
  relatedProducts,
  getProductById,
  getFilteredProducts,
  getLatestProducts,
  getBestSellers,
  searchProducts,
};
