const { Client } = require('soundcloud-scraper');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { ErrorHandler } = require('../utils/errorHandler');

class SoundCloudService {
  constructor() {
    this.client = new Client();
    this.cacheTTL = {
      search: parseInt(process.env.SEARCH_CACHE_TTL) || 1800, // 30 minutes
      metadata: parseInt(process.env.METADATA_CACHE_TTL) || 7200, // 2 hours
      trending: 3600 // 1 hour
    };
  }

  async searchTracks(query, limit = 25, offset = 0) {
    const cacheKey = cache.generateKey('soundcloud:search:tracks', { query, limit, offset });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Return mock data if no client ID is configured
    if (!process.env.SOUNDCLOUD_CLIENT_ID) {
      return this.getMockSearchResults(query, limit, offset);
    }

    try {
      const tracks = await this.client.search(query, 'track', limit, offset);
      
      const formattedTracks = tracks.map(track => ({
        id: track.id.toString(),
        title: track.title,
        artist: track.user.username,
        thumbnail: track.artwork_url || track.user.avatar_url,
        duration: Math.floor(track.duration / 1000), // Convert to seconds
        publishedAt: track.created_at,
        playCount: track.playback_count,
        likeCount: track.likes_count,
        source: 'soundcloud',
        permalink: track.permalink_url
      }));

      const result = {
        tracks: formattedTracks,
        hasMore: tracks.length === limit,
        nextOffset: offset + limit
      };

      await cache.set(cacheKey, result, this.cacheTTL.search);
      return result;
    } catch (error) {
      logger.error('SoundCloud search error:', error.message);
      throw new ErrorHandler('Failed to search SoundCloud', 500, 'SOUNDCLOUD_SEARCH_ERROR');
    }
  }

  async getTrackDetails(trackId) {
    const cacheKey = cache.generateKey('soundcloud:track', { trackId });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Return mock data if no client ID is configured
    if (!process.env.SOUNDCLOUD_CLIENT_ID) {
      return this.getMockTrackDetails(trackId);
    }

    try {
      const track = await this.client.getSongInfo(trackId);
      
      if (!track) {
        throw new ErrorHandler('Track not found', 404, 'TRACK_NOT_FOUND');
      }

      const trackDetails = {
        id: track.id.toString(),
        title: track.title,
        artist: track.user.username,
        artistId: track.user.id.toString(),
        description: track.description,
        thumbnail: track.artwork_url || track.user.avatar_url,
        duration: Math.floor(track.duration / 1000),
        publishedAt: track.created_at,
        playCount: track.playback_count,
        likeCount: track.likes_count,
        commentCount: track.comment_count,
        tags: track.tag_list ? track.tag_list.split(' ').filter(tag => tag) : [],
        genre: track.genre,
        source: 'soundcloud',
        permalink: track.permalink_url,
        waveformUrl: track.waveform_url
      };

      await cache.set(cacheKey, trackDetails, this.cacheTTL.metadata);
      return trackDetails;
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      logger.error('SoundCloud track details error:', error.message);
      throw new ErrorHandler('Failed to fetch track details', 500, 'SOUNDCLOUD_DETAILS_ERROR');
    }
  }

