const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  // See api-gateway/middleware/rateLimitStore.js for why this is null, not a number — a
  // finite value can surface as an unhandled rejection that crashes the whole process
  // instead of just failing this one cache operation.
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('connect', () => console.log('[Product/Redis] connected'));
redis.on('error', (err) => console.error('[Product/Redis] error:', err.message));

module.exports = redis;
