import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { SparklesText } from "@/components/ui/sparkles-text";
import { useState } from "react";

interface MobileHeaderProps {
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMenuItemClick?: (item: string) => void;
}

export function MobileHeader({ className, searchQuery = "", onSearchChange, onMenuItemClick }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-music-sidebar/95 backdrop-blur-xl border-b border-border/20"
      >
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-music-sidebar">
              <Sidebar className="relative h-full" onMenuItemClick={onMenuItemClick} />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center">
            <SparklesText 
              className="font-orbitron text-lg font-black bg-gradient-to-r from-music-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide"
              sparklesCount={8}
              colors={{
                first: "#A07CFE",
                second: "#FE8FB5"
              }}
            >
              TUNECRAFT
            </SparklesText>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleSearchToggle}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-40 p-4 bg-music-sidebar/95 backdrop-blur-xl border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for songs, artists..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-music-card border-border/20 focus:border-music-accent"
                  autoFocus
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={handleSearchToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}