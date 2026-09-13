const express = require('express');
const {
  relatedProducts,
  getProductById,
  getFilteredProducts,
  getLatestProducts,
  getBestSellers,
  searchProducts,
} = require('../controllers/clientController');

const router = express.Router();

router.get('/products/related', relatedProducts);
router.get('/products',         getFilteredProducts);
router.get('/product/:id',      getProductById);
router.get('/latest',           getLatestProducts);
router.get('/bestsellers',      getBestSellers);
router.get('/search',           searchProducts);

module.exports = router;
