const express = require('express');
const router = express.Router();

// Import services
const jwtService = require('../services/jwtService');
const wordpressService = require('../services/wordpressService');
const pmproService = require('../services/pmproService');
const { loginRateLimit } = require('../middlewares/rateLimit');

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

    // Authenticate with WordPress
    const authResult = await wordpressService.authenticateUser(username, password);
    
    if (!authResult || !authResult.token) {
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
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

    // Verify refresh token
    const decoded = jwtService.verifyToken(refresh_token);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not a refresh token'
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
      // Verify the refresh token to get user info
      try {
        const decoded = jwtService.verifyToken(refresh_token);
        
        if (decoded.type === 'refresh') {
          // TODO: Add refresh token to blacklist in Redis
          // For now, we'll just return success
          // In production, you'd store the token hash in Redis
          // and check against it during token validation
        }
      } catch (error) {
        // Token is invalid, but we still want to return success
        // to avoid revealing whether the token was valid or not
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
