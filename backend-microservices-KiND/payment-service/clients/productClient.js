const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const client = axios.create({ baseURL: PRODUCT_SERVICE_URL, timeout: 8000 });

/**
 * Fetches the current canonical product document directly from
 * product-service (internal Docker network call, bypassing the gateway —
 * this is a public read endpoint so no auth headers are needed).
 * @param {string} productId
 * @returns {Promise<object|null>}
 */
async function getProduct(productId) {
  try {
    const { data } = await client.get(`/api/product/${productId}`);
    return data?.data || null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw new Error(`product-service lookup failed for ${productId}: ${err.message}`);
  }
}

module.exports = { getProduct };
