const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit"); // Best practice to use named export here too
const { RedisStore } = require("rate-limit-redis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  // Add these two lines:
  maxRetriesPerRequest: null, 
  retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
});

// Always add an error listener to prevent unhandled exceptions
redisClient.on("error", (err) => {
  console.warn("Redis is currently unavailable. Retrying...", err.message);
});

const authLimiter = rateLimit({
  store: new RedisStore({
    // Use call for ioredis compatibility
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 5 * 60 * 1000, 
  max: 3,
  standardHeaders: true, // Recommended: sends RateLimit-* headers
  legacyHeaders: false,   // Recommended: disables X-RateLimit-* headers
  message: "Too many requests from this IP, please try again after 5 minute",
});

module.exports = authLimiter;