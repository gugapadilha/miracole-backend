const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import services
const jwtService = require('../services/jwtService');
const { deviceCodeRateLimit } = require('../middlewares/rateLimit');

/**
 * POST /api/device/register
 * Register a new device for the user
 */
router.post('/register', async (req, res) => {
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

    const { deviceName, deviceType, deviceId } = req.body;

    if (!deviceName || !deviceType) {
      return res.status(400).json({
        error: 'Missing device information',
        message: 'Device name and type are required'
      });
    }

    // Generate device code
    const deviceCode = uuidv4();
    
    // In a real implementation, you would save this to the database
    // For now, we'll just return the device code
    const deviceData = {
      id: deviceId || uuidv4(),
      userId: decoded.userId,
      deviceName,
      deviceType,
      deviceCode,
      registeredAt: new Date().toISOString(),
      isActive: true
    };

    res.status(201).json({
      success: true,
      device: deviceData,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Device registration failed'
    });
  }
});

/**
 * POST /api/device/code
 * Generate device activation code
 */
router.post('/code', deviceCodeRateLimit, async (req, res) => {
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

    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        error: 'Missing device ID',
        message: 'Device ID is required'
      });
    }

    // Generate activation code (6 digits)
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real implementation, you would:
    // 1. Save the activation code to database with expiration
    // 2. Send it via SMS or email
    // 3. Implement rate limiting
    
    res.json({
      success: true,
      activationCode,
      expiresIn: 300, // 5 minutes
      message: 'Activation code generated successfully'
    });
  } catch (error) {
    console.error('Device code generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate activation code'
    });
  }
});

/**
 * POST /api/device/poll
 * Poll for device activation status (Phase 1 requirement)
 */
router.post('/poll', async (req, res) => {
  try {
    const { deviceCode } = req.body;

    if (!deviceCode) {
      return res.status(400).json({
        error: 'Missing device code',
        message: 'Device code is required'
      });
    }

    // In a real implementation, you would:
    // 1. Check if device code exists in database
    // 2. Check if it has been confirmed by user
    // 3. Return activation status
    
    res.json({
      success: true,
      activated: false,
      message: 'Device not yet activated'
    });
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
 * Confirm device activation (Phase 1 requirement)
 */
router.post('/confirm', async (req, res) => {
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

    const { deviceCode } = req.body;

    if (!deviceCode) {
      return res.status(400).json({
        error: 'Missing device code',
        message: 'Device code is required'
      });
    }

    // In a real implementation, you would:
    // 1. Verify the device code
    // 2. Link device to user
    // 3. Mark device as confirmed
    
    res.json({
      success: true,
      message: 'Device confirmed successfully'
    });
  } catch (error) {
    console.error('Device confirm error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Device confirmation failed'
    });
  }
});

/**
 * GET /api/device/list
 * Get user's registered devices
 */
router.get('/list', async (req, res) => {
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

    // In a real implementation, you would fetch devices from database
    const devices = [
      {
        id: 'device-1',
        deviceName: 'iPhone 15',
        deviceType: 'mobile',
        isActive: true,
        lastSeen: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'device-2',
        deviceName: 'MacBook Pro',
        deviceType: 'desktop',
        isActive: false,
        lastSeen: new Date(Date.now() - 172800000).toISOString(),
        registeredAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    res.json({
      success: true,
      devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch devices'
    });
  }
});

/**
 * DELETE /api/device/:deviceId
 * Remove a registered device
 */
router.delete('/:deviceId', async (req, res) => {
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

    const { deviceId } = req.params;

    // In a real implementation, you would:
    // 1. Verify device belongs to user
    // 2. Remove device from database
    // 3. Invalidate device tokens

    res.json({
      success: true,
      message: 'Device removed successfully'
    });
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove device'
    });
  }
});

module.exports = router;
