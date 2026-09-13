const redis = require('../config/redis');

const VERSION_KEY = 'products:cache:version';
const LIST_TTL_SECONDS = 30;   // filtered/latest/bestsellers/search results
const DETAIL_TTL_SECONDS = 60; // single product — changes less often than "is it in stock right now"

/**
 * List-type caches (filtered products, latest, bestsellers, search) are keyed with this
 * version embedded in them. Bumping the version on any write makes every previously-cached
 * list response unreachable immediately — no need to enumerate or pattern-delete the
 * combinatorial explosion of possible filter/sort/page combinations. Old versioned keys just
 * expire on their own TTL and are never read again.
 */
async function getCacheVersion() {
  const v = await redis.get(VERSION_KEY);
  return v ? parseInt(v, 10) : 1;
}

async function bumpCacheVersion() {
  await redis.incr(VERSION_KEY);
}

/**
 * Generic cache-aside wrapper: try the cache, fall through to `fetcher()` on a miss (or on
 * any Redis error — a cache outage should degrade to "always hit Mongo", not take the
 * service down).
 * @param {string} key
 * @param {number} ttlSeconds
 * @param {() => Promise<any>} fetcher
 */
async function cached(key, ttlSeconds, fetcher) {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);
  } catch (err) {
    console.error('[Product/Cache] read failed, falling through to DB:', err.message);
  }

  const value = await fetcher();

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[Product/Cache] write failed (non-fatal):', err.message);
  }

  return value;
}

/** Builds a stable cache key from a query params object regardless of key insertion order. */
function keyFromParams(prefix, params) {
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${prefix}:${sorted}`;
}

/**
 * Called after any write that changes product data: create/update/delete/bulkAction, and the
 * stock reserve/release calls in rabbitmq/consumer.js. Invalidates both this specific
 * product's detail cache AND every list cache (via the version bump) — a single product's
 * stock going to zero affects "in stock only" filtered lists too, not just its own detail
 * page, so both need to go.
 * @param {string} productId
 */
async function invalidateProduct(productId) {
  try {
    await Promise.all([
      redis.del(`product:detail:${productId}`),
      bumpCacheVersion(),
    ]);
  } catch (err) {
    console.error('[Product/Cache] invalidation failed:', err.message);
  }
}

module.exports = { cached, getCacheVersion, bumpCacheVersion, keyFromParams, invalidateProduct, LIST_TTL_SECONDS, DETAIL_TTL_SECONDS };
