import { Sidebar } from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { MusicPlayer } from "@/components/MusicPlayer";
import { MobileHeader } from "@/components/MobileHeader";
import { motion } from "framer-motion";
import { useState } from "react";

const Index = () => {
  const [currentView, setCurrentView] = useState("Explore");
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuItemClick = (item: string) => {
    setCurrentView(item);
    // Clear search when switching views
    setSearchQuery("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen bg-music-bg overflow-hidden"
    >
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-music-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-music-accent/10 rounded-full blur-2xl"></div>
      </div>
      
      {/* Mobile Header */}
      <MobileHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMenuItemClick={handleMenuItemClick} 
      />
      
      {/* Main Layout */}
      <div className="relative z-10 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar onMenuItemClick={handleMenuItemClick} />
        </div>
        <MainContent 
          currentView={currentView} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <MusicPlayer />
      </div>
    </motion.div>
  );
};

export default Index;
