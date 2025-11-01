const express = require('express');
const config = require('../config');
const router = express.Router();

// Middleware to validate WordPress API key
// Accepts both X-API-KEY header and Authorization Bearer token
function validateWPAPIKey(req, res, next) {
  // Get expected key from environment (remove quotes if present, trim whitespace)
  const envKey = (config.wordpress.apiKey || '').replace(/"/g, '').trim();
  
  // Get provided key from headers (try X-API-KEY first, then Authorization Bearer)
  const headerApiKey = req.get('X-API-KEY') || req.get('x-api-key');
  const authHeader = req.headers.authorization || req.get('authorization');
  const bearerKey = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;
  
  const providedKey = (headerApiKey || bearerKey || '').trim();

  if (!envKey) {
    console.warn('[WP_SYNC] WP_API_KEY not configured on server');
    return res.status(500).json({
      error: 'server_error',
      message: 'WP_API_KEY not configured on server'
    });
  }

  if (!providedKey || providedKey !== envKey) {
    console.warn('[WP_SYNC] Invalid or missing API key. Expected:', envKey.substring(0, 10) + '..., Got:', providedKey ? providedKey.substring(0, 10) + '...' : 'null');
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  next();
}

/**
 * POST /api/members/sync
 * Webhook endpoint to receive membership updates from WordPress
 */
router.post('/sync', validateWPAPIKey, async (req, res) => {
  try {
    const {
      user_id,
      username,
      email,
      level_id,
      level_name,
      old_level_id,
      action
    } = req.body;

    console.log('[WP_SYNC] Received membership update from WordPress');
    console.log('[WP_SYNC] Data:', {
      user_id,
      username,
      email,
      level_id,
      level_name,
      old_level_id,
      action
    });

    // Validate required fields
    if (!user_id || !action) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'user_id and action are required'
      });
    }

    // TODO: Here you would:
    // 1. Update user in database
    // 2. Sync membership level
    // 3. Update device access permissions
    // 4. Send notifications if needed

    // For now, just acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Membership sync received',
      data: {
        user_id,
        level_id,
        action,
        synced_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[WP_SYNC] Error processing membership sync:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process membership sync'
    });
  }
});

/**
 * POST /api/members/webhooks/membership
 * Alternative webhook endpoint (same handler as /sync)
 */
router.post('/webhooks/membership', validateWPAPIKey, async (req, res) => {
  // Use the same logic as /sync endpoint
  try {
    const {
      user_id,
      username,
      email,
      level_id,
      level_name,
      old_level_id,
      action
    } = req.body;

    console.log('[WP_SYNC] Received membership update from WordPress (webhook endpoint)');
    console.log('[WP_SYNC] Data:', {
      user_id,
      username,
      email,
      level_id,
      level_name,
      old_level_id,
      action
    });

    // Validate required fields
    if (!user_id || !action) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'user_id and action are required'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membership sync received',
      data: {
        user_id,
        level_id,
        action,
        synced_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[WP_SYNC] Error processing membership sync:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process membership sync'
    });
  }
});

/**
 * GET /api/members/:userId
 * Get membership information for a specific user
 */
router.get('/:userId', validateWPAPIKey, async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch user membership from database
    // For now, return a placeholder response

    res.json({
      success: true,
      user_id: userId,
      membership: {
        level_id: null,
        level_name: null,
        status: 'unknown'
      }
    });
  } catch (error) {
    console.error('[WP_SYNC] Error fetching user membership:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user membership'
    });
  }
});

module.exports = router;

