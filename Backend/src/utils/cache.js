const NodeCache = require("node-cache");
const redis = require("redis");
const logger = require("./logger");

class CacheService {
  constructor() {
    this.nodeCache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL
    this.redisClient = null;
    this.useRedis = false;

    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      // Only try to connect to Redis if explicitly enabled and Redis is available
      if (process.env.REDIS_HOST && process.env.REDIS_ENABLED === "true") {
        this.redisClient = redis.createClient({
          host: process.env.REDIS_HOST || "localhost",
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        });

        this.redisClient.on("error", (err) => {
          logger.error("Redis connection error:", err);
          this.useRedis = false;
        });

        this.redisClient.on("connect", () => {
          logger.info("Connected to Redis");
          this.useRedis = true;
        });

        await this.redisClient.connect();
      } else {
        logger.info("Redis disabled, using in-memory cache (node-cache)");
        this.useRedis = false;
      }
    } catch (error) {
      logger.warn(
        "Redis not available, falling back to node-cache:",
        error.message
      );
      this.useRedis = false;
    }
  }

  async get(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        return this.nodeCache.get(key) || null;
      }
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      } else {
        this.nodeCache.set(key, value, ttl);
      }
      return true;
    } catch (error) {
      logger.error("Cache set error:", error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.nodeCache.del(key);
      }
      return true;
    } catch (error) {
      logger.error("Cache delete error:", error);
      return false;
    }
  }

  async flush() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        this.nodeCache.flushAll();
      }
      return true;
    } catch (error) {
      logger.error("Cache flush error:", error);
      return false;
    }
  }

  generateKey(prefix, params) {
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");
    return `${prefix}:${paramString}`;
  }
}

module.exports = new CacheService();
