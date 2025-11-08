// Google Analytics utility functions
// This file helps track custom events in your TuneCraft app

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Get GA Measurement ID from environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Check if Google Analytics is loaded and configured
export const isGALoaded = (): boolean => {
  return (
    !!GA_MEASUREMENT_ID &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  );
};

// Track page views
export const trackPageView = (url: string) => {
  if (isGALoaded()) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (isGALoaded()) {
    window.gtag('event', eventName, eventParams);
  }
};

// Music-specific event tracking
export const analytics = {
  // Track when a song is played
  trackSongPlay: (songTitle: string, artist: string, source: string) => {
    trackEvent('song_play', {
      event_category: 'Music',
      event_label: `${artist} - ${songTitle}`,
      source: source,
    });
  },

  // Track when a song is paused
  trackSongPause: (songTitle: string, artist: string) => {
    trackEvent('song_pause', {
      event_category: 'Music',
      event_label: `${artist} - ${songTitle}`,
    });
  },

  // Track when a song is skipped
  trackSongSkip: (songTitle: string, artist: string) => {
    trackEvent('song_skip', {
      event_category: 'Music',
      event_label: `${artist} - ${songTitle}`,
    });
  },

  // Track search queries
  trackSearch: (query: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  },

  // Track menu navigation
  trackMenuClick: (menuItem: string) => {
    trackEvent('menu_click', {
      event_category: 'Navigation',
      event_label: menuItem,
    });
  },

  // Track trending views
  trackTrendingView: (region: string) => {
    trackEvent('trending_view', {
      event_category: 'Content',
      region: region,
    });
  },

  // Track contact button click
  trackContactClick: () => {
    trackEvent('contact_click', {
      event_category: 'Engagement',
      event_label: 'Contact Us Button',
    });
  },

  // Track errors
  trackError: (errorMessage: string, errorType: string) => {
    trackEvent('error', {
      event_category: 'Error',
      error_message: errorMessage,
      error_type: errorType,
    });
  },
};

export default analytics;
