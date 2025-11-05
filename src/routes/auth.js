const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/knex');

// Import services
const jwtService = require('../services/jwtService');
const wordpressService = require('../services/wordpressService');
const pmproService = require('../services/pmproService');
const { loginRateLimit } = require('../middlewares/rateLimit');
const lockout = require('../utils/loginLockout');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function persistRefreshToken(userId, token) {
  const expiresAt = jwtService.getTokenExpiration(token);
  await db('refresh_tokens').insert({
    user_id: userId,
    token: hashToken(token),
    expires_at: expiresAt,
    revoked: false
  });
}

async function revokeRefreshTokenByHash(tokenHash) {
  await db('refresh_tokens')
    .where({ token: tokenHash, revoked: false })
    .update({ revoked: true });
}

async function isRefreshTokenValid(token) {
  const tokenHash = hashToken(token);
  const row = await db('refresh_tokens')
    .where({ token: tokenHash, revoked: false })
    .andWhere('expires_at', '>', new Date())
    .first();
  return { valid: !!row, row, tokenHash };
}

/**
 * POST /api/auth/login
 * Authenticate user with WordPress credentials
 */
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    // Username-based lockout check
    const lock = await lockout.isLocked(username, 7);
    if (lock.locked) {
      res.set('Retry-After', String(lock.retryAfter || 1));
      return res.status(429).json({
        error: 'Too Many Attempts',
        message: 'Account temporarily locked due to failed attempts. Try again later.',
        retryAfter: lock.retryAfter || 1
      });
    }

    // Authenticate with WordPress
    const authResult = await wordpressService.authenticateUser(username, password);
    
    if (!authResult || !authResult.token) {
      try { await lockout.recordFailure(username, 30 * 60); } catch (lfErr) { /* noop */ }
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Get user info from WordPress using the token
    const user = await wordpressService.getUserFromToken(authResult.token);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Unable to retrieve user information'
      });
    }
    
    // Check if user has active membership
    const hasActiveMembership = await pmproService.hasActiveMembership(user.id);
    
    // Generate our own JWT tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      hasActiveMembership
    };
    
    const tokens = jwtService.generateTokenPair(tokenPayload);
    try {
      await persistRefreshToken(user.id, tokens.refreshToken);
    } catch (persistErr) {
      console.error('Failed to persist refresh token:', persistErr.message);
    }
    try { await lockout.reset(username); } catch (rstErr) { /* noop */ }

    res.json({
      success: true,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: 3600,
      user: {
        email: user.email,
        name: user.display_name,
        subscription: hasActiveMembership ? 'premium' : 'free'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed',
      details: isDev ? error.message : undefined,
      stack: isDev ? error.stack : undefined
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token signature and type
    const decoded = jwtService.verifyToken(refresh_token);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not a refresh token'
      });
    }

    // Check revocation/expiration in DB
    const validity = await isRefreshTokenValid(refresh_token);
    if (!validity.valid) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Token is revoked or expired'
      });
    }

    // Get updated user info
    const user = await wordpressService.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Check membership status
    const hasActiveMembership = await pmproService.hasActiveMembership(user.id);

    // Generate new tokens (rotate refresh token)
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      hasActiveMembership
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    try {
      // Rotate tokens: persist new token and revoke old
      await persistRefreshToken(user.id, tokens.refreshToken);
      await revokeRefreshTokenByHash(validity.tokenHash);
    } catch (rotErr) {
      console.error('Refresh token rotation error:', rotErr.message);
    }

    res.json({
      success: true,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: 3600
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Token is invalid or expired'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and revoke refresh token
 */
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      try {
        const decoded = jwtService.verifyToken(refresh_token);
        if (decoded.type === 'refresh') {
          const tokenHash = hashToken(refresh_token);
          await revokeRefreshTokenByHash(tokenHash);
        }
      } catch (e) {
        // Ignore verification errors; still return success
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Logout failed'
    });
  }
});

module.exports = router;
