const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');
const soundcloudService = require('../services/soundcloudService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * @swagger
 * /api/tracks/trending:
 *   get:
 *     summary: Get trending tracks
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, soundcloud, all]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 50
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: US
 *         description: Region code for YouTube trending (ISO 3166-1 alpha-2)
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const { platform = 'all', limit = 25, region = 'US' } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 50);

  let allTracks = [];

  try {
    if (platform === 'youtube' || platform === 'all') {
      try {
        const youtubeTrending = await youtubeService.getTrendingTracks(parsedLimit, region);
        allTracks.push(...youtubeTrending);
      } catch (error) {
        console.warn('YouTube trending failed:', error.message);
      }
    }

    if (platform === 'soundcloud' || platform === 'all') {
      try {
        const soundcloudTrending = await soundcloudService.getTrendingTracks('all-music', parsedLimit);
        allTracks.push(...soundcloudTrending);
      } catch (error) {
        console.warn('SoundCloud trending failed:', error.message);
      }
    }

    // Mix and sort tracks by popularity metrics
    allTracks.sort((a, b) => {
      const aScore = (a.viewCount || a.playCount || 0) + (a.likeCount || 0);
      const bScore = (b.viewCount || b.playCount || 0) + (b.likeCount || 0);
      return bScore - aScore;
    });

    // Limit to requested amount
    const trendingTracks = allTracks.slice(0, parsedLimit);

    res.json({
      tracks: trendingTracks,
      platform,
      region: platform === 'youtube' || platform === 'all' ? region : null,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
}));

/**
 * @swagger
 * /api/tracks/{trackId}:
 *   get:
 *     summary: Get track details by ID
 *     tags: [Tracks]
 *     parameters:
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID (can be YouTube video ID or SoundCloud track ID)
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, soundcloud]
 *         description: Platform to fetch from (auto-detected if not provided)
 *     responses:
 *       200:
 *         description: Track details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       404:
 *         description: Track not found
 */
router.get('/:trackId', asyncHandler(async (req, res) => {
  const { trackId } = req.params;
  const { platform } = req.query;

  let track = null;
  let detectedPlatform = platform;

  // Auto-detect platform if not specified
  if (!platform) {
    // YouTube video IDs are typically 11 characters long and alphanumeric with _ and -
    if (/^[a-zA-Z0-9_-]{11}$/.test(trackId)) {
      detectedPlatform = 'youtube';
    } else if (/^\d+$/.test(trackId)) {
      // SoundCloud track IDs are typically numeric
      detectedPlatform = 'soundcloud';
    }
  }

  try {
    if (detectedPlatform === 'youtube') {
      track = await youtubeService.getTrackDetails(trackId);
    } else if (detectedPlatform === 'soundcloud') {
      track = await soundcloudService.getTrackDetails(trackId);
    } else {
      // Try both platforms
      try {
        track = await youtubeService.getTrackDetails(trackId);
        detectedPlatform = 'youtube';
      } catch (youtubeError) {
        try {
          track = await soundcloudService.getTrackDetails(trackId);
          detectedPlatform = 'soundcloud';
        } catch (soundcloudError) {
          return res.status(404).json({
            error: 'Track not found on any platform',
            code: 'TRACK_NOT_FOUND'
          });
        }
      }
    }

    track.platform = detectedPlatform;
    res.json(track);
  } catch (error) {
    throw error;
  }
}));

/**
 * @swagger
 * /api/tracks/{trackId}/stream:
 *   get:
 *     summary: Get streaming URL for a track
 *     tags: [Tracks, Streaming]
 *     parameters:
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, soundcloud]
 *         description: Platform to stream from
 *     responses:
 *       200:
 *         description: Streaming URL and metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Direct streaming URL
 *                 mimeType:
 *                   type: string
 *                   description: Audio MIME type
 *                 contentLength:
 *                   type: string
 *                   description: Content length in bytes
 */
router.get('/:trackId/stream', asyncHandler(async (req, res) => {
  const { trackId } = req.params;
  const { platform } = req.query;

  let streamData = null;
  let detectedPlatform = platform;

  // Auto-detect platform if not specified
  if (!platform) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(trackId)) {
      detectedPlatform = 'youtube';
    } else if (/^\d+$/.test(trackId)) {
      detectedPlatform = 'soundcloud';
    }
  }

  try {
    if (detectedPlatform === 'youtube') {
      streamData = await youtubeService.getStreamingUrl(trackId);
    } else if (detectedPlatform === 'soundcloud') {
      streamData = await soundcloudService.getStreamingUrl(trackId);
    } else {
      // Try both platforms
      try {
        streamData = await youtubeService.getStreamingUrl(trackId);
        detectedPlatform = 'youtube';
      } catch (youtubeError) {
        streamData = await soundcloudService.getStreamingUrl(trackId);
        detectedPlatform = 'soundcloud';
      }
    }

    res.json({
      ...streamData,
      platform: detectedPlatform,
      trackId
    });
  } catch (error) {
    throw error;
  }
}));

module.exports = router;