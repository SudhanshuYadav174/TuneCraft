const express = require('express');
const router = express.Router();
const soundcloudService = require('../services/soundcloudService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * @swagger
 * /api/artists/{artistId}:
 *   get:
 *     summary: Get artist details and tracks
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ID or username
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [soundcloud]
 *           default: soundcloud
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 50
 *         description: Number of tracks to return
 *     responses:
 *       200:
 *         description: Artist details with tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artist:
 *                   $ref: '#/components/schemas/Artist'
 *                 tracks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 */
router.get('/:artistId', asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { platform = 'soundcloud', limit = 25 } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 50);

  try {
    if (platform === 'soundcloud') {
      const result = await soundcloudService.getUserTracks(artistId, parsedLimit);
      
      res.json({
        artist: result.user,
        tracks: result.tracks,
        platform,
        hasMore: result.hasMore,
        nextOffset: result.nextOffset
      });
    } else {
      return res.status(400).json({
        error: 'Currently only SoundCloud artists are supported',
        code: 'PLATFORM_NOT_SUPPORTED'
      });
    }
  } catch (error) {
    throw error;
  }
}));

/**
 * @swagger
 * /api/artists/{artistId}/tracks:
 *   get:
 *     summary: Get tracks by an artist
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [soundcloud]
 *           default: soundcloud
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
router.get('/:artistId/tracks', asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { platform = 'soundcloud', page = 1, limit = 25 } = req.query;
  const parsedLimit = Math.min(parseInt(limit), 50);
  const parsedPage = Math.max(parseInt(page), 1);
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    if (platform === 'soundcloud') {
      const result = await soundcloudService.getUserTracks(artistId, parsedLimit, offset);
      
      res.json({
        tracks: result.tracks,
        artist: result.user,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          hasMore: result.hasMore,
          nextOffset: result.nextOffset
        },
        platform
      });
    } else {
      return res.status(400).json({
        error: 'Currently only SoundCloud artists are supported',
        code: 'PLATFORM_NOT_SUPPORTED'
      });
    }
  } catch (error) {
    throw error;
  }
}));

module.exports = router;