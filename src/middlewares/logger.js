const winston = require('winston');
const config = require('../config');

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'miracole-backend' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  next(err);
};

/**
 * Security event logging
 */
const securityLogger = {
  loginAttempt: (ip, username, success, reason = null) => {
    logger.warn('Login attempt', {
      event: 'login_attempt',
      ip,
      username,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  rateLimitExceeded: (ip, endpoint, limit) => {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString()
    });
  },

  suspiciousActivity: (ip, activity, details) => {
    logger.error('Suspicious activity detected', {
      event: 'suspicious_activity',
      ip,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },

  tokenValidation: (ip, success, reason = null) => {
    logger.info('Token validation', {
      event: 'token_validation',
      ip,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Business event logging
 */
const businessLogger = {
  videoAccess: (userId, videoId, success, reason = null) => {
    logger.info('Video access', {
      event: 'video_access',
      userId,
      videoId,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  membershipCheck: (userId, success, level) => {
    logger.info('Membership check', {
      event: 'membership_check',
      userId,
      success,
      level,
      timestamp: new Date().toISOString()
    });
  },

  deviceRegistration: (userId, deviceId, deviceType) => {
    logger.info('Device registration', {
      event: 'device_registration',
      userId,
      deviceId,
      deviceType,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  businessLogger
};
