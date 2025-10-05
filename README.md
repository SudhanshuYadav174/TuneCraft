# 🎵 TuneCraft - Your Ad-Free Music Sanctuary

> **"Music without interruptions. Just you and your favorite songs, all the time."**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-TuneCraft-blue?style=for-the-badge)](https://tunecraft-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/SudhanshuYadav174/TuneCraft)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

## 🌟 The Vision Behind TuneCraft

**TuneCraft was born from a simple frustration:** Why should ads interrupt your perfect music moment?

You know that feeling - you're completely immersed in your favorite song, the beat is perfect, your mood is elevated, and then... *BAM!* An ad destroys your vibe. That magical moment is gone forever.

I built **TuneCraft** to solve this:
- 🚫 **Zero ads** - Your music flows uninterrupted
- 🎯 **No signup required** - Just open and play  
- 💯 **Completely free** - Quality music without paywalls
- 🎨 **Beautiful interface** - Designed for music lovers

**TuneCraft proves that great music experiences don't need ads, accounts, or fees.**

---

# TuneCraft 🎵

A modern, feature-rich music streaming application built with React, TypeScript, and powered by YouTube's API.

## ✨ Features

### 🎶 **Core Music Features**

- **High-Quality Audio Streaming** - Stream music directly from YouTube
- **Background Audio Playback** - Music continues playing when screen is off or app is minimized
- **Advanced Audio Controls** - Play, pause, next, previous, shuffle, repeat
- **Seek Functionality** - Jump to any part of a song with precision
- **Smart Queue Management** - Add songs to queue, reorder, and manage playlists

### 🎵 **Audio Enhancements**

- **Media Session API** - Native media controls in notification panel and lock screen
- **Wake Lock Support** - Prevents screen sleep during playback
- **Service Worker Integration** - Maintains audio state during navigation
- **Auto-Advance** - Automatically plays next song when current song ends
- **Smart Repeat** - Toggle between single song repeat and queue playback

### 🎨 **User Interface**

- **Dynamic Video Background** - Engaging hero section with video background
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions and interactions
- **Modern UI Components** - Built with Shadcn/UI and Tailwind CSS
- **Dark Theme** - Beautiful dark theme optimized for music listening

### 🔍 **Search & Discovery**

- **Powerful Search** - Find any song, artist, or album instantly
- **Genre Filtering** - Browse music by genres
- **Album Collections** - Explore complete albums
- **Trending Content** - Discover what's popular
- **Smart Recommendations** - AI-powered music suggestions

### 📱 **Mobile Optimization**

- **Touch-Friendly Interface** - Optimized for mobile interactions
- **Mobile Search Overlay** - Full-screen search experience on mobile
- **Swipe Gestures** - Intuitive navigation controls
- **Progressive Web App** - Install as an app on mobile devices

## 🛠️ Technology Stack

### **Frontend**

- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Shadcn/UI** - Beautiful and accessible UI components
- **TanStack Query** - Powerful data fetching and caching

### **Backend Integration**

- **YouTube Data API** - Access to millions of songs
- **Node.js Backend** - RESTful API server
- **Audio Streaming** - Direct audio stream handling
- **Real-time Data** - Live search and content updates

### **Modern Web APIs**

- **Media Session API** - Native media controls
- **Wake Lock API** - Screen sleep prevention
- **Service Worker** - Background processing
- **Web Audio API** - Advanced audio control
- **Intersection Observer** - Performance optimizations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SudhanshuYadav174/TuneCraft.git
   cd TuneCraft
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd FrontEnd
   npm install
   ```

3. **Install Backend Dependencies**

   ```bash
   cd ../Backend
   npm install
   ```

4. **Environment Setup**

   ```bash
   # Backend - Create .env file
   YOUTUBE_API_KEY=your_youtube_api_key_here
   PORT=3000

   # Frontend - Create .env file
   VITE_API_URL=http://localhost:3000/api
   ```

5. **Start the Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd Backend
   npm run dev

   # Terminal 2 - Frontend
   cd FrontEnd
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:8081`
   - Backend API: `http://localhost:3000`

## 🎯 Usage

### **Basic Music Playback**

1. Search for any song using the search bar
2. Click on a song to start playing
3. Use player controls for play/pause/next/previous
4. Adjust volume and seek to different parts

### **Advanced Features**

- **Background Playback**: Music continues when you minimize the app or turn off screen
- **Lock Screen Controls**: Control playback from your device's lock screen
- **Queue Management**: Add multiple songs and manage your listening queue
- **Repeat & Shuffle**: Toggle repeat mode and shuffle for varied listening

### **Mobile Experience**

- **Mobile Search**: Tap search icon for full-screen search overlay
- **Touch Controls**: Swipe and tap gestures for easy navigation
- **Responsive Player**: Optimized music player for mobile screens

## 📁 Project Structure

```
TuneCraft/
├── FrontEnd/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── ui/          # Shadcn/UI Components
│   │   │   ├── MainContent.tsx
│   │   │   ├── MusicPlayer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileHeader.tsx
│   │   ├── contexts/        # React Contexts
│   │   │   └── PlayerContext.tsx
│   │   ├── hooks/           # Custom Hooks
│   │   │   ├── useBackgroundAudio.ts
│   │   │   └── use-toast.ts
│   │   ├── services/        # API Services
│   │   │   └── api.ts
│   │   ├── lib/            # Utilities
│   │   └── assets/         # Static Assets
│   ├── public/             # Public Assets
│   └── package.json
├── Backend/                 # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Business Logic
│   │   ├── middleware/     # Express Middleware
│   │   └── utils/         # Backend Utilities
│   └── package.json
└── README.md
```

## 🎵 API Endpoints

### **Search**

- `GET /api/search?q={query}` - Search for music
- `GET /api/search?q={query}&type=genre` - Search by genre
- `GET /api/search?q={query}&type=album` - Search albums

### **Tracks**

- `GET /api/tracks/{id}/stream` - Get audio stream URL
- `GET /api/tracks/trending` - Get trending tracks

### **System**

- `GET /api/health` - Health check
- `GET /api/system/status` - System status

## 🌟 Key Features Showcase

### **Background Audio Playback**

Revolutionary background audio that works even when:

- Phone screen is turned off
- App is minimized
- User switches to other apps
- Device enters sleep mode

### **Advanced Media Controls**

- Native lock screen controls
- Notification panel integration
- Hardware media key support
- Smart seek and skip functionality

### **Responsive Design**

- Mobile-first approach
- Touch-optimized controls
- Adaptive layouts for all screen sizes
- Progressive Web App capabilities

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **YouTube Data API** for providing access to music content
- **Shadcn/UI** for beautiful UI components
- **Framer Motion** for smooth animations
- **React Team** for the amazing framework

## 📞 Support

For support, email sudhanshuyadav174@gmail.com or create an issue on GitHub.

---

**Built with ❤️ by [SudhanshuYadav174](https://github.com/SudhanshuYadav174)**

🎵 _Experience music like never before with TuneCraft_ 🎵
