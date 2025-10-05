const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { ErrorHandler } = require('../utils/errorHandler');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.cacheTTL = {
      search: parseInt(process.env.SEARCH_CACHE_TTL) || 1800, // 30 minutes
      metadata: parseInt(process.env.METADATA_CACHE_TTL) || 7200, // 2 hours
      trending: 3600 // 1 hour
    };
  }

  async searchTracks(query, maxResults = 25, pageToken = '') {
    const cacheKey = cache.generateKey('youtube:search:tracks', { query, maxResults, pageToken });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Return mock data if no API key is configured
    if (!this.apiKey) {
      return this.getMockSearchResults(query, maxResults);
    }

    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults,
          pageToken,
          key: this.apiKey
        }
      });

      const tracks = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: null, // Will be fetched separately if needed
        publishedAt: item.snippet.publishedAt,
        source: 'youtube'
      }));

      const result = {
        tracks,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults
      };

      await cache.set(cacheKey, result, this.cacheTTL.search);
      return result;
    } catch (error) {
      logger.error('YouTube search error:', error.response?.data || error.message);
      throw new ErrorHandler('Failed to search YouTube', 500, 'YOUTUBE_SEARCH_ERROR');
    }
  }

  async getTrackDetails(videoId) {
    const cacheKey = cache.generateKey('youtube:track', { videoId });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Return mock data if no API key is configured
    if (!this.apiKey) {
      return this.getMockTrackDetails(videoId);
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: this.apiKey
        }
      });

      if (!response.data.items.length) {
        throw new ErrorHandler('Track not found', 404, 'TRACK_NOT_FOUND');
      }

      const video = response.data.items[0];
      const track = {
        id: video.id,
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
        duration: this.parseDuration(video.contentDetails.duration),
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount || 0),
        tags: video.snippet.tags || [],
        source: 'youtube'
      };

      await cache.set(cacheKey, track, this.cacheTTL.metadata);
      return track;
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      logger.error('YouTube track details error:', error.response?.data || error.message);
      throw new ErrorHandler('Failed to fetch track details', 500, 'YOUTUBE_DETAILS_ERROR');
    }
  }

  async getTrendingTracks(maxResults = 25, regionCode = 'US') {
    const cacheKey = cache.generateKey('youtube:trending', { maxResults, regionCode });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Return mock data if no API key is configured
    if (!this.apiKey) {
      return this.getMockTrendingTracks(maxResults);
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          chart: 'mostPopular',
          videoCategoryId: '10', // Music category
          regionCode,
          maxResults,
          key: this.apiKey
        }
      });

      const tracks = response.data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: this.parseDuration(item.contentDetails.duration),
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount),
        source: 'youtube'
      }));

      await cache.set(cacheKey, tracks, this.cacheTTL.trending);
      return tracks;
    } catch (error) {
      logger.error('YouTube trending error:', error.response?.data || error.message);
      throw new ErrorHandler('Failed to fetch trending tracks', 500, 'YOUTUBE_TRENDING_ERROR');
    }
  }

  parseDuration(duration) {
    // Convert YouTube duration format (PT4M13S) to seconds
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  async getStreamingUrl(videoId) {
    // For YouTube videos, return embed URL for video playback
    // This is much more reliable than trying to extract audio streams
    try {
      // YouTube embed URL with appropriate parameters - using youtube-nocookie.com to match frontend
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`;
      
      // Try to get video info for duration if possible
      let duration = 0;
      try {
        const ytdl = require('ytdl-core');
        if (ytdl.validateID(videoId)) {
          const info = await ytdl.getBasicInfo(videoId);
          duration = parseInt(info.videoDetails.lengthSeconds) || 0;
        }
      } catch (infoError) {
        logger.warn('Could not get video info, using default duration:', infoError.message);
        // Use a reasonable default duration
        duration = 180; // 3 minutes
      }
      
      return {
        streamUrl: embedUrl,
        contentLength: '0',
        mimeType: 'video/mp4',
        duration: duration,
        isVideo: true,
        videoId: videoId
      };
    } catch (error) {
      logger.error('YouTube video streaming error:', error.message);
      throw new ErrorHandler('Failed to get video URL', 500, 'VIDEO_STREAMING_ERROR');
    }
  }

  // Mock data methods for when API key is not available
  getMockSearchResults(query, maxResults = 25) {
    const mockTracks = [
      {
        id: 'mock_id_1',
        title: `${query} - Popular Song`,
        artist: 'Demo Artist',
        thumbnail: 'https://via.placeholder.com/480x360?text=Demo+Track+1',
        duration: 210,
        publishedAt: '2025-01-15T10:00:00Z',
        source: 'youtube'
      },
      {
        id: 'mock_id_2',
        title: `Best of ${query}`,
        artist: 'Sample Musician',
        thumbnail: 'https://via.placeholder.com/480x360?text=Demo+Track+2',
        duration: 195,
        publishedAt: '2025-01-10T15:30:00Z',
        source: 'youtube'
      },
      {
        id: 'mock_id_3',
        title: `${query} Remix`,
        artist: 'Virtual Band',
        thumbnail: 'https://via.placeholder.com/480x360?text=Demo+Track+3',
        duration: 240,
        publishedAt: '2025-01-05T12:45:00Z',
        source: 'youtube'
      }
    ];

    const limitedTracks = mockTracks.slice(0, Math.min(maxResults, mockTracks.length));
    
    return {
      tracks: limitedTracks,
      nextPageToken: null,
      totalResults: limitedTracks.length
    };
  }

  getMockTrackDetails(videoId) {
    return {
      id: videoId,
      title: 'Demo Track - Sample Song',
      artist: 'Demo Artist',
      description: 'This is a demo track returned when YouTube API key is not configured. Add your YouTube API key to the .env file to get real data.',
      thumbnail: 'https://via.placeholder.com/1280x720?text=Demo+Track+Thumbnail',
      duration: 215,
      publishedAt: '2025-01-15T10:00:00Z',
      viewCount: 1000000,
      likeCount: 25000,
      tags: ['demo', 'sample', 'music'],
      source: 'youtube'
    };
  }

  getMockTrendingTracks(maxResults = 25) {
    const mockTrending = [
      {
        id: 'trending_1',
        title: 'Trending Hit #1',
        artist: 'Popular Artist',
        thumbnail: 'https://via.placeholder.com/480x360?text=Trending+1',
        duration: 200,
        publishedAt: '2025-01-20T08:00:00Z',
        viewCount: 5000000,
        source: 'youtube'
      },
      {
        id: 'trending_2',
        title: 'Chart Topper',
        artist: 'Famous Singer',
        thumbnail: 'https://via.placeholder.com/480x360?text=Trending+2',
        duration: 180,
        publishedAt: '2025-01-18T14:30:00Z',
        viewCount: 3000000,
        source: 'youtube'
      },
      {
        id: 'trending_3',
        title: 'Viral Music Video',
        artist: 'Rising Star',
        thumbnail: 'https://via.placeholder.com/480x360?text=Trending+3',
        duration: 230,
        publishedAt: '2025-01-16T20:15:00Z',
        viewCount: 2500000,
        source: 'youtube'
      }
    ];

    return mockTrending.slice(0, Math.min(maxResults, mockTrending.length));
  }
}

module.exports = new YouTubeService();