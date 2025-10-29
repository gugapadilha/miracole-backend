const express = require('express');
const router = express.Router();

// Import services
const jwtService = require('../services/jwtService');
const wordpressService = require('../services/wordpressService');
const pmproService = require('../services/pmproService');

/**
 * GET /api/me
 * Get current user information with subscription status (Phase 1 requirement)
 */
router.get('/', async (req, res) => {
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

    // Get user profile (best-effort). If WP blocks the endpoint, fall back to minimal profile.
    const userProfile = await wordpressService.getUserProfile(decoded.userId);

    // Get membership information
    const membershipLevel = await pmproService.getMembershipLevel(decoded.userId);
    const membershipExpiration = await pmproService.getMembershipExpiration(decoded.userId);
    const hasActiveMembership = await pmproService.hasActiveMembership(decoded.userId);

    // Build Phase 1 response format
    res.json({
      subscribed: hasActiveMembership,
      subscription_level: membershipLevel || null,
      credits_balance: 0, // TODO: Implement credit system
      language: 'en', // TODO: Get from user preferences
      playlist_count: 0, // TODO: Count from database
      watchlist_count: 0, // TODO: Count from database
      parental_settings: { locked: false }, // TODO: Get from user settings
      profile: userProfile || { id: decoded.userId }
    });
  } catch (error) {
    console.error('Get /me error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
});

/**
 * GET /api/me/profile
 * Get current user's profile information
 */
router.get('/profile', async (req, res) => {
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

    // Get user profile
    const userProfile = await wordpressService.getUserProfile(decoded.userId);
    
    if (!userProfile) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Get membership information
    const membershipLevel = await pmproService.getMembershipLevel(decoded.userId);
    const membershipExpiration = await pmproService.getMembershipExpiration(decoded.userId);
    const hasActiveMembership = await pmproService.hasActiveMembership(decoded.userId);

    res.json({
      success: true,
      profile: {
        ...userProfile,
        membership: {
          level: membershipLevel,
          expiration: membershipExpiration,
          isActive: hasActiveMembership
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/me/profile
 * Update current user's profile
 */
router.put('/profile', async (req, res) => {
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

    const { firstName, lastName, displayName } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (displayName) updateData.display_name = displayName;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update',
        message: 'At least one field must be provided'
      });
    }

    const updatedProfile = await wordpressService.updateUserProfile(decoded.userId, updateData);

    if (!updatedProfile) {
      return res.status(500).json({
        error: 'Update failed',
        message: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/me/membership
 * Get current user's membership information
 */
router.get('/membership', async (req, res) => {
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

    // Get detailed membership information
    const memberInfo = await pmproService.getMemberInfo(decoded.userId);
    const membershipLevel = await pmproService.getMembershipLevel(decoded.userId);
    const membershipExpiration = await pmproService.getMembershipExpiration(decoded.userId);
    const hasActiveMembership = await pmproService.hasActiveMembership(decoded.userId);

    res.json({
      success: true,
      membership: {
        isActive: hasActiveMembership,
        level: membershipLevel,
        expiration: membershipExpiration,
        details: memberInfo
      }
    });
  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch membership information'
    });
  }
});

/**
 * GET /api/me/watch-history
 * Get user's video watch history
 */
router.get('/watch-history', async (req, res) => {
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

    const { page = 1, perPage = 20 } = req.query;

    // In a real implementation, you would fetch from database
    const watchHistory = [
      {
        videoId: 'video-1',
        title: 'Sample Video 1',
        thumbnail: 'https://example.com/thumb1.jpg',
        watchTime: 1200, // seconds
        progress: 0.8,
        watchedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        videoId: 'video-2',
        title: 'Sample Video 2',
        thumbnail: 'https://example.com/thumb2.jpg',
        watchTime: 600,
        progress: 0.3,
        watchedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    res.json({
      success: true,
      watchHistory,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
        total: watchHistory.length,
        totalPages: Math.ceil(watchHistory.length / perPage)
      }
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch watch history'
    });
  }
});

/**
 * GET /api/me/favorites
 * Get user's favorite videos
 */
router.get('/favorites', async (req, res) => {
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

    const { page = 1, perPage = 20 } = req.query;

    // In a real implementation, you would fetch from database
    const favorites = [
      {
        videoId: 'video-1',
        title: 'Favorite Video 1',
        thumbnail: 'https://example.com/thumb1.jpg',
        addedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        videoId: 'video-3',
        title: 'Favorite Video 3',
        thumbnail: 'https://example.com/thumb3.jpg',
        addedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    res.json({
      success: true,
      favorites,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
        total: favorites.length,
        totalPages: Math.ceil(favorites.length / perPage)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch favorites'
    });
  }
});

/**
 * POST /api/me/favorites/:videoId
 * Add video to favorites
 */
router.post('/favorites/:videoId', async (req, res) => {
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

    const { videoId } = req.params;

    // In a real implementation, you would save to database
    res.json({
      success: true,
      message: 'Video added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add favorite'
    });
  }
});

/**
 * DELETE /api/me/favorites/:videoId
 * Remove video from favorites
 */
router.delete('/favorites/:videoId', async (req, res) => {
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

    const { videoId } = req.params;

    // In a real implementation, you would remove from database
    res.json({
      success: true,
      message: 'Video removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove favorite'
    });
  }
});

module.exports = router;
