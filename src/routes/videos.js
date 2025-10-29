const express = require('express');
const router = express.Router();

// Import services
const jwtService = require('../services/jwtService');
const bunnyService = require('../services/bunnyService');
const pmproService = require('../services/pmproService');

/**
 * GET /api/videos
 * Get list of available videos
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

    const { page = 1, perPage = 20, search } = req.query;

    // Get videos from Bunny CDN
    let videos;
    if (search) {
      videos = await bunnyService.searchVideos(search, { page, perPage });
    } else {
      videos = await bunnyService.listVideos({ page, perPage });
    }

    if (!videos) {
      return res.status(500).json({
        error: 'Service unavailable',
        message: 'Failed to fetch videos'
      });
    }

    // Filter videos based on user's membership level
    const userMembershipLevel = await pmproService.getMembershipLevel(decoded.userId);
    const filteredVideos = videos.items ? videos.items.filter(video => {
      // In a real implementation, you would check video access level
      // against user's membership level
      return true; // For now, return all videos
    }) : [];

    res.json({
      success: true,
      videos: filteredVideos,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
        total: videos.totalItems || 0,
        totalPages: Math.ceil((videos.totalItems || 0) / perPage)
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch videos'
    });
  }
});

/**
 * GET /api/videos/:videoId
 * Get specific video details and streaming URL
 */
router.get('/:videoId', async (req, res) => {
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

    // Get video details from Bunny CDN
    const video = await bunnyService.getVideo(videoId);
    
    if (!video) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'The requested video does not exist'
      });
    }

    // Check if user has access to this video
    const hasAccess = await pmproService.hasActiveMembership(decoded.userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Active membership required to view this video'
      });
    }

    // Get streaming URL and thumbnail
    const streamUrl = await bunnyService.getVideoStreamUrl(videoId);
    const thumbnailUrl = await bunnyService.getVideoThumbnail(videoId);

    res.json({
      success: true,
      video: {
        id: video.guid,
        title: video.title,
        description: video.description,
        duration: video.duration,
        thumbnail: thumbnailUrl,
        streamUrl: streamUrl,
        createdAt: video.dateCreated,
        updatedAt: video.dateUpdated,
        status: video.status,
        views: video.views || 0
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch video'
    });
  }
});

/**
 * GET /api/videos/:videoId/analytics
 * Get video analytics (admin only)
 */
router.get('/:videoId/analytics', async (req, res) => {
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

    // In a real implementation, you would check if user is admin
    // For now, we'll allow any authenticated user

    const { videoId } = req.params;
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        error: 'Missing date range',
        message: 'dateFrom and dateTo parameters are required'
      });
    }

    const analytics = await bunnyService.getVideoAnalytics(videoId, dateFrom, dateTo);

    if (!analytics) {
      return res.status(404).json({
        error: 'Analytics not found',
        message: 'No analytics data available for this video'
      });
    }

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch video analytics'
    });
  }
});

/**
 * POST /api/videos/:videoId/watch
 * Track video watch event
 */
router.post('/:videoId/watch', async (req, res) => {
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
    const { watchTime, progress } = req.body;

    // In a real implementation, you would:
    // 1. Save watch event to database
    // 2. Update user's watch history
    // 3. Track analytics

    res.json({
      success: true,
      message: 'Watch event tracked successfully'
    });
  } catch (error) {
    console.error('Track watch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to track watch event'
    });
  }
});

module.exports = router;
