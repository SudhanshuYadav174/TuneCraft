const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     cache:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         type:
 *                           type: string
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         configured:
 *                           type: boolean
 *                     soundcloud:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         configured:
 *                           type: boolean
 */
router.get('/health', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Test cache connectivity
  let cacheStatus = 'unknown';
  let cacheType = 'node-cache';
  try {
    await cache.set('health-check', { timestamp: Date.now() }, 10);
    const testValue = await cache.get('health-check');
    if (testValue) {
      cacheStatus = 'healthy';
      cacheType = cache.useRedis ? 'redis' : 'node-cache';
    } else {
      cacheStatus = 'unhealthy';
    }
  } catch (error) {
    cacheStatus = 'error';
  }

  // Check service configurations
  const youtubeConfigured = !!process.env.YOUTUBE_API_KEY;
  const soundcloudConfigured = !!process.env.SOUNDCLOUD_CLIENT_ID;

  const responseTime = Date.now() - startTime;

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    responseTime: `${responseTime}ms`,
    services: {
      cache: {
        status: cacheStatus,
        type: cacheType
      },
      youtube: {
        status: youtubeConfigured ? 'configured' : 'not-configured',
        configured: youtubeConfigured
      },
      soundcloud: {
        status: soundcloudConfigured ? 'configured' : 'not-configured',
        configured: soundcloudConfigured
      }
    },
    environment: process.env.NODE_ENV || 'development'
  });
}));

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Detailed system status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Detailed system information
 */
router.get('/status', asyncHandler(async (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      }
    },
    cache: {
      type: cache.useRedis ? 'redis' : 'node-cache',
      status: cache.useRedis ? 'connected' : 'local'
    },
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;