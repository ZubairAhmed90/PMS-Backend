const Redis = require('ioredis');
const config = require('./index');

let redisClient = null;
let redisAttempted = false;

function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (redisAttempted) return redisClient;
  redisAttempted = true;

  try {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize:', err.message);
    redisClient = null;
  }

  return redisClient;
}

module.exports = { getRedisClient };
