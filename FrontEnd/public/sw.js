// Enhanced Service Worker for mobile background audio v4.2.0
const CACHE_VERSION = "tunecraft-v4.2.0";

// More reliable mobile detection
function isMobileDevice() {
  // Check for touch support and screen characteristics
  const hasTouchScreen = 'ontouchstart' in window || 
                        navigator.maxTouchPoints > 0 || 
                        navigator.msMaxTouchPoints > 0;
  
  // Check screen size (mobile typically < 768px width)
  const hasSmallScreen = window.innerWidth < 768;
  
  // Check for mobile-specific APIs
  const hasMobileApis = 'orientation' in window || 
                       'DeviceOrientationEvent' in window;
  
  return hasTouchScreen && (hasSmallScreen || hasMobileApis);
}

// Mobile-optimized audio state tracking
let audioState = {
  isPlaying: false,
  currentTrack: null,
  lastActivity: Date.now(),
  keepAlive: false,
  isMobile: false // Will be set dynamically
};

// Prevent service worker from being terminated during audio playback
let keepAliveInterval = null;

self.addEventListener("install", (event) => {
  console.log("Enhanced Mobile Audio Service Worker v4.1.0 installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Enhanced Mobile Audio Service Worker v4.1.0 activated");
  event.waitUntil(self.clients.claim());
});

// Handle messages from main thread
self.addEventListener("message", (event) => {
  if (event.data) {
    switch (event.data.type) {
      case "AUDIO_STATE_UPDATE":
        // Update mobile detection when receiving state updates
        audioState = {
          isPlaying: event.data.isPlaying,
          currentTrack: event.data.currentTrack,
          lastActivity: Date.now(),
          keepAlive: event.data.isPlaying,
          isMobile: event.data.isMobile !== undefined ? event.data.isMobile : audioState.isMobile
        };
        console.log("Service Worker: Audio state updated", audioState);
        
        if (event.data.isPlaying && !keepAliveInterval) {
          startKeepAlive();
        } else if (!event.data.isPlaying && keepAliveInterval) {
          stopKeepAlive();
        }
        break;
        
      case "MAINTAIN_AUDIO":
        console.log("Service Worker: Maintaining background audio");
        audioState.lastActivity = Date.now();
        audioState.keepAlive = true;
        
        if (!keepAliveInterval) {
          startKeepAlive();
        }
        break;
        
      case "KEEP_ALIVE":
        audioState.lastActivity = Date.now();
        console.log("Service Worker: Keep-alive signal received");
        break;
    }
  }
});

// Enhanced heartbeat to keep service worker alive during audio playback
function startKeepAlive() {
  if (keepAliveInterval) return;
  
  console.log("Service Worker: Starting optimized keep-alive mechanism");
  const heartbeatInterval = 8000; // 8 seconds - balanced for all devices
  
  keepAliveInterval = setInterval(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - audioState.lastActivity;
    
    if (audioState.isPlaying || audioState.keepAlive || timeSinceLastActivity < 60000) {
      console.log("Service Worker heartbeat: Staying alive for audio playback");
      
      // Lightweight keep-alive ping
      fetch('/keep-alive-ping', { 
        method: 'HEAD', 
        cache: 'no-cache',
        keepalive: true
      }).catch(() => {
        // Ignore errors, this is just to keep SW alive
      });
      
      // Notify clients with mobile-specific data
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "SERVICE_WORKER_HEARTBEAT",
            audioState: audioState,
            timestamp: now,
            isMobile: audioState.isMobile
          });
        });
      });
    } else {
      stopKeepAlive();
    }
  }, heartbeatInterval);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    console.log("Service Worker: Stopping keep-alive mechanism");
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    audioState.keepAlive = false;
  }
}

// Enhanced fetch handling
self.addEventListener("fetch", (event) => {
  audioState.lastActivity = Date.now();
  
  if (event.request.url.includes('/keep-alive-ping')) {
    event.respondWith(new Response('OK', { status: 200 }));
    return;
  }
});

// Start keep-alive if needed
if (audioState.isPlaying) {
  startKeepAlive();
}