  async getTrendingTracks(genre = 'all-music', limit = 25) {
    const cacheKey = cache.generateKey('soundcloud:trending', { genre, limit });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      // SoundCloud doesn't have a direct trending endpoint in the scraper
      // We'll search for popular tracks instead
      const tracks = await this.client.search('', 'track', limit, 0);
      
      const formattedTracks = tracks
        .sort((a, b) => (b.playback_count || 0) - (a.playback_count || 0))
        .map(track => ({
          id: track.id.toString(),
          title: track.title,
          artist: track.user.username,
          thumbnail: track.artwork_url || track.user.avatar_url,
          duration: Math.floor(track.duration / 1000),
          publishedAt: track.created_at,
          playCount: track.playback_count,
          source: 'soundcloud'
        }));

      await cache.set(cacheKey, formattedTracks, this.cacheTTL.trending);
      return formattedTracks;
    } catch (error) {
      logger.error('SoundCloud trending error:', error.message);
      throw new ErrorHandler('Failed to fetch trending tracks', 500, 'SOUNDCLOUD_TRENDING_ERROR');
    }
  }

  async getStreamingUrl(trackId) {
    try {
      const streamUrl = await this.client.util.streamLink(trackId);
      return {
        url: streamUrl,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      logger.error('SoundCloud streaming URL error:', error.message);
      throw new ErrorHandler('Failed to get streaming URL', 500, 'STREAMING_URL_ERROR');
    }
  }

  // Mock data methods for when client ID is not available
  getMockSearchResults(query, limit = 25, offset = 0) {
    const mockTracks = [
      {
        id: 'sc_mock_1',
        title: `${query} - SoundCloud Demo`,
        artist: 'Demo Producer',
        thumbnail: 'https://via.placeholder.com/500x500?text=SC+Demo+1',
        duration: 185,
        publishedAt: '2025-01-12T16:20:00Z',
        playCount: 50000,
        likeCount: 1200,
        source: 'soundcloud',
        permalink: 'https://soundcloud.com/demo/track-1'
      },
      {
        id: 'sc_mock_2',
        title: `${query} Beats`,
        artist: 'Sample Creator',
        thumbnail: 'https://via.placeholder.com/500x500?text=SC+Demo+2',
        duration: 220,
        publishedAt: '2025-01-08T11:45:00Z',
        playCount: 25000,
        likeCount: 800,
        source: 'soundcloud',
        permalink: 'https://soundcloud.com/demo/track-2'
      }
    ];

    const startIndex = offset;
    const endIndex = Math.min(offset + limit, mockTracks.length);
    const paginatedTracks = mockTracks.slice(startIndex, endIndex);

    return {
      tracks: paginatedTracks,
      hasMore: endIndex < mockTracks.length,
      nextOffset: endIndex
    };
  }

  getMockTrackDetails(trackId) {
    return {
      id: trackId,
      title: 'SoundCloud Demo Track',
      artist: 'Demo Producer',
      artistId: 'demo_producer_123',
      description: 'This is a demo track returned when SoundCloud API client ID is not configured. Add your SoundCloud client ID to the .env file to get real data.',
      thumbnail: 'https://via.placeholder.com/500x500?text=SC+Demo+Track',
      duration: 195,
      publishedAt: '2025-01-12T16:20:00Z',
      playCount: 50000,
      likeCount: 1200,
      commentCount: 45,
      tags: ['demo', 'electronic', 'beats'],
      genre: 'Electronic',
      source: 'soundcloud',
      permalink: 'https://soundcloud.com/demo/demo-track',
      waveformUrl: 'https://via.placeholder.com/1800x280?text=Waveform'
    };
  }

  async getUserTracks(username, limit = 25, offset = 0) {
    const cacheKey = cache.generateKey('soundcloud:user:tracks', { username, limit, offset });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const user = await this.client.getUser(username);
      if (!user) {
        throw new ErrorHandler('User not found', 404, 'USER_NOT_FOUND');
      }

      const tracks = await this.client.getUserTracks(user.id, limit, offset);
      
      const formattedTracks = tracks.map(track => ({
        id: track.id.toString(),
        title: track.title,
        artist: track.user.username,
        thumbnail: track.artwork_url || track.user.avatar_url,
        duration: Math.floor(track.duration / 1000),
        publishedAt: track.created_at,
        playCount: track.playback_count,
        source: 'soundcloud'
      }));

      const result = {
        tracks: formattedTracks,
        user: {
          id: user.id.toString(),
          username: user.username,
          displayName: user.display_name,
          avatar: user.avatar_url,
          followersCount: user.followers_count,
          trackCount: user.track_count
        },
        hasMore: tracks.length === limit,
        nextOffset: offset + limit
      };

      await cache.set(cacheKey, result, this.cacheTTL.metadata);
      return result;
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      logger.error('SoundCloud user tracks error:', error.message);
      throw new ErrorHandler('Failed to fetch user tracks', 500, 'SOUNDCLOUD_USER_ERROR');
    }
  }
}

module.exports = new SoundCloudService();