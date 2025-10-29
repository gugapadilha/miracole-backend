const jwtService = require('../services/jwtService');

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header is required'
      });
    }

    const decoded = jwtService.verifyToken(token);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not an access token'
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      hasActiveMembership: decoded.hasActiveMembership
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
};

/**
 * Optional authentication middleware
 * Verifies JWT token if present but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtService.verifyToken(token);
      
      if (decoded.type === 'access') {
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          hasActiveMembership: decoded.hasActiveMembership
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Membership validation middleware
 * Ensures user has active membership
 */
const requireMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated'
    });
  }

  if (!req.user.hasActiveMembership) {
    return res.status(403).json({
      error: 'Membership required',
      message: 'Active membership is required to access this resource'
    });
  }

  next();
};

/**
 * Admin role validation middleware
 * Ensures user has admin privileges
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated'
    });
  }

  // In a real implementation, you would check user roles
  // For now, we'll use a simple check
  if (req.user.username !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'Admin privileges are required to access this resource'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireMembership,
  requireAdmin
};
