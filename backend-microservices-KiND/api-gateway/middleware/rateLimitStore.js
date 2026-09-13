const Redis = require('ioredis');
const { RedisStore } = require('rate-limit-redis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  // null (not a number) — a finite value makes ioredis reject in-flight commands with
  // MaxRetriesPerRequestError once exhausted, and that rejection is NOT reliably caught by
  // rate-limit-redis/express-rate-limit's internals in every code path (confirmed by testing:
  // this crashed the entire gateway process on boot with Redis unreachable, not just the rate
  // limiter). null means "keep retrying per retryStrategy below instead of ever giving up and
  // throwing" — a stalled rate-limit check is recoverable, a crashed pod is not.
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('connect', () => console.log('[Gateway/Redis] connected'));
redis.on('error', (err) => console.error('[Gateway/Redis] error:', err.message));

/**
 * Without this, express-rate-limit falls back to an in-memory Map — which lives inside a
 * single pod's process. Run 3 gateway replicas behind a Service/Ingress and each one starts
 * counting from zero: a "max: 10 per 15 min" login limiter effectively becomes "max: 30"
 * because requests get load-balanced across three pods each keeping their own count, and a
 * client hammering the login endpoint just needs to land on a fresh pod to reset their
 * budget. Backing the store with Redis makes the limit apply to the whole fleet, not each
 * pod individually — this is the actual reason this project needs Redis, more than "cache
 * speed" alone.
 * @param {string} prefix - unique per rate limiter instance, so multiple limiters don't share counters
 */
function redisStore(prefix) {
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args) => redis.call(...args),
  });
}

module.exports = { redisStore, redisClient: redis };
