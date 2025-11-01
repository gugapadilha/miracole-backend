require('dotenv').config();
const axios = require('axios');

const config = {
  wordpress: {
    baseUrl: process.env.WORDPRESS_BASE_URL || process.env.WP_BASE_URL || 'https://miracoleplus.com',
    apiKey: process.env.WP_API_KEY || ''
  }
};

// Get backend URL from command line or env
const backendUrl = process.argv[2] || process.env.BACKEND_URL || '';

async function testBackendEndpoint(backendUrl) {
  console.log('🔍 Testing Backend Endpoint...\n');
  console.log(`Backend URL: ${backendUrl}\n`);
  
  const url = `${backendUrl}/api/plans`;
  
  console.log(`📡 Testing endpoint: ${url}\n`);

  try {
    const response = await axios.get(url, { 
      timeout: 15000 // 15 seconds timeout
    });

    console.log('✅ SUCCESS! Backend endpoint is working!\n');
    console.log(`   Status Code: ${response.status}`);
    console.log(`   Source: ${response.data.source || 'unknown'}`);
    console.log(`   Response Data:\n`);
    
    if (response.data.plans && Array.isArray(response.data.plans)) {
      console.log(`   Found ${response.data.plans.length} plans:`);
      response.data.plans.forEach((plan, index) => {
        console.log(`     ${index + 1}. ID: ${plan.id || 'N/A'}, Name: ${plan.name || 'N/A'}`);
      });
    } else {
      console.log(`   ${JSON.stringify(response.data, null, 2)}`);
    }

    // Check if it's using fallback or WordPress
    if (response.data.source === 'fallback') {
      console.log('\n   ⚠️  WARNING: Backend is using fallback data, not WordPress!');
      console.log('   → This means the WordPress connection failed and the backend fell back to static data');
      console.log('   → Check the WordPress connection directly');
    } else if (response.data.source === 'wordpress') {
      console.log('\n   ✅ Backend successfully connected to WordPress!');
    }

    return {
      success: true,
      status: response.status,
      data: response.data,
      source: response.data.source
    };
  } catch (error) {
    console.log('❌ ERROR! Backend endpoint test failed!\n');
    
    if (error.response) {
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Status Text: ${error.response.statusText}`);
      console.log(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      
      return {
        success: false,
        status: error.response.status,
        error: error.response.data
      };
    } else if (error.request) {
      console.log(`   Error: No response received from server`);
      console.log(`   → Check if the backend URL is correct: ${backendUrl}`);
      console.log(`   → Verify the backend service is running on Render`);
      
      return {
        success: false,
        error: 'No response from server'
      };
    } else {
      console.log(`   Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

async function testWordPressConnection() {
  console.log('🔍 Testing WordPress Connection...\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${config.wordpress.baseUrl}`);
  console.log(`  API Key: ${config.wordpress.apiKey ? '✅ Set (' + config.wordpress.apiKey.substring(0, 10) + '...)' : '❌ Not set'}\n`);

  const url = `${config.wordpress.baseUrl}/wp-json/pmpro/v1/levels`;
  const headers = config.wordpress.apiKey
    ? { Authorization: `Bearer ${config.wordpress.apiKey}` }
    : {};

  console.log(`📡 Testing endpoint: ${url}`);
  console.log(`   Headers: ${JSON.stringify(headers)}\n`);

  try {
    const response = await axios.get(url, { 
      headers,
      timeout: 10000 // 10 seconds timeout
    });

    console.log('✅ SUCCESS! Connection to WordPress is working!\n');
    console.log(`   Status Code: ${response.status}`);
    console.log(`   Response Data:`);
    
    if (Array.isArray(response.data)) {
      console.log(`   Found ${response.data.length} PMPro levels:`);
      response.data.forEach((level, index) => {
        console.log(`     ${index + 1}. ID: ${level.id || level.level_id || 'N/A'}, Name: ${level.name || level.level_name || 'N/A'}`);
      });
    } else {
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }

    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.log('❌ ERROR! Connection to WordPress failed!\n');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Status Text: ${error.response.statusText}`);
      console.log(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('\n   ⚠️  This is a 401/403 error - problem with the API token/authentication');
        console.log('   → Check if WP_API_KEY is correct in your .env file');
        console.log('   → Verify the API key has proper permissions in WordPress');
      } else if (error.response.status === 404) {
        console.log('\n   ⚠️  This is a 404 error - the endpoint does not exist');
        console.log('   → Check if PMPro plugin is installed and active');
        console.log('   → Verify the REST API endpoint is available at: /wp-json/pmpro/v1/levels');
      }
      
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
        message: `HTTP ${error.response.status}: ${error.response.statusText}`
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`   Error: No response received from server`);
      console.log(`   This usually means:`);
      console.log(`   → The WordPress site is down or unreachable`);
      console.log(`   → There's a network connectivity issue`);
      console.log(`   → The base URL (${config.wordpress.baseUrl}) is incorrect`);
      
      return {
        success: false,
        error: 'No response from server',
        message: 'Network error or server unreachable'
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(`   Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        message: 'Request setup error'
      };
    }
  }
}

// Run the tests
async function runTests() {
  if (backendUrl) {
    console.log('='.repeat(60));
    console.log('TEST 1: Backend Endpoint Test');
    console.log('='.repeat(60) + '\n');
    const backendResult = await testBackendEndpoint(backendUrl);
    console.log('\n' + '='.repeat(60) + '\n');
    
    if (!backendResult.success || backendResult.source === 'fallback') {
      console.log('='.repeat(60));
      console.log('TEST 2: Direct WordPress Connection Test');
      console.log('='.repeat(60) + '\n');
      const wpResult = await testWordPressConnection();
      
      if (wpResult.success) {
        console.log('\n🎉 Direct WordPress connection works, but backend endpoint has issues');
        process.exit(1);
      } else {
        console.log('\n💥 Both tests failed - check WordPress configuration');
        process.exit(1);
      }
    } else {
      console.log('🎉 Backend endpoint test PASSED - WordPress connection is working!');
      process.exit(0);
    }
  } else {
    console.log('='.repeat(60));
    console.log('Direct WordPress Connection Test');
    console.log('='.repeat(60) + '\n');
    console.log('ℹ️  To test backend endpoint, provide backend URL as argument:');
    console.log('   node test-wp-connection.js https://your-render-url.onrender.com\n');
    
    const result = await testWordPressConnection();
    
    if (result.success) {
      console.log('\n🎉 WordPress connection test PASSED!');
      process.exit(0);
    } else {
      console.log('\n💥 WordPress connection test FAILED!');
      process.exit(1);
    }
  }
}

runTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

