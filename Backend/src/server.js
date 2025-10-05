require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swaggerDef");
const logger = require("./utils/logger");
const { handleError, notFound } = require("./utils/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import routes
const searchRoutes = require("./routes/search");
const tracksRoutes = require("./routes/tracks");
const artistsRoutes = require("./routes/artists");
const systemRoutes = require("./routes/system");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy headers when deployed (required for rate limiting behind reverse proxy)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true); // Trust all proxies in production (Render)
} else {
  app.set("trust proxy", 1); // Trust first proxy in development
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false, // Allow embedding for streaming
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN ||
        process.env.FRONTEND_URL ||
        "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:3000",
      "https://tunecraftstream.me", // Custom domain
      "https://tunecraft-frontend.onrender.com",
      "https://tunecraft-fs7p.onrender.com", // Render frontend URL
      "https://*.ondigitalocean.app", // DigitalOcean App Platform domains
      /^https:\/\/[\w-]+\.ondigitalocean\.app$/, // DigitalOcean regex pattern
    ],
    credentials: false, // No authentication needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });
  next();
});

// Rate limiting
app.use("/api", apiLimiter);

// API routes
app.use("/api/search", searchRoutes);
app.use("/api/tracks", tracksRoutes);
app.use("/api/artists", artistsRoutes);
app.use("/api", systemRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Wave Flow Backend",
    version: "1.0.0",
    description: "Backend service for a public music streaming platform",
    documentation: "/api/docs",
    endpoints: {
      health: "/api/health",
      search: "/api/search/tracks?q={query}",
      track: "/api/tracks/{trackId}",
      stream: "/api/tracks/{trackId}/stream",
      trending: "/api/tracks/trending",
      artist: "/api/artists/{artistId}",
    },
  });
});

// Swagger documentation route
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Wave Flow API Documentation",
  })
);

// Error handling middleware
app.use(notFound);
app.use(handleError);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🎵 Wave Flow Backend is running on port ${PORT}`);
  logger.info(`🏠 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`� Trust proxy: ${app.get("trust proxy")}`);
  logger.info(`�📚 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`❤️  Health Check: http://localhost:${PORT}/api/health`);

  // Log configuration status
  const youtubeConfigured = !!process.env.YOUTUBE_API_KEY;
  const soundcloudConfigured = !!process.env.SOUNDCLOUD_CLIENT_ID;

  logger.info(
    `🎬 YouTube API: ${
      youtubeConfigured ? "✅ Configured" : "❌ Not configured"
    }`
  );
  logger.info(
    `🎵 SoundCloud API: ${
      soundcloudConfigured ? "✅ Configured" : "❌ Not configured"
    }`
  );

  if (!youtubeConfigured && !soundcloudConfigured) {
    logger.warn(
      "⚠️  No external APIs configured. Please add API keys to environment variables."
    );
  }
});

module.exports = app;
