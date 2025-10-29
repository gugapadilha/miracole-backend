const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');

class JWTService {
  constructor() {
    this.privateKey = fs.readFileSync(config.jwt.privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(config.jwt.publicKeyPath, 'utf8');
    this.algorithm = config.jwt.algorithm;
    this.accessTokenLifetime = config.jwt.accessTokenLifetime;
    this.refreshTokenLifetime = config.jwt.refreshTokenLifetime;
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
