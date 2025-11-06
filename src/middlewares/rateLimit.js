const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const redis = require('redis');
const config = require('../config');

// Redis client for rate limiting
let redisClient;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      socket: {
        connectTimeout: 2000, // 2 seconds timeout
        reconnectStrategy: false // Don't auto-reconnect
      }
    });

    // Add timeout to connection attempt
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Redis connected for rate limiting');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    // Fallback to memory-based rate limiting
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch (e) {
        // Ignore quit errors
      }
    }
    redisClient = null;
  }
};

// Initialize Redis connection
initRedis();

// Helper: in development, disable specific limiters
const isProduction = config.nodeEnv === 'production';
const noop = (req, res, next) => next();

// Rate limiters
const loginLimiter = redisClient
  ? new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'login_limit',
      points: config.rateLimit.loginMaxAttempts,
      duration: config.rateLimit.loginLockMinutes * 60,
      blockDuration: config.rateLimit.loginLockMinutes * 60,
    })
  : new RateLimiterMemory({
      keyPrefix: 'login_limit',
      points: config.rateLimit.loginMaxAttempts,
      duration: config.rateLimit.loginLockMinutes * 60,
    });

const deviceCodeLimiter = redisClient
  ? new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'device_code_limit',
      points: config.nodeEnv === 'production' ? config.rateLimit.devicePerHour : 1000,
      duration: 3600,
      blockDuration: 3600,
    })
  : new RateLimiterMemory({
      keyPrefix: 'device_code_limit',
      points: config.nodeEnv === 'production' ? config.rateLimit.devicePerHour : 1000,
      duration: 3600,
    });

const generalLimiter = redisClient 
  ? new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'general_limit',
      points: config.nodeEnv === 'production' ? 1000 : 100000, // more generous in dev
      duration: 3600, // Per hour
      blockDuration: 3600, // Block for 1 hour
    })
  : new RateLimiterMemory({
      keyPrefix: 'general_limit',
      points: config.nodeEnv === 'production' ? 1000 : 100000, // more generous in dev
      duration: 3600, // Per hour
    });

/**
 * Generic rate limiting middleware
 */
const rateLimit = (limiter, keyGenerator) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: secs
      });
    }
  };
};

/**
 * Login rate limiting middleware
 */
const loginRateLimit = isProduction
  ? rateLimit(loginLimiter, (req) => {
      // Use IP address for login attempts
      return req.ip || req.connection.remoteAddress;
    })
  : noop;

/**
 * Device code rate limiting middleware
 */
const deviceCodeRateLimit = isProduction
  ? rateLimit(deviceCodeLimiter, (req) => {
      // Use user ID if authenticated, otherwise IP
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const jwtService = require('../services/jwtService');
          const token = jwtService.extractTokenFromHeader(authHeader);
          if (token) {
            const decoded = jwtService.verifyToken(token);
            return `user_${decoded.userId}`;
          }
        } catch (error) {
          // Fall back to IP if token is invalid
        }
      }
      return req.ip || req.connection.remoteAddress;
    })
  : noop;

/**
 * General API rate limiting middleware (with whitelist)
 */
const generalRateLimitInner = rateLimit(generalLimiter, (req) => {
  // Use user ID if authenticated, otherwise IP
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const jwtService = require('../services/jwtService');
      const token = jwtService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = jwtService.verifyToken(token);
        return `user_${decoded.userId}`;
      }
    } catch (error) {
      // Fall back to IP if token is invalid
    }
  }
  return req.ip || req.connection.remoteAddress;
});

const WHITELIST_PATHS = new Set([
  '/api/device/poll'
]);

const generalRateLimit = (req, res, next) => {
  if (WHITELIST_PATHS.has(req.path)) {
    return next();
  }
  return generalRateLimitInner(req, res, next);
};

/**
 * Reset rate limit for a specific key
 */
const resetRateLimit = async (limiter, key) => {
  try {
    await limiter.delete(key);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
};

/**
 * Get rate limit info for a specific key
 */
const getRateLimitInfo = async (limiter, key) => {
  try {
    const res = await limiter.get(key);
    return {
      remainingPoints: res ? res.remainingPoints : limiter.points,
      msBeforeNext: res ? res.msBeforeNext : 0,
      totalHits: res ? res.totalHits : 0
    };
  } catch (error) {
    console.error('Failed to get rate limit info:', error);
    return null;
  }
};

module.exports = {
  loginRateLimit,
  deviceCodeRateLimit,
  generalRateLimit,
  resetRateLimit,
  getRateLimitInfo
};
