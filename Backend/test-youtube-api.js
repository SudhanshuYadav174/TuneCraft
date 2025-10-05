require('dotenv').config({ path: 'C:\\Users\\HP\\Downloads\\wave-flow-backend\\.env' });
const axios = require('axios');

async function testYouTubeAPI() {
  console.log('🔑 Testing YouTube API Key...');
  console.log(`API Key: ${process.env.YOUTUBE_API_KEY ? 'Found' : 'Not found'}`);
  
  if (!process.env.YOUTUBE_API_KEY) {
    console.log('❌ No YouTube API key found in environment');
    return;
  }

  try {
    // Test a simple search
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'music',
        type: 'video',
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    console.log('✅ YouTube API key is working!');
    console.log(`Found ${response.data.items.length} results`);
    console.log(`First result: ${response.data.items[0]?.snippet?.title}`);
    
    // Test the backend endpoint
    console.log('\n🧪 Testing backend endpoint...');
    const backendResponse = await axios.get('http://localhost:3001/api/search/tracks?q=music');
    console.log('✅ Backend search endpoint working!');
    console.log(`Backend found ${backendResponse.data.tracks.length} tracks`);
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('💡 This might be a quota or permissions issue');
    }
  }
}

testYouTubeAPI();