import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Repeat,
  Shuffle,
  X,
  VolumeX,
  Music
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/contexts/PlayerContext";

// YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    currentYouTubePlayer: any; // Global reference to current player
  }
}

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className }: MusicPlayerProps) {
  const {
    state,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
    formatTime,
    dispatch
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const youtubeRef = useRef<HTMLDivElement>(null);

  // Load YouTube iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube iframe API loaded');
      };
    }

    // Global cleanup on page unload
    const handleBeforeUnload = () => {
      if (window.currentYouTubePlayer) {
        try {
          window.currentYouTubePlayer.stopVideo();
          window.currentYouTubePlayer.destroy();
        } catch (error) {
          console.log('Error in beforeunload cleanup:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Setup YouTube player when video URL changes
  useEffect(() => {
    // Global cleanup - destroy any existing YouTube player
    const destroyCurrentPlayer = () => {
      if (window.currentYouTubePlayer) {
        try {
          console.log('Destroying global YouTube player');
          // Check if player is still attached to DOM before calling methods
          if (typeof window.currentYouTubePlayer.getPlayerState === 'function') {
            window.currentYouTubePlayer.stopVideo();
          }
          if (typeof window.currentYouTubePlayer.destroy === 'function') {
            window.currentYouTubePlayer.destroy();
          }
          window.currentYouTubePlayer = null;
        } catch (error) {
          console.log('Error destroying global YouTube player:', error);
          // Force clear the reference even if destroy fails
          window.currentYouTubePlayer = null;
        }
      }

      if (state.youtubePlayer) {
        try {
          console.log('Cleaning up context YouTube player');
          // Check if player methods are available before calling
          if (typeof state.youtubePlayer.getPlayerState === 'function') {
            state.youtubePlayer.stopVideo();
          }
          if (typeof state.youtubePlayer.destroy === 'function') {
            state.youtubePlayer.destroy();
          }
        } catch (error) {
          console.log('Error destroying context YouTube player:', error);
        }
        dispatch({ type: 'SET_YOUTUBE_PLAYER', payload: null });
      }
    };

    // Always destroy any existing player first
    destroyCurrentPlayer();

    if (state.isVideo && state.videoUrl && window.YT && youtubeRef.current) {
      // Clear the container completely
      youtubeRef.current.innerHTML = '';

      console.log('Creating new YouTube player for:', state.videoUrl);

      // Wait longer to ensure cleanup is complete
      setTimeout(() => {
        if (!youtubeRef.current || !state.videoUrl) return;

        // Extract video ID from URL
        const videoId = state.videoUrl.includes('embed/')
          ? state.videoUrl.split('embed/')[1].split('?')[0]
          : state.videoUrl.split('v=')[1]?.split('&')[0];

        if (videoId) {
          // Create a unique container ID to avoid conflicts
          const playerId = `youtube-player-${Date.now()}`;
          youtubeRef.current.innerHTML = `<div id="${playerId}"></div>`;

          const player = new window.YT.Player(playerId, {
            height: '0',
            width: '0',
            videoId: videoId,
            host: 'https://www.youtube-nocookie.com', // Use privacy-enhanced mode
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              fs: 0,
              cc_load_policy: 0,
              iv_load_policy: 3,
              autohide: 0,
              start: 0,  // Always start from beginning
              origin: window.location.origin // Fix cross-origin errors
            },
            events: {
              onReady: (event: any) => {
                console.log('YouTube player ready for video:', videoId);
                window.currentYouTubePlayer = event.target;
                dispatch({ type: 'SET_YOUTUBE_PLAYER', payload: event.target });
                dispatch({ type: 'SET_ERROR', payload: null }); // Clear any errors
              },
              onStateChange: (event: any) => {
                console.log('YouTube player state changed:', event.data, 'for video:', videoId);
                if (event.data === window.YT.PlayerState.PLAYING) {
                  dispatch({ type: 'PLAY' });
                  dispatch({ type: 'SET_ERROR', payload: null }); // Clear errors on successful play
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  dispatch({ type: 'PAUSE' });
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  console.log('YouTube video ended - handling track end');
                  // Handle video ended based on repeat mode
                  if (state.isRepeat) {
                    console.log('🔄 Repeating YouTube video');
                    event.target.seekTo(0, true);
                    event.target.playVideo();
                  } else if (state.queue.length > 1) {
                    console.log('⏭️ Moving to next track');
                    dispatch({ type: 'NEXT_TRACK' });
                  } else {
                    console.log('⏹️ Pausing - no more tracks');
                    dispatch({ type: 'PAUSE' });
                  }
                }
              },
              onError: (event: any) => {
                console.error('YouTube player error:', event.data);
                const errorMessages: Record<number, string> = {
                  2: 'Invalid video ID',
                  5: 'HTML5 player error',
                  100: 'Video not found',
                  101: 'Video not allowed to be played',
                  150: 'Video not allowed to be played'
                };
                const errorMessage = errorMessages[event.data] || 'Failed to load video';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
                dispatch({ type: 'PAUSE' });
              }
            }
          });
        }
      }, 200); // Longer delay to ensure cleanup is complete
    }
  }, [state.isVideo, state.videoUrl, dispatch]);

  // Cleanup when component unmounts or track changes
  useEffect(() => {
    return () => {
      if (window.currentYouTubePlayer) {
        try {
          console.log('Component cleanup - stopping global YouTube player');
          // Check if player methods are available before calling
          if (typeof window.currentYouTubePlayer.getPlayerState === 'function') {
            window.currentYouTubePlayer.stopVideo();
          }
          if (typeof window.currentYouTubePlayer.destroy === 'function') {
            window.currentYouTubePlayer.destroy();
          }
          window.currentYouTubePlayer = null;
        } catch (error) {
          console.log('Error in global cleanup:', error);
          window.currentYouTubePlayer = null;
        }
      }
      if (state.youtubePlayer) {
        try {
          console.log('Component cleanup - stopping context YouTube player');
          // Check if player methods are available before calling
          if (typeof state.youtubePlayer.getPlayerState === 'function') {
            state.youtubePlayer.stopVideo();
          }
          if (typeof state.youtubePlayer.destroy === 'function') {
            state.youtubePlayer.destroy();
          }
        } catch (error) {
          console.log('Error in context cleanup:', error);
        }
      }
    };
  }, [state.currentTrack?.id]);

  // Update time for YouTube videos
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isVideo && state.youtubePlayer && state.isPlaying) {
      interval = setInterval(() => {
        try {
          const currentTime = state.youtubePlayer.getCurrentTime();
          const duration = state.youtubePlayer.getDuration();

          dispatch({
            type: 'UPDATE_TIME',
            payload: {
              currentTime: currentTime || 0,
              duration: duration || 0
            }
          });
        } catch (error) {
          console.log('Error getting YouTube time:', error);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isVideo, state.youtubePlayer, state.isPlaying, dispatch]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(75);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleProgressChange = (values: number[]) => {
    const newTime = (values[0] / 100) * state.duration;
    console.log('=== PROGRESS CHANGE ===');
    console.log('Slider value:', values[0]);
    console.log('Duration:', state.duration);
    console.log('Calculated new time:', newTime);
    seekTo(newTime);
  };

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handleToggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const handleToggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  if (!state.currentTrack) {
    return (
      <>
        {/* Desktop - Hidden when no track */}
        <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen bg-music-player/95 backdrop-blur-xl border-l border-border/20 p-6">
          <div className="flex flex-col h-full items-center justify-center">
            <Music className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Select a song to start playing</p>
          </div>
        </div>

        {/* Mobile - Hidden when no track */}
        <div className="lg:hidden hidden">
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Player */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="hidden lg:block fixed right-0 top-0 w-80 h-screen bg-music-player/95 backdrop-blur-xl border-l border-border/20 p-6"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <h3 className="text-lg font-semibold text-foreground">Now Playing</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Current Track */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="relative group">
              {state.currentTrack ? (
                <>
                  <motion.div
                    className="w-full aspect-square rounded-2xl shadow-music-card object-cover overflow-hidden relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{
                      duration: 0.3,
                      background: {
                        duration: 3,
                        repeat: state.isPlaying ? Infinity : 0,
                        ease: "linear"
                      }
                    }}
                    animate={{
                      background: state.isPlaying
                        ? [
                          "linear-gradient(45deg, rgba(34,197,94,0.3), rgba(59,130,246,0.3))",
                          "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(168,85,247,0.3))",
                          "linear-gradient(225deg, rgba(168,85,247,0.3), rgba(239,68,68,0.3))",
                          "linear-gradient(315deg, rgba(239,68,68,0.3), rgba(34,197,94,0.3))"
                        ]
                        : ["linear-gradient(45deg, rgba(34,197,94,0.3), rgba(59,130,246,0.3))"]
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    {/* Album Art Background */}
                    <img
                      src={state.currentTrack.thumbnail || "/placeholder.svg"}
                      alt={state.currentTrack.title}
                      className="w-full h-full object-cover opacity-70"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />

                    {/* Animated Music Bars Overlay */}
                    {state.isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-end gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-4">
                          {[...Array(7)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-music-accent to-music-primary rounded-full"
                              animate={{
                                height: state.isPlaying ? [6, 28, 12, 32, 16, 24, 8] : [6],
                              }}
                              transition={{
                                duration: 0.4 + i * 0.1,
                                repeat: state.isPlaying ? Infinity : 0,
                                repeatType: "reverse",
                                ease: "easeInOut",
                                delay: i * 0.1,
                              }}
                              style={{ height: 6 }}
                            />
                          ))}
                        </div>

                        {/* Rotating music note */}
                        <motion.div
                          className="absolute top-4 right-4 text-white/80"
                          animate={{
                            rotate: state.isPlaying ? [0, 360] : 0,
                          }}
                          transition={{
                            duration: 4,
                            repeat: state.isPlaying ? Infinity : 0,
                            ease: "linear",
                          }}
                        >
                          <Music className="w-6 h-6" />
                        </motion.div>
                      </div>
                    )}

                    {/* Pulse Effect for Music */}
                    {state.isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-music-accent"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                  <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full aspect-square rounded-2xl shadow-music-card bg-muted flex items-center justify-center">
                  <Music className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {state.isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center"
            >
              <h4 className="text-xl font-bold text-foreground mb-1 truncate" title={state.currentTrack.title}>
                {state.currentTrack.title}
              </h4>
              <p className="text-muted-foreground truncate" title={state.currentTrack.artist}>
                {state.currentTrack.artist}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1 capitalize">
                {state.currentTrack.source}
              </p>
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-6"
          >
            <Slider
              value={[progressPercentage]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleShuffle}
              className={`transition-colors ${state.isShuffle
                  ? 'text-music-accent'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Shuffle className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previousTrack}
              disabled={state.queue.length === 0}
              className="text-foreground hover:text-music-accent transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              disabled={state.isLoading}
              className="w-12 h-12 bg-music-accent hover:bg-music-accent-hover rounded-full flex items-center justify-center text-white shadow-music-player transition-all duration-300 disabled:opacity-50"
            >
              {state.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTrack}
              disabled={state.queue.length === 0}
              className="text-foreground hover:text-music-accent transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleRepeat}
              className={`transition-colors ${state.isRepeat
                  ? 'text-music-accent'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Repeat className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Volume Control */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <button onClick={handleMuteToggle} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || state.volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              value={[state.volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{Math.round(state.volume)}</span>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-between mt-auto"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Heart className="w-5 h-5" />
            </motion.button>

            <div className="text-xs text-muted-foreground">
              🎵 {state.error ? 'Error' : 'Playing'}
            </div>
          </motion.div>

          {/* Queue Preview */}

        </div>
      </motion.div>

      {/* Mobile Player */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-music-player/95 backdrop-blur-xl border-t border-border/20 p-4"
      >
        <div className="flex items-center gap-3">
          <img
            src={state.currentTrack.thumbnail || "/placeholder.svg"}
            alt={state.currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate" title={state.currentTrack.title}>
              {state.currentTrack.title}
            </h4>
            <p className="text-sm text-muted-foreground truncate" title={state.currentTrack.artist}>
              {state.currentTrack.artist}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previousTrack}
              disabled={state.queue.length === 0}
              className="text-foreground hover:text-music-accent transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              disabled={state.isLoading}
              className="w-10 h-10 bg-music-accent hover:bg-music-accent-hover rounded-full flex items-center justify-center text-white disabled:opacity-50"
            >
              {state.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : state.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTrack}
              disabled={state.queue.length === 0}
              className="text-foreground hover:text-music-accent transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-3">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Repeat Button - Mobile */}
        <div className="flex justify-center gap-4 mt-3">
          <Button
            variant={state.isRepeat ? "default" : "ghost"}
            size="icon"
            aria-label="Toggle Repeat"
            onClick={handleToggleRepeat}
            className={state.isRepeat ? "text-music-accent" : "text-muted-foreground"}
          >
            <Repeat className="w-5 h-5" />
          </Button>
        </div>

        {state.error && (
          <div className="mt-2 text-xs text-red-400 text-center">
            {state.error}
          </div>
        )}
      </motion.div>

      {/* Hidden YouTube Player for API control */}
      <div ref={youtubeRef} style={{ display: 'none' }}></div>
    </>
  );
}