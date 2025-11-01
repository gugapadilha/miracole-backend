require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = 'https://miracole-backend.onrender.com';
const WP_API_KEY = process.env.WP_API_KEY || 'miracole_secret_key_123';

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...\n');
  console.log(`URL: ${BACKEND_URL}/health\n`);

  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000
    });

    console.log('✅ Health endpoint is working!\n');
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    // Check if status is "ok" (lowercase)
    if (response.data.status === 'ok' || response.data.status === 'OK') {
      console.log('\n✅ Status is correct!');
      return true;
    } else {
      console.log('\n⚠️  Status format is different than expected');
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint test failed!\n');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.log('No response received - backend may be down or unreachable');
    } else {
      console.log(`Error: ${error.message}`);
    }
    
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Webhook Endpoint (/api/members/sync)\n');
  console.log(`URL: ${BACKEND_URL}/api/members/sync\n`);

  const testData = {
    user_id: 123,
    username: 'test_user',
    email: 'test@example.com',
    level_id: 2,
    level_name: 'Monthly',
    old_level_id: 1,
    action: 'membership_change'
  };

  try {
    // Try with X-API-KEY first (as recommended by GPT-5)
    const response = await axios.post(
      `${BACKEND_URL}/api/members/sync`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': WP_API_KEY,
          'Authorization': `Bearer ${WP_API_KEY}` // Also send Bearer for compatibility
        },
        timeout: 10000
      }
    );

    console.log('✅ Webhook endpoint is working!\n');
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    console.log('\n✅ Backend received the webhook successfully!');
    console.log('   Check backend logs for: [WP_SYNC] Received membership update from WordPress');
    
    return true;
  } catch (error) {
    console.log('❌ Webhook endpoint test failed!\n');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n⚠️  401 Unauthorized - API key is incorrect');
        console.log(`   Expected key: ${WP_API_KEY.substring(0, 20)}...`);
        console.log('   Make sure WP_API_KEY in Render matches this key');
      }
    } else if (error.request) {
      console.log('No response received - backend may be down');
    } else {
      console.log(`Error: ${error.message}`);
    }
    
    return false;
  }
}

async function testAlternativeWebhookEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Alternative Webhook Endpoint (/api/members/webhooks/membership)\n');
  console.log(`URL: ${BACKEND_URL}/api/members/webhooks/membership\n`);

  const testData = {
    user_id: 456,
    username: 'test_user2',
    email: 'test2@example.com',
    level_id: 3,
    level_name: 'Yearly',
    old_level_id: 2,
    action: 'membership_change'
  };

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/members/webhooks/membership`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': WP_API_KEY,
          'Authorization': `Bearer ${WP_API_KEY}`
        },
        timeout: 10000
      }
    );

    console.log('✅ Alternative webhook endpoint is working!\n');
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.log('⚠️  Alternative webhook endpoint:', error.response?.status || error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('WordPress Integration Test');
  console.log('='.repeat(60) + '\n');

  const healthOk = await testHealthEndpoint();
  const webhookOk = await testWebhookEndpoint();
  const altWebhookOk = await testAlternativeWebhookEndpoint();

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  
  console.log(`Health Endpoint: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Webhook (/api/members/sync): ${webhookOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Alternative Webhook (/api/webhooks/membership): ${altWebhookOk ? '✅ PASS' : '⚠️  Not working'}`);

  if (healthOk && webhookOk) {
    console.log('\n🎉 All critical endpoints are working!');
    console.log('✅ WordPress plugin can now sync membership data to backend');
    process.exit(0);
  } else {
    console.log('\n💥 Some endpoints are not working');
    console.log('   Fix the issues above before deploying');
    process.exit(1);
  }
}

runTests().catch(console.error);

