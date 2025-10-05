const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');
const soundcloudService = require('../services/soundcloudService');
const { asyncHandler } = require('../utils/errorHandler');
const { searchLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/search/tracks:
 *   get:
 *     summary: Search for tracks across all platforms
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, soundcloud, all]
 *           default: all
 *         description: Platform to search on
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 50
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/tracks', searchLimiter, asyncHandler(async (req, res) => {
  const { q, platform = 'all', page = 1, limit = 25 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error: 'Search query must be at least 2 characters long',
      code: 'INVALID_QUERY'
    });
  }

  const parsedLimit = Math.min(parseInt(limit), 50);
  const parsedPage = Math.max(parseInt(page), 1);
  const offset = (parsedPage - 1) * parsedLimit;

  let allTracks = [];
  let totalResults = 0;
  let hasMore = false;

  try {
    if (platform === 'youtube' || platform === 'all') {
      try {
        const youtubeResults = await youtubeService.searchTracks(
          q, 
          parsedLimit, 
          parsedPage > 1 ? `page_${parsedPage}` : ''
        );
        allTracks.push(...youtubeResults.tracks);
        totalResults += youtubeResults.totalResults || 0;
        hasMore = hasMore || !!youtubeResults.nextPageToken;
      } catch (error) {
        // Log YouTube error but continue with other platforms
        console.warn('YouTube search failed:', error.message);
      }
    }

    if (platform === 'soundcloud' || platform === 'all') {
      try {
        const soundcloudResults = await soundcloudService.searchTracks(q, parsedLimit, offset);
        allTracks.push(...soundcloudResults.tracks);
        hasMore = hasMore || soundcloudResults.hasMore;
      } catch (error) {
        // Log SoundCloud error but continue with other platforms
        console.warn('SoundCloud search failed:', error.message);
      }
    }

    // Sort by relevance (could be enhanced with more sophisticated ranking)
    allTracks.sort((a, b) => {
      const aRelevance = a.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      const bRelevance = b.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      return bRelevance - aRelevance;
    });

    // Limit results to requested amount
    const paginatedTracks = allTracks.slice(0, parsedLimit);

    res.json({
      tracks: paginatedTracks,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: totalResults,
        hasMore: hasMore && allTracks.length >= parsedLimit
      },
      query: q,
      platform
    });
  } catch (error) {
    throw error;
  }
}));

/**
 * @swagger
 * /api/search/artists:
 *   get:
 *     summary: Search for artists
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist search query
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, soundcloud, all]
 *           default: all
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 50
 */
router.get('/artists', searchLimiter, asyncHandler(async (req, res) => {
  const { q, platform = 'all', page = 1, limit = 25 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error: 'Search query must be at least 2 characters long',
      code: 'INVALID_QUERY'
    });
  }

  const parsedLimit = Math.min(parseInt(limit), 50);
  const parsedPage = Math.max(parseInt(page), 1);

  let artists = [];

  try {
    if (platform === 'youtube' || platform === 'all') {
      try {
        // Search for channels (artists) on YouTube
        const youtubeResults = await youtubeService.searchTracks(
          `${q} artist channel`, 
          parsedLimit
        );
        
        // Extract unique artists from search results
        const uniqueArtists = new Map();
        youtubeResults.tracks.forEach(track => {
          if (!uniqueArtists.has(track.artist)) {
            uniqueArtists.set(track.artist, {
              name: track.artist,
              platform: 'youtube',
              trackCount: 1,
              thumbnail: track.thumbnail
            });
          } else {
            uniqueArtists.get(track.artist).trackCount++;
          }
        });
        
        artists.push(...Array.from(uniqueArtists.values()));
      } catch (error) {
        console.warn('YouTube artist search failed:', error.message);
      }
    }

    if (platform === 'soundcloud' || platform === 'all') {
      try {
        // For SoundCloud, we can search for users directly if the scraper supports it
        // This is a simplified implementation
        const soundcloudResults = await soundcloudService.searchTracks(q, parsedLimit);
        
        const uniqueArtists = new Map();
        soundcloudResults.tracks.forEach(track => {
          if (!uniqueArtists.has(track.artist)) {
            uniqueArtists.set(track.artist, {
              name: track.artist,
              platform: 'soundcloud',
              trackCount: 1,
              thumbnail: track.thumbnail
            });
          } else {
            uniqueArtists.get(track.artist).trackCount++;
          }
        });
        
        artists.push(...Array.from(uniqueArtists.values()));
      } catch (error) {
        console.warn('SoundCloud artist search failed:', error.message);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueArtistNames = new Map();
    artists.forEach(artist => {
      const key = artist.name.toLowerCase();
      if (!uniqueArtistNames.has(key) || 
          uniqueArtistNames.get(key).trackCount < artist.trackCount) {
        uniqueArtistNames.set(key, artist);
      }
    });

    const finalArtists = Array.from(uniqueArtistNames.values())
      .sort((a, b) => {
        const aRelevance = a.name.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
        const bRelevance = b.name.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
        if (aRelevance !== bRelevance) return bRelevance - aRelevance;
        return b.trackCount - a.trackCount;
      })
      .slice(0, parsedLimit);

    res.json({
      artists: finalArtists,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: finalArtists.length,
        hasMore: false
      },
      query: q,
      platform
    });
  } catch (error) {
    throw error;
  }
}));

module.exports = router;