import { useEffect, useRef } from 'react';

interface BackgroundAudioOptions {
  isPlaying: boolean;
  currentTrack: any;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const useBackgroundAudio = ({
  isPlaying,
  currentTrack,
  onPlay,
  onPause,
  onNext,
  onPrevious
}: BackgroundAudioOptions) => {
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const isRegisteredRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Create and maintain audio context to prevent suspension
  useEffect(() => {
    if (isPlaying && !audioContextRef.current) {
      try {
        // Create AudioContext to prevent audio suspension
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        console.log('Audio context created and resumed for background playback');
      } catch (error) {
        console.log('Audio context creation failed:', error);
      }
    }
    
    // Keep audio context active while playing
    if (isPlaying && audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }
    }
    
    return () => {
      // Don't close audio context when component unmounts if audio is playing
      if (!isPlaying && audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPlaying]);

  // Implement Wake Lock API to keep screen partially active for audio playback
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          // Request a screen wake lock for keeping audio alive
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock acquired for background audio');
          
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock released');
          });
        } catch (err: any) {
          console.log('Wake Lock request failed:', err.message);
          // Fallback: Use a hidden video element to keep audio alive on mobile
          if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
            createDummyVideo();
          }
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released manually');
        } catch (err) {
          console.log('Wake Lock release failed:', err);
        }
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && isPlaying && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Fallback: Create a hidden video element to prevent audio suspension on mobile
  const createDummyVideo = () => {
    try {
      let dummyVideo = document.getElementById('dummy-video-keepalive') as HTMLVideoElement;
      
      if (!dummyVideo) {
        dummyVideo = document.createElement('video');
        dummyVideo.id = 'dummy-video-keepalive';
        dummyVideo.style.position = 'fixed';
        dummyVideo.style.top = '-9999px';
        dummyVideo.style.left = '-9999px';
        dummyVideo.style.width = '1px';
        dummyVideo.style.height = '1px';
        dummyVideo.style.opacity = '0';
        dummyVideo.muted = true;
        dummyVideo.loop = true;
        dummyVideo.playsInline = true;
        
        // Create a minimal video data URL (1x1 pixel, 1 second)
        dummyVideo.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAA';
        
        document.body.appendChild(dummyVideo);
      }
      
      dummyVideo.play().catch(err => {
        console.log('Dummy video play failed:', err);
      });
      
      console.log('Dummy video keepalive created for mobile');
    } catch (error) {
      console.log('Failed to create dummy video:', error);
    }
  };

  // Register Service Worker only once
  useEffect(() => {
    if ('serviceWorker' in navigator && !isRegisteredRef.current) {
      isRegisteredRef.current = true;
      
      // Check if already registered
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const existingReg = registrations.find(reg => reg.scope.includes(window.location.origin));
        
        if (existingReg) {
          console.log('Service Worker already registered, using existing registration');
          swRegistrationRef.current = existingReg;
        } else {
          // Register new service worker with cache buster
          const timestamp = new Date().getTime();
          navigator.serviceWorker.register(`/sw.js?v=${timestamp}`)
            .then((registration) => {
              console.log('Service Worker v2.0.0 registered:', registration);
              swRegistrationRef.current = registration;
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
              isRegisteredRef.current = false; // Reset on failure
            });
        }
      });
    }
  }, []); // Remove dependencies to prevent re-registration

  // Set up message listeners separately
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'AUDIO_CONTROL') {
          switch (event.data.action) {
            case 'play':
              onPlay();
              break;
            case 'pause':
              onPause();
              break;
            case 'next':
              onNext();
              break;
            case 'previous':
              onPrevious();
              break;
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [onPlay, onPause, onNext, onPrevious]);

  // Update service worker with current audio state
  useEffect(() => {
    if (swRegistrationRef.current?.active) {
      swRegistrationRef.current.active.postMessage({
        type: 'AUDIO_STATE_UPDATE',
        isPlaying,
        currentTrack
      });
    }
  }, [isPlaying, currentTrack]);

  // Handle page focus/blur to maintain audio playback
  useEffect(() => {
    const handleFocus = () => {
      // Page gained focus - audio should continue playing
      if (isPlaying) {
        console.log('Page focused - ensuring audio continues');
        
        // Notify service worker of activity
        if (swRegistrationRef.current?.active) {
          swRegistrationRef.current.active.postMessage({
            type: 'MAINTAIN_AUDIO',
            track: currentTrack,
            isPlaying
          });
        }
      }
    };

    const handleBlur = () => {
      // Page lost focus - audio should continue playing in background
      if (isPlaying) {
        console.log('Page blurred - maintaining background audio');
        
        // Send message to service worker to maintain audio
        if (swRegistrationRef.current?.active) {
          swRegistrationRef.current.active.postMessage({
            type: 'MAINTAIN_AUDIO',
            track: currentTrack,
            isPlaying: true
          });
        }
      }
    };

    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden
        handleBlur();
      } else {
        // Page is now visible
        handleFocus();
      }
    };

    // More aggressive keep-alive for background audio
    const keepAliveInterval = setInterval(() => {
      if (isPlaying && swRegistrationRef.current?.active) {
        swRegistrationRef.current.active.postMessage({
          type: 'KEEP_ALIVE',
          timestamp: Date.now(),
          isPlaying: true
        });
      }
    }, 3000); // Send keep-alive every 3 seconds when playing

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(keepAliveInterval);
    };
  }, [isPlaying, currentTrack]);

  // Handle beforeunload to maintain audio
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isPlaying) {
        // Try to maintain audio playback even during navigation
        event.preventDefault();
        event.returnValue = 'Music is playing. Continue in background?';
        
        // Send audio state to service worker
        if (swRegistrationRef.current?.active) {
          swRegistrationRef.current.active.postMessage({
            type: 'SAVE_AUDIO_STATE',
            track: currentTrack,
            isPlaying
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying, currentTrack]);

  return {
    serviceWorkerRegistration: swRegistrationRef.current
  };
};