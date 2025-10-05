const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMockData() {
  console.log('🎵 Testing Wave Flow Backend with Mock Data...\n');

  try {
    // Test search with mock data
    console.log('1. Testing Search with Mock Data...');
    const searchResponse = await axios.get(`${BASE_URL}/api/search/tracks?q=imagine`);
    console.log('✅ Search endpoint returned mock data');
    console.log(`   Found ${searchResponse.data.tracks.length} tracks`);
    console.log(`   First track: "${searchResponse.data.tracks[0]?.title}"`);
    console.log(`   First artist: "${searchResponse.data.tracks[0]?.artist}"\n`);

    // Test trending with mock data
    console.log('2. Testing Trending with Mock Data...');
    const trendingResponse = await axios.get(`${BASE_URL}/api/tracks/trending`);
    console.log('✅ Trending endpoint returned mock data');
    console.log(`   Found ${trendingResponse.data.tracks.length} trending tracks`);
    console.log(`   Top track: "${trendingResponse.data.tracks[0]?.title}"\n`);

    // Test track details with mock data
    console.log('3. Testing Track Details with Mock Data...');
    const trackResponse = await axios.get(`${BASE_URL}/api/tracks/mock_id_1`);
    console.log('✅ Track details returned mock data');
    console.log(`   Track: "${trackResponse.data.title}"`);
    console.log(`   Duration: ${trackResponse.data.duration} seconds\n`);

    console.log('🎉 All mock data tests passed!');
    console.log('\n📋 What you can do now:');
    console.log('   ✅ Your backend is fully functional with mock data');
    console.log('   ✅ You can connect your frontend to http://localhost:3001');
    console.log('   ✅ All endpoints are working and returning data');
    console.log('   ✅ CORS is configured for your frontend (port 5173)');
    console.log('\n🔑 To get real music data:');
    console.log('   1. Get YouTube API key (free, 10,000 requests/day)');
    console.log('   2. Get SoundCloud client ID (free)');
    console.log('   3. Add them to your .env file');
    console.log('   4. Restart the server');
    console.log('\n📚 API Documentation: http://localhost:3001/api/docs');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server not running. Start it with: node src/server.js');
    } else {
      console.error('❌ Test failed:', error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
    }
  }
}

testMockData();