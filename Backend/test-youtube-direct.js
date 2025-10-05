const axios = require('axios');

const YOUTUBE_API_KEY = 'AIzaSyANhabl--b77keer_fYtonihks47SpRHzQ';

async function testDirectYouTubeAPI() {
  console.log('🔑 Testing YouTube API Key directly...\n');

  try {
    console.log('Making request to YouTube API...');
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'imagine dragons',
        type: 'video',
        maxResults: 3,
        key: YOUTUBE_API_KEY
      }
    });

    console.log('✅ SUCCESS! YouTube API is working!');
    console.log(`📊 Found ${response.data.items.length} videos`);
    console.log('\n🎵 Results:');
    
    response.data.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.snippet.title}`);
      console.log(`   By: ${item.snippet.channelTitle}`);
      console.log(`   Published: ${item.snippet.publishedAt}`);
      console.log('');
    });

    console.log('🎉 Your YouTube API key is working perfectly!');
    console.log('🔧 Now let\'s test if the backend can use it...');

    // Test if backend can access the API
    console.log('\n🔄 Testing backend endpoint...');
    try {
      const backendResponse = await axios.get('http://localhost:3001/api/search/tracks?q=imagine%20dragons', {
        timeout: 10000
      });
      console.log('✅ Backend search is working!');
      console.log(`🎵 Backend found ${backendResponse.data.tracks.length} tracks`);
      if (backendResponse.data.tracks.length > 0) {
        console.log(`   First track: "${backendResponse.data.tracks[0].title}"`);
      }
    } catch (backendError) {
      console.log('⚠️  Backend endpoint test failed:', backendError.message);
      console.log('💡 Make sure the backend server is running: node src/server.js');
    }

  } catch (error) {
    console.error('❌ YouTube API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check if YouTube Data API v3 is enabled in Google Cloud Console');
      console.log('   2. Verify the API key restrictions aren\'t too strict');
      console.log('   3. Check if you have remaining quota');
    }
  }
}

testDirectYouTubeAPI();