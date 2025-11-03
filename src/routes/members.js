const express = require('express');
const router = express.Router();

// Throttling: prevent duplicate requests within short time window
const requestThrottle = new Map();
const THROTTLE_WINDOW = 5000; // 5 seconds

function throttleRequest(req, res, next) {
  const payload = req.body || {};
  const throttleKey = `sync_${payload.user_id}_${payload.level_id}_${payload.action}`;
  
  const lastRequest = requestThrottle.get(throttleKey);
  const now = Date.now();
  
  if (lastRequest && (now - lastRequest) < THROTTLE_WINDOW) {
    console.log('[WP_SYNC] Throttled duplicate request - User ID:', payload.user_id);
    return res.status(200).json({ 
      success: true, 
      message: 'Request throttled (duplicate)', 
      cached: true 
    });
  }
  
  requestThrottle.set(throttleKey, now);
  
  // Clean old entries periodically
  if (requestThrottle.size > 1000) {
    const cutoff = now - THROTTLE_WINDOW * 10;
    for (const [key, timestamp] of requestThrottle.entries()) {
      if (timestamp < cutoff) {
        requestThrottle.delete(key);
      }
    }
  }
  
  next();
}

// Middleware: valida WP API key (vindo do header X-API-KEY ou Authorization Bearer)
function validateWPAPIKey(req, res, next) {
  const envKey = (process.env.WP_API_KEY || '').replace(/"/g, '').trim();
  const headerKey = (req.get('X-API-KEY') || req.get('x-api-key') || (req.get('authorization') || '').replace(/^Bearer\s+/i, '')).trim();

  if (!envKey) {
    return res.status(500).json({ error: 'server_error', message: 'WP_API_KEY not configured on server' });
  }

  if (!headerKey || headerKey !== envKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing API key' });
  }

  next();
}

// Handler function to reuse
async function handleSync(req, res) {
  try {
    const payload = req.body || {};
    
    // Fast response to prevent blocking
    res.json({ success: true, message: 'Membership sync received', payload });
    
    // Log asynchronously to avoid blocking
    setImmediate(() => {
      console.log('[WP_SYNC] Received payload from WP:', {
        user_id: payload.user_id,
        level_id: payload.level_id,
        action: payload.action,
        timestamp: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('[WP_SYNC] error', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to process membership sync' });
  }
}

// POST /api/members/sync (with throttling to prevent duplicate requests)
router.post('/sync', validateWPAPIKey, throttleRequest, handleSync);

// Alias endpoint (compatível com plugin antigo)
router.post('/webhooks/membership', validateWPAPIKey, throttleRequest, handleSync);


module.exports = router;

