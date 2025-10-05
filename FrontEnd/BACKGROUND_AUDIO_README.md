# Background Audio Playback Feature

## Overview

The music player now supports background audio playback, allowing music to continue playing even when:

- Phone screen is turned off
- App is minimized or in background
- User switches to another tab/app
- Device enters sleep mode

## Features Implemented

### 🎵 **Media Session API Integration**

- Native media controls appear in:
  - Lock screen
  - Notification panel
  - Control center (iOS)
  - Media notification (Android)
- Support for play/pause/next/previous controls
- Display of track metadata (title, artist, artwork)

### 🔋 **Wake Lock Support**

- Prevents screen from going to sleep during playback
- Automatically released when music is paused
- Helps maintain continuous playback

### 🔄 **Service Worker Integration**

- Background script maintains audio state
- Handles app lifecycle events
- Ensures audio continues during navigation

### 📱 **Mobile-Optimized Audio**

- Enhanced HTML5 audio element with `playsInline` attribute
- Cross-origin support for better streaming
- Automatic restart on unexpected pauses

## How to Test

### 1. **Mobile Device Testing**

1. Open the app on your mobile device
2. Start playing a song
3. Turn off the screen - music should continue
4. Use lock screen controls to pause/play/skip
5. Open other apps - music should continue in background

### 2. **Desktop Testing**

1. Start playing music
2. Minimize the browser window
3. Switch to another tab
4. Use system media controls (if available)

### 3. **Browser Tab Testing**

1. Play music in the app
2. Open a new tab and navigate away
3. Music should continue playing
4. Return to the music tab - controls should still work

## Browser Compatibility

### ✅ **Fully Supported**

- Chrome 73+ (Mobile & Desktop)
- Firefox 82+ (Desktop), Firefox 71+ (Android)
- Safari 13+ (iOS & macOS)
- Edge 79+ (Desktop & Mobile)

### ⚠️ **Partial Support**

- Older browsers may not support Media Session API
- Wake Lock may not be available on all devices
- Service Worker features may vary

## Technical Implementation

### Key Components

- **PlayerContext**: Enhanced with Media Session API
- **useBackgroundAudio**: Custom hook for background functionality
- **Service Worker**: Background script for audio maintenance
- **Wake Lock**: Screen sleep prevention

### Browser APIs Used

- Media Session API
- Service Worker API
- Wake Lock API
- Page Visibility API
- beforeunload events

## Troubleshooting

### If background audio doesn't work:

1. **Check browser permissions** - Some browsers require user gesture
2. **Enable autoplay** - Ensure browser allows audio autoplay
3. **Update browser** - Use latest version for best support
4. **Check device settings** - Some devices have background app restrictions

### Common Issues:

- **Audio stops on iOS Safari**: Ensure user has interacted with the page
- **No lock screen controls**: Media Session API may not be supported
- **Battery optimization**: Some Android devices may kill background audio

## Notes

- Background audio works best on HTTPS sites
- Some mobile browsers may have additional restrictions
- Battery optimization settings can affect background playback
- Service Worker needs to be registered (automatic on app load)
