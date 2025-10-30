require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'miracole_api',
    charset: 'utf8mb4'
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS || undefined
  },

  // JWT configuration
  jwt: {
    privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || './keys/jwt_private.pem',
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/jwt_public.pem',
    accessTokenLifetime: parseInt(process.env.ACCESS_TOKEN_LIFETIME) || 3600, // 60 minutes
    refreshTokenLifetime: parseInt(process.env.REFRESH_TOKEN_LIFETIME) || 7776000, // 90 days
    algorithm: 'RS256'
  },

  // Bunny CDN configuration
  bunny: {
    readKey: process.env.BUNNY_READ_KEY || '',
    libraryName: process.env.BUNNY_LIBRARY_NAME || 'miracoleplus-library',
    zoneName: process.env.BUNNY_ZONE_NAME || ''
  },

  // WordPress configuration
  wordpress: {
    baseUrl: process.env.WORDPRESS_BASE_URL || process.env.WP_BASE_URL || 'https://miracoleplus.com',
    apiKey: process.env.WP_API_KEY || ''
  },

  // Public base URL for this API (staging/production)
  baseUrl: process.env.BASE_URL || '',

  // Stripe configuration
  stripe: {
    testSecretKey: process.env.STRIPE_TEST_SK || 'sk_test_xxx'
  },

  // Rate limiting configuration
  rateLimit: {
    devicePerHour: parseInt(process.env.RATE_LIMIT_DEVICE_PER_HOUR) || 7,
    loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 7,
    loginLockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES) || 30
  }
};

module.exports = config;
