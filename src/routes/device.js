const express = require('express');
const router = express.Router();
const jwtService = require('../services/jwtService');
const db = require('../db/knex');
const { deviceCodeRateLimit } = require('../middlewares/rateLimit');
const { generateDeviceCode } = require('../utils/deviceCodeGenerator');

// Cleanup helper: remove expired device codes
async function cleanupExpiredDeviceCodes() {
  try {
    await db('devices')
      .whereNotNull('expires_at')
      .andWhere('expires_at', '<', new Date())
      .del();
  } catch (err) {
    console.error('Failed to cleanup expired device codes:', err.message);
  }
}

// Note: legacy stub endpoints removed

/**
 * POST /api/device/code
 * Generate an 8-char device linking code (Roku)
 */
router.post('/code', deviceCodeRateLimit, async (req, res) => {
  try {
    await cleanupExpiredDeviceCodes();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    let deviceCode;
    let attempts = 0;
    while (attempts < 5) {
      attempts += 1;
      deviceCode = generateDeviceCode(8);
      const existing = await db('devices').where({ device_code: deviceCode }).first();
      if (!existing) break;
    }

    if (!deviceCode) {
      return res.status(500).json({
        error: 'Generation failed',
        message: 'Could not generate device code'
      });
    }

    await db('devices').insert({
      device_code: deviceCode,
      user_id: null,
      linked: false,
      expires_at: expiresAt
    });

    console.log(`Device code created: ${deviceCode} (expires in 15m)`);

    res.json({
      success: true,
      device_code: deviceCode,
      expires_in: 900
    });
  } catch (error) {
    console.error('Device code generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate device code'
    });
  }
});

/**
 * POST /api/device/poll
 * Poll for device activation status
 */
router.post('/poll', async (req, res) => {
  try {
    await cleanupExpiredDeviceCodes();

    const code = req.body.deviceCode || req.body.device_code || req.query.code || req.query.deviceCode;
    if (!code) {
      return res.status(400).json({
        error: 'Missing device code',
        message: 'Device code is required'
      });
    }

    const record = await db('devices')
      .where({ device_code: code })
      .andWhere(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (!record) {
      return res.json({ success: true, activated: false });
    }

    if (record.linked) {
      return res.json({ success: true, activated: true, user_id: record.user_id });
    }

    res.json({ success: true, activated: false });
  } catch (error) {
    console.error('Device poll error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to poll device status'
    });
  }
});

// Also support GET for polling with query param (?code=AB12CD34)
router.get('/poll', async (req, res) => {
  try {
    await cleanupExpiredDeviceCodes();

    const code = req.query.code || req.query.deviceCode;
    if (!code) {
      return res.status(400).json({
        error: 'Missing device code',
        message: 'Device code is required'
      });
    }

    const record = await db('devices')
      .where({ device_code: code })
      .andWhere(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (!record) {
      return res.json({ success: true, activated: false });
    }

    if (record.linked) {
      return res.json({ success: true, activated: true, user_id: record.user_id });
    }

    res.json({ success: true, activated: false });
  } catch (error) {
    console.error('Device poll error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to poll device status'
    });
  }
});

/**
 * POST /api/device/confirm
 * Authenticated user confirms a device code
 */
router.post('/confirm', async (req, res) => {
  try {
    await cleanupExpiredDeviceCodes();

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

    const code = req.body.deviceCode || req.body.device_code || req.query.code || req.query.deviceCode;
    if (!code) {
      return res.status(400).json({
        error: 'Missing device code',
        message: 'Device code is required'
      });
    }

    const record = await db('devices')
      .where({ device_code: code })
      .andWhere(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (!record) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Device code not found or expired'
      });
    }

    if (record.linked) {
      return res.json({ success: true, activated: true, user_id: record.user_id });
    }

    await db('devices')
      .where({ id: record.id })
      .update({ linked: true, user_id: decoded.userId, updated_at: db.fn.now() });

    console.log(`Device code confirmed: ${code} by user ${decoded.userId}`);

    res.json({ success: true, activated: true, user_id: decoded.userId });
  } catch (error) {
    console.error('Device confirm error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Device confirmation failed'
    });
  }
});

// Keep placeholders for future device management endpoints if needed

// DELETE /api/device/:deviceId reserved for Phase 2

module.exports = router;
