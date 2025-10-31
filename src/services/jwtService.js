const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');

class JWTService {
  constructor() {
    // Try to load from environment variables first (for Render deployment)
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
      // Handle both escaped newlines (\n) and actual newlines
      this.privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
      this.publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
      
      // Ensure proper line breaks are present
      if (!this.privateKey.includes('BEGIN PRIVATE KEY')) {
        console.error('⚠️  JWT_PRIVATE_KEY format may be incorrect');
      }
      if (!this.publicKey.includes('BEGIN PUBLIC KEY')) {
        console.error('⚠️  JWT_PUBLIC_KEY format may be incorrect');
      }
    } else {
      // Fallback: read from files (for local development)
      try {
        this.privateKey = fs.readFileSync(config.jwt.privateKeyPath, 'utf8');
        this.publicKey = fs.readFileSync(config.jwt.publicKeyPath, 'utf8');
      } catch (error) {
        console.error('❌ Failed to load JWT keys from files:', error.message);
        throw new Error('JWT keys not found. Please set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables or ensure key files exist.');
      }
    }

    this.algorithm = process.env.JWT_ALGORITHM || 'RS256';
    this.accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME || 3600;
    this.refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME || 7776000;
  }

  /**
   * Generate access token
   * @param {Object} payload - User data to include in token
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      this.privateKey,
      {
        algorithm: this.algorithm,
        expiresIn: this.accessTokenLifetime
      }
    );
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to include in token
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'refresh'
      },
      this.privateKey,
      {
        algorithm: this.algorithm,
        expiresIn: this.refreshTokenLifetime
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - User data to include in tokens
   * @returns {Object} Object containing access and refresh tokens
   */
  generateTokenPair(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm]
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JWTService();
