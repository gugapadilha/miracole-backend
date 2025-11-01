require('dotenv').config();
const axios = require('axios');

const WP_API_KEY = 'miracole_secret_key_123';
const WP_BASE_URL = 'https://miracoleplus.com';
const BACKEND_URL = 'https://miracole-backend.onrender.com';

async function testWithAPIKey() {
  console.log('🔍 Testing WordPress Connection with API Key...\n');
  console.log(`Base URL: ${WP_BASE_URL}`);
  console.log(`API Key: ${WP_API_KEY.substring(0, 10)}...\n`);

  const url = `${WP_BASE_URL}/wp-json/pmpro/v1/levels`;
  
  console.log(`📡 Testing: ${url}\n`);

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${WP_API_KEY}`
      },
      timeout: 15000
    });

    console.log('✅ SUCCESS! WordPress connection is working!\n');
    console.log(`Status Code: ${response.status}`);
    console.log(`Response Data:\n`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ ERROR! Connection failed!\n');
    
    if (error.response) {
      console.log(`Status Code: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('\n⚠️  401/403 - Problema com autenticação/token');
        console.log('   → Verifique se a WP_API_KEY está correta');
        console.log('   → Verifique se a chave tem permissões no WordPress');
      } else if (error.response.status === 404) {
        console.log('\n⚠️  404 - Endpoint não existe');
        console.log('   → Plugin PMPro pode não estar instalado/ativo');
        console.log('   → REST API do PMPro pode não estar habilitada');
        console.log('   → Endpoint pode ser diferente');
      }
    } else if (error.request) {
      console.log('❌ No response received');
      console.log('   → WordPress pode estar inacessível');
      console.log('   → Problema de rede ou timeout');
    } else {
      console.log(`Error: ${error.message}`);
    }
    
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testBackendEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Backend Endpoint\n');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    const response = await axios.get(`${BACKEND_URL}/api/plans`, {
      timeout: 15000
    });

    console.log('✅ Backend is responding!\n');
    console.log(`Status: ${response.status}`);
    console.log(`Source: ${response.data.source || 'unknown'}`);
    console.log(`Plans count: ${response.data.plans?.length || 0}`);
    
    if (response.data.source === 'wordpress') {
      console.log('\n🎉 Backend successfully connected to WordPress!');
    } else if (response.data.source === 'fallback') {
      console.log('\n⚠️  Backend is using fallback data');
      console.log('   → WordPress connection failed');
    }
    
    return { success: true, source: response.data.source };
  } catch (error) {
    console.log('❌ Backend endpoint test failed\n');
    console.log(`Error: ${error.response?.status || error.message}`);
    return { success: false };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('WordPress Connection Test');
  console.log('='.repeat(60) + '\n');
  
  const wpResult = await testWithAPIKey();
  const backendResult = await testBackendEndpoint();
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  
  if (wpResult.success) {
    console.log('✅ WordPress direct connection: WORKING');
  } else {
    console.log('❌ WordPress direct connection: FAILED');
    console.log('   Reason: Endpoint not found (404)');
    console.log('   Action: Install/activate PMPro plugin in WordPress');
  }
  
  if (backendResult.success && backendResult.source === 'wordpress') {
    console.log('✅ Backend WordPress connection: WORKING');
    console.log('\n🎉 All tests PASSED!');
  } else if (backendResult.success) {
    console.log('⚠️  Backend endpoint: WORKING (using fallback)');
    console.log('   WordPress connection needs to be fixed');
  } else {
    console.log('❌ Backend endpoint: FAILED');
  }
  
  console.log('\n' + '='.repeat(60));
}

runTests().catch(console.error);

