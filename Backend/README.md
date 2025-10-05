# Wave Flow Backend

A backend service for a public music streaming platform that provides access to music from YouTube and SoundCloud without requiring user authentication.

## Features

- 🎵 Music catalog access via YouTube Data API and SoundCloud API
- 🔍 Fast search across tracks, albums, and artists
- 📻 Streaming support with playback controls
- 💾 Intelligent caching with Redis
- 🚦 Rate limiting and security measures
- 📚 Comprehensive API documentation
- 🔄 No authentication required - completely public

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Redis server** (required for caching)

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access API documentation:**
   Open http://localhost:3001/api/docs

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Search
- `GET /api/search/tracks?q={query}&page={page}&limit={limit}` - Search tracks
- `GET /api/search/albums?q={query}&page={page}&limit={limit}` - Search albums
- `GET /api/search/artists?q={query}&page={page}&limit={limit}` - Search artists

### Music Catalog
- `GET /api/tracks/{trackId}` - Get track details
- `GET /api/albums/{albumId}` - Get album details
- `GET /api/artists/{artistId}` - Get artist details
- `GET /api/tracks/{trackId}/stream` - Get streaming URL

### Trending & Popular
- `GET /api/trending/tracks` - Get trending tracks
- `GET /api/popular/tracks` - Get popular tracks

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3001) | No |
| `YOUTUBE_API_KEY` | YouTube Data API key | Yes |
| `SOUNDCLOUD_CLIENT_ID` | SoundCloud API client ID | Yes |
| `REDIS_HOST` | Redis server host | No |
| `REDIS_PORT` | Redis server port | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Getting API Keys

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the key to your `.env` file

### SoundCloud API
1. Go to [SoundCloud Developers](https://developers.soundcloud.com/)
2. Create a new app
3. Get your client ID
4. Add it to your `.env` file

## Architecture

```
src/
├── server.js           # Main server entry point
├── routes/            # API route definitions
├── services/          # External API integrations
├── middleware/        # Custom middleware
└── utils/            # Utility functions
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## Caching Strategy

- **Search results**: 30 minutes TTL
- **Track metadata**: 2 hours TTL
- **General API responses**: 1 hour TTL

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-09-22T10:30:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.