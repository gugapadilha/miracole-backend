#!/usr/bin/env node
/**
 * Complete Flow Test Script
 * Tests the full authentication and device linking flow
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://api.miracoleplus.com';
const WP_API_KEY = process.env.WP_API_KEY || 'miracole_secret_key_123';

// Test credentials (replace with real test user)
const TEST_USERNAME = process.env.TEST_USERNAME || 'test_user';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test_password';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testHealthCheck() {
  logInfo('Testing health endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      logSuccess('Health check passed');
      return true;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testPlansEndpoint() {
  logInfo('Testing /api/plans endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/plans`);
    if (response.status === 200 && response.data.success) {
      logSuccess(`Plans endpoint working (source: ${response.data.source})`);
      logInfo(`Found ${response.data.plans.length} plans`);
      return true;
    }
  } catch (error) {
    logError(`Plans endpoint failed: ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoint() {
  logInfo('Testing webhook /api/members/sync...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/members/sync`,
      {
        user_id: 123,
        username: 'test_user',
        email: 'test@example.com',
        level_id: 2,
        action: 'membership_change'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': WP_API_KEY
        }
      }
    );
    if (response.status === 200) {
      logSuccess('Webhook endpoint working');
      return true;
    }
  } catch (error) {
    logError(`Webhook endpoint failed: ${error.response?.status} ${error.message}`);
    return false;
  }
}

async function testLogin() {
  logInfo('Testing login endpoint...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      {
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status === 200 && response.data.access_token) {
      logSuccess('Login successful');
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    }
  } catch (error) {
    if (error.response?.status === 401) {
      logWarning('Login failed - invalid credentials (this is expected if test user doesn\'t exist)');
    } else {
      logError(`Login failed: ${error.response?.status} ${error.message}`);
    }
    return null;
  }
}

async function testMeEndpoint(accessToken) {
  logInfo('Testing /api/me endpoint...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    if (response.status === 200) {
      logSuccess('Me endpoint working');
      logInfo(`User subscribed: ${response.data.subscribed}`);
      return true;
    }
  } catch (error) {
    logError(`Me endpoint failed: ${error.response?.status} ${error.message}`);
    return false;
  }
}

async function testRefreshToken(refreshToken) {
  logInfo('Testing refresh token endpoint...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/refresh`,
      {
        refresh_token: refreshToken
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status === 200 && response.data.access_token) {
      logSuccess('Refresh token working (token rotated)');
      return response.data.access_token;
    }
  } catch (error) {
    logError(`Refresh token failed: ${error.response?.status} ${error.message}`);
    return null;
  }
}

async function testDeviceCode() {
  logInfo('Testing device code generation...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/device/code`,
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status === 200 && response.data.device_code) {
      logSuccess(`Device code generated: ${response.data.device_code}`);
      return response.data.device_code;
    }
  } catch (error) {
    logError(`Device code generation failed: ${error.response?.status} ${error.message}`);
    return null;
  }
}

async function testDevicePoll(deviceCode) {
  logInfo('Testing device poll...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/device/poll`,
      {
        params: { code: deviceCode }
      }
    );
    if (response.status === 200) {
      logSuccess(`Device poll working (activated: ${response.data.activated})`);
      return response.data.activated;
    }
  } catch (error) {
    logError(`Device poll failed: ${error.response?.status} ${error.message}`);
    return false;
  }
}

async function testDeviceConfirm(deviceCode, accessToken) {
  logInfo('Testing device confirm...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/device/confirm`,
      {
        deviceCode: deviceCode
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    if (response.status === 200 && response.data.activated) {
      logSuccess('Device confirmed successfully');
      return true;
    }
  } catch (error) {
    logError(`Device confirm failed: ${error.response?.status} ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Complete Flow Tests\n', colors.blue);

  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    logError('Health check failed - stopping tests');
    process.exit(1);
  }

  // Test 2: Plans Endpoint
  await testPlansEndpoint();

  // Test 3: Webhook Endpoint
  await testWebhookEndpoint();

  // Test 4: Login
  const tokens = await testLogin();
  if (!tokens) {
    logWarning('Skipping authenticated tests (login failed)');
    logWarning('Set TEST_USERNAME and TEST_PASSWORD environment variables to test authenticated endpoints');
  } else {
    // Test 5: Me Endpoint
    await testMeEndpoint(tokens.accessToken);

    // Test 6: Refresh Token
    const newAccessToken = await testRefreshToken(tokens.refreshToken);
    if (newAccessToken) {
      // Test 7: Me with new token
      await testMeEndpoint(newAccessToken);
    }

    // Test 8: Device Code
    const deviceCode = await testDeviceCode();
    if (deviceCode) {
      // Test 9: Device Poll (before confirmation)
      await testDevicePoll(deviceCode);

      // Test 10: Device Confirm
      await testDeviceConfirm(deviceCode, tokens.accessToken);

      // Test 11: Device Poll (after confirmation)
      await testDevicePoll(deviceCode);
    }
  }

  log('\n✨ Tests completed!\n', colors.green);
}

// Run tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});

