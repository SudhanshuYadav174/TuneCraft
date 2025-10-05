const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Wave Flow Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Uptime: ${Math.round(healthResponse.data.uptime)}s\n`);

    // Test 2: Root endpoint
    console.log('2. Testing Root Endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint passed');
    console.log(`   Message: ${rootResponse.data.message}\n`);

    // Test 3: Search endpoint (should handle error gracefully without API keys)
    console.log('3. Testing Search Endpoint...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}/api/search/tracks?q=test`);
      console.log('✅ Search endpoint responded');
      console.log(`   Found ${searchResponse.data.tracks.length} tracks\n`);
    } catch (error) {
      if (error.response && error.response.status < 500) {
        console.log('✅ Search endpoint handled gracefully (no API keys)');
        console.log(`   Status: ${error.response.status}\n`);
      } else {
        throw error;
      }
    }

    // Test 4: Trending endpoint
    console.log('4. Testing Trending Endpoint...');
    try {
      const trendingResponse = await axios.get(`${BASE_URL}/api/tracks/trending`);
      console.log('✅ Trending endpoint responded');
      console.log(`   Found ${trendingResponse.data.tracks.length} tracks\n`);
    } catch (error) {
      if (error.response && error.response.status < 500) {
        console.log('✅ Trending endpoint handled gracefully (no API keys)');
        console.log(`   Status: ${error.response.status}\n`);
      } else {
        throw error;
      }
    }

    // Test 5: Invalid endpoint (404 test)
    console.log('5. Testing 404 Handling...');
    try {
      await axios.get(`${BASE_URL}/api/nonexistent`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 404 handling works correctly');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Add YouTube API key to .env file');
    console.log('   2. Add SoundCloud client ID to .env file');
    console.log('   3. Visit http://localhost:3001/api/docs for API documentation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Handle if the server is not running
testAPI().catch((error) => {
  if (error.code === 'ECONNREFUSED') {
    console.error('❌ Cannot connect to server. Make sure the backend is running on port 3001');
    console.error('   Run: node src/server.js');
  } else {
    console.error('❌ Unexpected error:', error.message);
  }
});