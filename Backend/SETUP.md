# Development Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Redis** (optional, but recommended for better performance)

## Getting API Keys

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### SoundCloud API
1. Go to [SoundCloud Developers](https://developers.soundcloud.com/)
2. Register a new application
3. Copy the Client ID

## Installation & Setup

1. **Clone/Download the project**
   ```bash
   cd wave-flow-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
   ```

4. **Start Redis** (optional but recommended)
   - **Windows**: Download and install Redis from the official website
   - **macOS**: `brew install redis && brew services start redis`
   - **Linux**: `sudo apt-get install redis-server && sudo systemctl start redis`

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Testing the API

1. **Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Search for tracks**
   ```bash
   curl "http://localhost:3001/api/search/tracks?q=imagine%20dragons"
   ```

3. **Get trending tracks**
   ```bash
   curl http://localhost:3001/api/tracks/trending
   ```

4. **Get track details** (use a track ID from search results)
   ```bash
   curl http://localhost:3001/api/tracks/TRACK_ID
   ```

## Common Issues

### "YouTube search failed" or "SoundCloud search failed"
- Make sure your API keys are correctly set in the `.env` file
- Check if the APIs have usage quotas or restrictions
- Verify the API keys are valid and have the necessary permissions

### "Redis connection error"
- Redis is optional. The app will fall back to in-memory caching
- If you want to use Redis, make sure it's running on the default port (6379)

### Rate limiting
- The API has built-in rate limiting to prevent abuse
- If you hit the limits during development, wait a few minutes or restart the server

## Production Deployment

### Environment Variables for Production
```
NODE_ENV=production
PORT=3001
YOUTUBE_API_KEY=your_youtube_api_key
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Considerations
- Always use HTTPS in production
- Set up proper CORS origins
- Monitor API usage and set up alerts for unusual activity
- Consider implementing API key rotation
- Use environment-specific Redis instances

### Performance Optimization
- Use Redis for caching in production
- Set up CDN for static assets
- Monitor memory usage and optimize cache TTL values
- Consider implementing request queuing for high traffic

### Monitoring
- Check `/api/health` endpoint regularly
- Monitor logs in the `logs/` directory
- Set up alerts for error rates and response times
- Track API quota usage for external services