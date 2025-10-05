import { motion } from "framer-motion";
import { Search, Bell, User, Play, MoreHorizontal, Music, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoxReveal } from "@/components/ui/box-reveal";
import { WordRotate } from "@/components/ui/word-rotate";
import { SparklesText } from "@/components/ui/sparkles-text";
import { SparklesWordRotate } from "@/components/ui/sparkles-word-rotate";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService, Track } from "@/services/api";
import { usePlayer } from "@/contexts/PlayerContext";

interface MainContentProps {
  className?: string;
  currentView?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function MainContent({ 
  className, 
  currentView = "Explore", 
  searchQuery: externalSearchQuery = "",
  onSearchChange: externalOnSearchChange
}: MainContentProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { playTrack } = usePlayer();

  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery || internalSearchQuery;
  const setSearchQuery = externalOnSearchChange || setInternalSearchQuery;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch content based on current view
  const getTrendingQuery = () => {
    switch (currentView) {
      case "Genres":
        return "pop rock hip hop electronic jazz";
      case "Albums":
        return "album full album complete";
      case "Radio":
        return "live radio mix playlist";
      default:
        return "";
    }
  };

  // Fetch trending tracks or genre-specific content
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-tracks', currentView],
    queryFn: async () => {
      const query = getTrendingQuery();
      if (query) {
        const searchResult = await apiService.searchTracks(query, 'youtube', 1, 20);
        return { tracks: searchResult.tracks };
      }
      const trendingResult = await apiService.getTrendingTracks('youtube', 20);
      return { tracks: trendingResult.tracks };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search tracks when user types
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search-tracks', debouncedQuery],
    queryFn: () => apiService.searchTracks(debouncedQuery, 'youtube', 1, 20),
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handlePlayTrack = async (track: Track) => {
    const tracksToPlay = searchData?.tracks || trendingData?.tracks || [];
    await playTrack(track, tracksToPlay);
  };

  const formatDuration = (duration: string | number | null) => {
    if (!duration) return "3:45";

    // If duration is a number (seconds), convert it directly
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // If duration is a string, try to parse ISO 8601 format PT4M13S
    if (typeof duration === 'string') {
      const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const minutes = parseInt(match[1] || '0');
        const seconds = parseInt(match[2] || '0');
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    return "3:45";
  };

  const displayTracks = searchData?.tracks || trendingData?.tracks || [];
  const isLoading = searchLoading || trendingLoading;

  return (
    <div className="flex-1 lg:ml-64 lg:mr-80 p-4 lg:p-6 pt-20 lg:pt-6 min-h-screen bg-music-bg custom-scrollbar overflow-y-auto">
        {/* Header - Desktop Only */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-music-card border-border/20 focus:border-music-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mb-8 lg:mb-12 rounded-2xl lg:rounded-3xl overflow-hidden music-card group bg-gradient-to-r from-music-primary to-music-accent min-h-[400px] lg:min-h-[500px]"
      >
        <div className="absolute inset-0">
          <video
            src="/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Hero video failed to load:', e);
              // Fallback to a solid color background if video fails
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 lg:p-16 flex items-center min-h-[400px] lg:min-h-[500px]">
          <div className="max-w-4xl w-full">
            <BoxReveal boxColor="transparent" duration={0.5} delay={0.2}>
              <p className="text-music-accent font-semibold mb-2 text-sm lg:text-base">🎵 Ad-Free Music Streaming</p>
            </BoxReveal>
            
            <BoxReveal boxColor="transparent" duration={0.5} delay={0.4}>
              <h1 className="text-3xl lg:text-6xl font-bold text-white mb-4">
                <SparklesText 
                  sparklesCount={10}
                  colors={{
                    first: "#A07CFE",
                    second: "#FE8FB5"
                  }}
                >
                  Music Without
                </SparklesText>
              </h1>
            </BoxReveal>
            
            <BoxReveal boxColor="transparent" duration={0.5} delay={0.6}>
              <h1 className="text-3xl lg:text-6xl font-bold text-white mb-6 relative">
                <div className="relative inline-block">
                  {/* Sparkles background - invisible text but visible sparkles */}
                  <div className="absolute inset-0 opacity-0 pointer-events-none">
                    <SparklesText 
                      sparklesCount={8}
                      colors={{ first: "#A07CFE", second: "#FE8FB5" }}
                    >
                      Interruptions
                    </SparklesText>
                  </div>
                  {/* Visible rotating text */}
                  <WordRotate 
                    words={["Interruptions", "Limits", "Ads", "Barriers"]} 
                    duration={3000}
                    className="inline-block relative z-10"
                  />
                </div>
              </h1>
            </BoxReveal>
            
            <BoxReveal boxColor="transparent" duration={0.5} delay={0.8}>
              <p className="text-white/60 mb-6 lg:mb-8 text-sm lg:text-base">Your music sanctuary - where every song flows uninterrupted</p>
            </BoxReveal>

            <BoxReveal boxColor="transparent" duration={0.5} delay={1.0}>
              <div className="flex items-center gap-3 lg:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("trending music")}
                  className="bg-music-accent hover:bg-music-accent-hover text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-semibold text-sm lg:text-base transition-all duration-300"
                >
                  <SparklesText 
                    sparklesCount={6}
                    colors={{
                      first: "#A07CFE",
                      second: "#FE8FB5"
                    }}
                  >
                    Start Streaming
                  </SparklesText>
                </motion.button>
              </div>
            </BoxReveal>
          </div>
        </div>
      </motion.section>

      {/* Current Section Title */}
      <section className="mb-8 lg:mb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mb-4 lg:mb-6"
        >
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : currentView === "Explore" 
                ? "Trending Music"
                : currentView === "Genres"
                  ? "Popular Genres"
                  : currentView === "Albums"
                    ? "Featured Albums"
                    : currentView === "Radio"
                      ? "Radio & Playlists"
                      : "Trending Music"
            }
          </h2>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="text-music-accent hover:text-music-accent-hover text-sm"
            >
              Clear Search
            </Button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-music-card rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : displayTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer bg-music-card rounded-xl p-4 hover:bg-music-card/80 transition-all duration-300"
                onClick={() => handlePlayTrack(track)}
              >
                <div className="relative mb-3">
                  <img
                    src={track.thumbnail || "/placeholder.svg"}
                    alt={track.title}
                    className="w-full aspect-square rounded-lg object-cover shadow-music-card group-hover:shadow-music-hover transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground truncate text-sm mb-1" title={track.title}>
                  {track.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate" title={track.artist}>
                  {track.artist}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Music className="w-3 h-3" />
                    <span className="capitalize">{track.source}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favorites logic here
                    }}
                    className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "No tracks found. Try a different search term." : "No trending tracks available"}
            </p>
          </div>
        )}
      </section>
      </div>
  );
}

export { MainContent };