import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { useBackgroundAudio } from '@/hooks/useBackgroundAudio';

// Global YouTube player reference
declare global {
  interface Window {
    currentYouTubePlayer: any;
  }
}
import { Track } from '../services/api';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  isShuffle: boolean;
  isRepeat: boolean;
  isVideo: boolean;
  videoUrl: string | null;
  youtubePlayer: any | null;
}

export type PlayerAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY_PAUSE' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'ADD_TO_QUEUE'; payload: Track }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_SEARCH_RESULTS'; payload: Track[] }
  | { type: 'SET_VIDEO_MODE'; payload: { isVideo: boolean; videoUrl?: string } }
  | { type: 'SET_YOUTUBE_PLAYER'; payload: any }
  | { type: 'UPDATE_TIME'; payload: { currentTime: number; duration: number } };

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 75,
  currentTime: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,
  isLoading: false,
  error: null,
  isShuffle: false,
  isRepeat: false,
  isVideo: false,
  videoUrl: null,
  youtubePlayer: null,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        currentTime: 0,
        duration: 0,
        error: null,
      };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE_PLAY_PAUSE':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };
    case 'NEXT_TRACK':
      let nextIndex: number;
      if (state.isShuffle) {
        // For shuffle, pick a random track that's not the current one
        const availableIndices = state.queue
          .map((_, index) => index)
          .filter(index => index !== state.currentIndex);
        nextIndex = availableIndices.length > 0 
          ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
          : 0;
      } else {
        // For normal progression, wrap to beginning if at end
        nextIndex = (state.currentIndex + 1) % state.queue.length;
      }
      
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex] || null,
        currentTime: 0,
        duration: 0,
        isVideo: false,
        videoUrl: null,
        youtubePlayer: null,
      };
    case 'PREVIOUS_TRACK':
      const prevIndex = state.currentIndex - 1 < 0
        ? state.queue.length - 1
        : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: state.queue[prevIndex] || null,
        currentTime: 0,
        duration: 0,
        isVideo: false,
        videoUrl: null,
        youtubePlayer: null,
      };
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
        currentTrack: state.queue[action.payload] || null,
        currentTime: 0,
        duration: 0,
        isVideo: false,
        videoUrl: null,
        youtubePlayer: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffle: !state.isShuffle };
    case 'TOGGLE_REPEAT':
      return { ...state, isRepeat: !state.isRepeat };
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
        currentIndex: -1,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      };
    case 'SET_VIDEO_MODE':
      return {
        ...state,
        isVideo: action.payload.isVideo,
        videoUrl: action.payload.videoUrl,
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration,
      };
    case 'SET_YOUTUBE_PLAYER':
      return {
        ...state,
        youtubePlayer: action.payload,
      };
    default:
      return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  formatTime: (seconds: number) => string;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: React.ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simplified seeking function
  const performSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Handle YouTube video seeking
    if (state.isVideo && state.youtubePlayer) {
      try {
        state.youtubePlayer.seekTo(time, true);
        dispatch({ type: 'SET_CURRENT_TIME', payload: time });
        return;
      } catch (error) {
        console.error('YouTube seek error:', error);
        return;
      }
    }

    // Handle audio seeking with simple approach
    if (audio.duration && time >= 0 && time <= audio.duration) {
      isSeekingRef.current = true;
      
      try {
        audio.currentTime = time;
        dispatch({ type: 'SET_CURRENT_TIME', payload: time });
        
        // Clear seeking flag after brief delay
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Audio seek error:', error);
        isSeekingRef.current = false;
      }
    }
  };

  // Background audio support
  const backgroundAudio = useBackgroundAudio({
    isPlaying: state.isPlaying,
    currentTrack: state.currentTrack,
    onPlay: () => dispatch({ type: 'PLAY' }),
    onPause: () => dispatch({ type: 'PAUSE' }),
    onNext: () => {
      if (state.queue.length > 0) {
        dispatch({ type: 'NEXT_TRACK' });
      }
    },
    onPrevious: () => {
      if (state.queue.length > 0) {
        dispatch({ type: 'PREVIOUS_TRACK' });
      }
    }
  });

  // Enhanced Media Session API for mobile background controls
  useEffect(() => {
    if ('mediaSession' in navigator && state.currentTrack) {
      const { mediaSession } = navigator;
      
      console.log('Media Session API configured for background playback');
      
      // Enhanced metadata for mobile notification panel
      mediaSession.metadata = new MediaMetadata({
        title: state.currentTrack.title || 'Unknown Title',
        artist: state.currentTrack.artist || 'Unknown Artist',
        album: 'TuneCraft',
        artwork: [
          {
            src: state.currentTrack.thumbnail || '/tunecraft-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: state.currentTrack.thumbnail || '/tunecraft-logo.png',
            sizes: '256x256', 
            type: 'image/png'
          },
          {
            src: state.currentTrack.thumbnail || '/tunecraft-logo.png',
            sizes: '128x128',
            type: 'image/png'
          }
        ]
      });

      // Enhanced action handlers for mobile
      mediaSession.setActionHandler('play', () => {
        console.log('Media Session: Play action triggered');
        dispatch({ type: 'PLAY' });
      });

      mediaSession.setActionHandler('pause', () => {
        console.log('Media Session: Pause action triggered');
        dispatch({ type: 'PAUSE' });
      });

      mediaSession.setActionHandler('previoustrack', () => {
        console.log('Media Session: Previous track action triggered');
        if (state.queue.length > 0) {
          dispatch({ type: 'PREVIOUS_TRACK' });
        }
      });

      mediaSession.setActionHandler('nexttrack', () => {
        console.log('Media Session: Next track action triggered');
        if (state.queue.length > 0) {
          dispatch({ type: 'NEXT_TRACK' });
        }
      });

      mediaSession.setActionHandler('nexttrack', () => {
        if (state.queue.length > 0) {
          dispatch({ type: 'NEXT_TRACK' });
        }
      });

      mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          performSeek(details.seekTime);
        }
      });

      // Update playback state
      mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      // Update position state with validation
      if ('setPositionState' in mediaSession && state.duration > 0) {
        const validPosition = Math.min(Math.max(state.currentTime, 0), state.duration);
        try {
          mediaSession.setPositionState({
            duration: state.duration,
            playbackRate: 1,
            position: validPosition
          });
        } catch (error) {
          console.warn('Failed to set MediaSession position state:', error);
        }
      }
    }
  }, [state.currentTrack, state.isPlaying, state.currentTime, state.duration, state.queue.length]);

  // Handle visibility changes to prevent audio stopping
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio || !state.isPlaying) return;

      // On mobile browsers, explicitly resume playback when page becomes visible again
      if (!document.hidden && audio.paused && state.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Failed to resume playback after visibility change:', error);
          });
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prevent page unload if music is playing (optional - can be removed if too intrusive)
      if (state.isPlaying) {
        e.preventDefault();
        e.returnValue = 'Music is currently playing. Are you sure you want to leave?';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isPlaying]);

  // Enhanced background playback and wake lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && state.isPlaying) {
        try {
          // Release existing wake lock first
          if (wakeLockRef.current) {
            await wakeLockRef.current.release();
          }
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake lock acquired for background playback');
        } catch (error) {
          console.warn('Failed to acquire wake lock:', error);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake lock released');
        } catch (error) {
          console.warn('Error releasing wake lock:', error);
        }
      }
    };

    // Enhanced mobile visibility change handling
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      
      if (document.hidden && state.isPlaying) {
        // Page is hidden but music should continue
        console.log('Page hidden - ensuring audio continues in background');
        
        // Force Media Session to stay active on mobile
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        
        // Prevent audio pause on mobile browsers
        if (audio && !audio.paused) {
          // Keep audio element playing
          audio.setAttribute('data-background-playing', 'true');
        }
        
      } else if (!document.hidden && state.isPlaying) {
        // Page became visible - ensure audio continues
        console.log('Page visible - re-acquiring wake lock');
        requestWakeLock();
        
        // Resume audio if it was paused during background on mobile
        if (audio && audio.paused && audio.getAttribute('data-background-playing') === 'true') {
          console.log('Resuming audio after returning to foreground');
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn('Failed to resume audio on foreground return:', error);
            });
          }
          audio.removeAttribute('data-background-playing');
        }
      }
    };

    if (state.isPlaying) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isPlaying]);

  // Enhanced Media Session API for better background playback control
  useEffect(() => {
    if ('mediaSession' in navigator && state.currentTrack?.id) {
      // Set metadata for lock screen and notification controls
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.currentTrack?.title || 'Unknown Title',
        artist: state.currentTrack?.artist || 'Unknown Artist',
        album: 'TuneCraft',
        artwork: [
          {
            src: state.currentTrack?.thumbnail || '/tunecraft-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: state.currentTrack?.thumbnail || '/tunecraft-logo.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      });

      // Set playback state for system integration
      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      // Set position state for better control integration
      if ('setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: state.duration || 0,
            playbackRate: 1,
            position: state.currentTime || 0
          });
        } catch (error) {
          console.warn('Position state not supported:', error);
        }
      }

      // Set up action handlers for lock screen controls
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          console.log('Media Session: Play action');
          dispatch({ type: 'PLAY' });
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log('Media Session: Pause action');  
          dispatch({ type: 'PAUSE' });
        });
        
        // Always enable next/previous even with single track
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          console.log('Media Session: Previous track');
          dispatch({ type: 'PREVIOUS_TRACK' });
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          console.log('Media Session: Next track');
          dispatch({ type: 'NEXT_TRACK' });
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          console.log('Media Session: Stop action');
          dispatch({ type: 'PAUSE' });
        });

        // Optional seek handlers
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          console.log('Media Session: Seek backward');
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
          }
        });
        
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          console.log('Media Session: Seek forward');
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + (details.seekOffset || 10));
          }
        });

        console.log('Media Session API configured for background playback');
      } catch (error) {
        console.warn('Media Session setup failed:', error);
      }
    }

    return () => {
      // Clean up media session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        
        // Clear action handlers
        try {
          ['play', 'pause', 'previoustrack', 'nexttrack', 'stop', 'seekbackward', 'seekforward'].forEach(action => {
            navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [state.currentTrack, state.isPlaying, state.currentTime, state.duration, dispatch, state.queue.length]);

  // Regularly update position state for Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && state.isPlaying) {
      const interval = setInterval(() => {
        try {
          navigator.mediaSession.setPositionState({
            duration: state.duration || 0,
            playbackRate: 1,
            position: state.currentTime || 0
          });
        } catch (error) {
          // Ignore position update errors
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [state.isPlaying, state.currentTime, state.duration]);

  // Update audio element when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume / 100;
    }
  }, [state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      // Don't update time during seeking to prevent interference
      if (isSeekingRef.current) {
        console.log('Skipping time update during seek');
        return;
      }
      
      const currentTime = audio.currentTime;
      if (!isNaN(currentTime) && currentTime !== state.currentTime) {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
      }
    };

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    };

    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const handleError = () => {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
      dispatch({ type: 'PAUSE' });
    };

    const handleEnded = () => {
      // Only handle audio ended events for non-video tracks
      if (state.isVideo) {
        console.log('Ignoring audio ended event for video track');
        return;
      }
      
      console.log('🎵 Audio track ended - Repeat:', state.isRepeat, 'Queue length:', state.queue.length, 'Current index:', state.currentIndex);
      
      if (state.isRepeat) {
        // Repeat current track
        console.log('🔄 Repeating current track');
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      } else if (state.queue.length > 1 && state.currentIndex < state.queue.length - 1) {
        // Move to next track if there's a next track available
        console.log('⏭️ Auto-advancing to next track');
        dispatch({ type: 'NEXT_TRACK' });
      } else if (state.queue.length > 1 && state.isShuffle) {
        // If shuffle is on and we've reached the end, keep playing random tracks
        console.log('🔀 Shuffling to random track');
        dispatch({ type: 'NEXT_TRACK' });
      } else {
        // Single track or end of queue - stop playback
        console.log('⏹️ End of playback - pausing');
        dispatch({ type: 'PAUSE' });
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [state.isRepeat, state.currentIndex, state.queue.length, state.isShuffle]);

  // Handle play/pause state changes with background audio support
  useEffect(() => {
    if (state.isVideo && state.youtubePlayer) {
      // Handle YouTube video play/pause
      if (state.isPlaying) {
        state.youtubePlayer.playVideo();
      } else {
        state.youtubePlayer.pauseVideo();
      }
    } else {
      // Handle audio play/pause with enhanced background support
      const audio = audioRef.current;
      if (!audio) return;

      if (state.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing successfully');
              // Ensure audio continues even when page is not visible
              audio.addEventListener('pause', (e) => {
                // If audio was paused but state says it should be playing, restart it
                if (state.isPlaying && !document.hidden) {
                  console.log('Audio was paused unexpectedly, restarting...');
                  setTimeout(() => {
                    if (state.isPlaying && audio.paused && audio.readyState >= 2) {
                      audio.play().catch(console.error);
                    }
                  }, 100);
                }
              });
            })
            .catch((error) => {
              // Handle different types of play failures gracefully
              if (error.name === 'AbortError') {
                console.warn('Play was interrupted (media removed):', error.message);
                // Don't dispatch error for aborted play requests - this is normal during song changes
                return;
              } else if (error.name === 'NotAllowedError') {
                console.warn('Play blocked by browser policy:', error.message);
                dispatch({ type: 'SET_ERROR', payload: 'Playback blocked - click to enable' });
                dispatch({ type: 'PAUSE' });
              } else if (error.name === 'NotSupportedError') {
                console.warn('Media format not supported:', error.message);
                dispatch({ type: 'SET_ERROR', payload: 'Audio format not supported' });
                dispatch({ type: 'PAUSE' });
              } else {
                console.error('Play failed:', error);
                // Only show user-facing error for unexpected failures
                if (!error.message.includes('removed from the document')) {
                  dispatch({ type: 'SET_ERROR', payload: 'Playback failed' });
                  dispatch({ type: 'PAUSE' });
                }
              }
            });
        }
      } else {
        // Only pause if audio element is still valid and attached
        try {
          if (audio.paused === false) {
            audio.pause();
          }
        } catch (error) {
          console.warn('Pause failed (media may be removed):', error);
        }
      }
    }
  }, [state.isPlaying, state.youtubePlayer, state.isVideo]);

  // Load new track when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    // Don't reload track if we're just seeking
    if (isSeekingRef.current) return;

    console.log('Loading new track:', state.currentTrack.title);
    const wasPlaying = state.isPlaying;

    const loadTrack = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Clean up any existing video state first
        dispatch({ type: 'SET_VIDEO_MODE', payload: { isVideo: false, videoUrl: null } });
        
        // Stop and cleanup previous YouTube player with enhanced error handling
        if (state.youtubePlayer) {
          try {
            console.log('Cleaning up previous YouTube player');
            // Check if methods exist before calling them to prevent errors
            if (typeof state.youtubePlayer.stopVideo === 'function') {
              state.youtubePlayer.stopVideo();
            }
            if (typeof state.youtubePlayer.destroy === 'function') {
              state.youtubePlayer.destroy();
            }
          } catch (error) {
            console.log('Error cleaning up YouTube player (safe to ignore):', error);
          } finally {
            dispatch({ type: 'SET_YOUTUBE_PLAYER', payload: null });
          }
        }

        // Clear global YouTube player reference with enhanced error handling
        if (window.currentYouTubePlayer) {
          try {
            // Check if player is still valid before calling methods
            if (typeof window.currentYouTubePlayer.stopVideo === 'function') {
              window.currentYouTubePlayer.stopVideo();
            }
            if (typeof window.currentYouTubePlayer.destroy === 'function') {
              window.currentYouTubePlayer.destroy();
            }
          } catch (error) {
            console.log('Error cleaning up global YouTube player (safe to ignore):', error);
          } finally {
            window.currentYouTubePlayer = null;
          }
        }

        // Reset player state
        dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
        dispatch({ type: 'SET_DURATION', payload: 0 });

        // For YouTube tracks, use direct embed for faster loading
        if (state.currentTrack.source === 'youtube') {
          console.log('Loading YouTube track:', state.currentTrack.id, state.currentTrack.title);
          
          // Use direct YouTube embed URL - much faster than server-side processing
          const embedUrl = `https://www.youtube-nocookie.com/embed/${state.currentTrack.id}`;
          
          console.log('Using direct YouTube embed:', embedUrl);
          
          // Always use video mode for YouTube (YouTube API player)
          dispatch({ type: 'SET_VIDEO_MODE', payload: { isVideo: true, videoUrl: embedUrl } });
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors
        } else if (state.currentTrack.source === 'soundcloud') {
          // For SoundCloud, fetch stream URL from backend
          try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_BASE_URL}/tracks/${state.currentTrack.id}/stream?source=soundcloud`);
            
            if (!response.ok) {
              throw new Error('Failed to get stream URL');
            }
            
            const { streamUrl, duration } = await response.json();
            
            dispatch({ type: 'SET_VIDEO_MODE', payload: { isVideo: false, videoUrl: null } });
            
            // Pause current audio before loading new source
            if (!audio.paused) {
              audio.pause();
            }
            
            audio.src = streamUrl;
            audio.load();
            
            if (duration && duration > 0) {
              dispatch({ type: 'SET_DURATION', payload: duration });
            }
            
            // Auto-play if we were playing before the track change
            if (wasPlaying) {
              const handleCanPlay = () => {
                audio.removeEventListener('canplay', handleCanPlay);
                dispatch({ type: 'PLAY' });
              };
              audio.addEventListener('canplay', handleCanPlay);
            }
            
            dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors
          } catch (error) {
            console.error('Failed to load SoundCloud track:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load track' });
          }
        } else {
          // Unknown source
          console.error('Unknown track source:', state.currentTrack.source);
          dispatch({ type: 'SET_ERROR', payload: 'Unsupported audio source' });
        }

      } catch (error) {
        console.error('Failed to load track:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load track' });
      }
    };

    loadTrack();
  }, [state.currentTrack]);

  const playTrack = async (track: Track, queue?: Track[]) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });

    if (queue) {
      dispatch({ type: 'SET_QUEUE', payload: queue });
      const trackIndex = queue.findIndex(t => t.id === track.id);
      dispatch({ type: 'SET_CURRENT_INDEX', payload: trackIndex });
    }

    // Start playing
    dispatch({ type: 'PLAY' });
  };

  const togglePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
  };

  const nextTrack = () => {
    if (state.queue.length > 0) {
      dispatch({ type: 'NEXT_TRACK' });
    }
  };

  const previousTrack = () => {
    if (state.queue.length > 0) {
      dispatch({ type: 'PREVIOUS_TRACK' });
    }
  };

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const seekTo = (time: number) => {
    performSeek(time);
  };

  // Cleanup effect for timeouts and references
  useEffect(() => {
    return () => {
      // Clear seeking timeout on unmount
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      
      // Release wake lock on unmount
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const contextValue: PlayerContextType = {
    state,
    dispatch,
    audioRef,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
    formatTime,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
        autoPlay={false}
        controlsList="nodownload"
        data-webkit-playsinline="true"
        data-x-webkit-airplay="allow"
        data-keepalive="true"
        onSuspend={(e) => {
          // Prevent audio suspension on mobile
          console.log('Audio suspend event - attempting to maintain playback');
          if (state.isPlaying) {
            const audio = e.currentTarget;
            setTimeout(() => {
              if (state.isPlaying && audio.paused) {
                audio.play().catch(err => console.log('Resume after suspend failed:', err));
              }
            }, 100);
          }
        }}
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
      />
    </PlayerContext.Provider>
  );
};