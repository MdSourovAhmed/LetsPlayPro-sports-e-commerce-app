const Product    = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { invalidateProduct, bumpCacheVersion } = require('../utils/cache');

function extractPublicId(imgUrl) {
  return imgUrl.split('/').pop().split('.')[0];
}

async function uploadImages(images, folder) {
  const uploaded = [];
  for (const img of images) {
    const uploadRes = await cloudinary.uploader.upload(img, { folder });
    uploaded.push(uploadRes.secure_url);
  }
  return uploaded;
}

// ─── POST /admin/products (and legacy /product/create) ──────────────────────────
async function createProduct(req, res) {
  console.log('[createProduct] creating new product...');
  try {
    const {
      sku, name, sport, type, category, brand, price, discountPrice,
      description, shortDescription, stock, bestSell, status, featured,
      tags, specifications, variants, images,
    } = req.body;

    if (Array.isArray(images) && images.length > 4) {
      return res.status(400).json({ success: false, message: 'A product can have at most 4 images' });
    }

    const uploadedImages = (images?.length) ? await uploadImages(images, 'sports-shop/products') : [];

    const product = new Product({
      sku, name, sport, type, category, brand, price, discountPrice,
      description, shortDescription, stock, bestSell,
      status: status || 'active',
      featured: Boolean(featured),
      tags: tags || [],
      images: uploadedImages,
      variants: variants || [],
      specifications: {
        size:     specifications?.size || [],
        color:    specifications?.color || '',
        material: specifications?.material || '',
        weight:   specifications?.weight || '',
        pack:     specifications?.pack || '',
        capacity: specifications?.capacity || '',
      },
    });

    await product.save();
    await bumpCacheVersion(); // a brand-new product should show up in list views immediately
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('[createProduct]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
}

// ─── GET /admin/products ──────────────────────────────────────────────────────────
// Dashboard's product list: search by name/SKU/category/brand, filter by
// category/stock-status/price range/availability, paginate, sort.
async function listProductsAdmin(req, res) {
  console.log('[listProductsAdmin] fetching products with filters...');
  try {
    const {
      search, category, status, brand,
      minPrice, maxPrice,
      page = 1, limit = 20,
      sort = 'newest',
    } = req.query;

    const filter = {};

    if (search) {
      // $text requires the text index; for partial SKU matches (which
      // $text doesn't do well, since it tokenizes on word boundaries) we
      // also fall back to a regex OR across name/sku/brand.
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (status)   filter.status = status;
    if (brand)    filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest:    { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc:{ price: -1 },
      stock:     { stock: -1 },
      popularity:{ bestSell: -1, createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOrder).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[listProductsAdmin]', err);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
}

// ─── GET /admin/products/:id ──────────────────────────────────────────────────────
async function getProductByIdAdmin(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('[getProductByIdAdmin]', err);
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
}

// ─── GET /product/list (legacy, kept for backward compat) ────────────────────────
async function listProducts(req, res) {
  console.log('[listProducts] fetching products (legacy route)...');
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('[listProducts]', err);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
}

// ─── DELETE /admin/products/:id (and legacy /product/:id) ────────────────────────
async function deleteProduct(req, res) {
  console.log('[deleteProduct] deleting product:', req.params.id);
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.images && product.images.length) {
      for (const imgUrl of product.images) {
        const publicId = extractPublicId(imgUrl);
        await cloudinary.uploader.destroy(`sports-shop/products/${publicId}`);
      }
    }

    await product.deleteOne();
    await invalidateProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('[deleteProduct]', err);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
}

// ─── PUT /admin/products/:id (and legacy /product/:id) ────────────────────────────
async function updateProduct(req, res) {
  console.log('[updateProduct] updating product:', req.params.id);
  try {
    const {
      sku, name, sport, type, category, brand, price, discountPrice,
      description, shortDescription, stock, bestSell, status, featured,
      tags, specifications, variants, images,
    } = req.body;

    if (Array.isArray(images) && images.length > 4) {
      return res.status(400).json({ success: false, message: 'A product can have at most 4 images' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let uploadedImages = product.images;

    if (images && images.length) {
      for (const imgUrl of product.images) {
        try {
          const publicId = extractPublicId(imgUrl);
          const destroyRes = await cloudinary.uploader.destroy(`sports-shop/products/${publicId}`);
          if (destroyRes.result === 'ok' || destroyRes.result === 'not found') {
            console.log('[updateProduct] old image removed:', publicId);
          } else {
            console.log('[updateProduct] unexpected destroy response:', destroyRes);
          }
        } catch (destroyErr) {
          console.warn('[updateProduct] failed to remove old image:', destroyErr.message);
        }
      }
      uploadedImages = await uploadImages(images, 'sports-shop/products');
    }

    product.name             = name             ?? product.name;
    product.sport            = sport             ?? product.sport;
    product.type             = type              ?? product.type;
    product.category         = category          ?? product.category;
    product.brand            = brand             ?? product.brand;
    product.price            = price             ?? product.price;
    product.discountPrice    = discountPrice      ?? product.discountPrice;
    product.description      = description       ?? product.description;
    product.shortDescription = shortDescription  ?? product.shortDescription;
    product.stock            = stock             ?? product.stock;
    product.bestSell         = bestSell          ?? product.bestSell;
    product.status           = status            ?? product.status;
    product.featured         = featured          ?? product.featured;
    product.tags             = tags              ?? product.tags;
    product.variants         = variants          ?? product.variants;
    product.images           = uploadedImages;

    product.specifications = {
      ...product.specifications,
      size:     specifications?.size     ?? product.specifications.size,
      color:    specifications?.color    ?? product.specifications.color,
      material: specifications?.material ?? product.specifications.material,
      weight:   specifications?.weight   ?? product.specifications.weight,
      pack:     specifications?.pack     ?? product.specifications.pack,
      capacity: specifications?.capacity ?? product.specifications.capacity,
    };

    await product.save();
    await invalidateProduct(req.params.id);
    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('[updateProduct]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
}

// ─── PATCH /admin/products/bulk ───────────────────────────────────────────────────
// Body: { ids: [...], action: 'delete' | 'activate' | 'draft' | 'archive' }
async function bulkAction(req, res) {
  console.log('[bulkAction]', req.body);
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    if (action === 'delete') {
      const products = await Product.find({ _id: { $in: ids } });
      for (const product of products) {
        for (const imgUrl of product.images || []) {
          try {
            await cloudinary.uploader.destroy(`sports-shop/products/${extractPublicId(imgUrl)}`);
          } catch (destroyErr) {
            console.warn('[bulkAction] failed to remove image:', destroyErr.message);
          }
        }
      }
      await Product.deleteMany({ _id: { $in: ids } });
      await Promise.all(ids.map(invalidateProduct));
      return res.json({ success: true, message: `${products.length} product(s) deleted` });
    }

    const statusActions = { activate: 'active', draft: 'draft', archive: 'archived' };
    if (statusActions[action]) {
      const result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: statusActions[action] } }
      );
      await Promise.all(ids.map(invalidateProduct));
      return res.json({ success: true, message: `${result.modifiedCount} product(s) updated` });
    }

    res.status(400).json({ success: false, message: `Unknown bulk action: ${action}` });
  } catch (err) {
    console.error('[bulkAction]', err);
    res.status(500).json({ success: false, message: 'Error performing bulk action' });
  }
}

module.exports = {
  createProduct,
  listProducts,
  listProductsAdmin,
  getProductByIdAdmin,
  deleteProduct,
  updateProduct,
  bulkAction,
};
