import { motion } from "framer-motion";
import { 
  Home, 
  Compass, 
  Music, 
  Disc3, 
  Radio,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SparklesText } from "@/components/ui/sparkles-text";

const menuItems = [
  { icon: Home, label: "Explore" },
  { icon: Music, label: "Genres" },
  { icon: Disc3, label: "Albums" },
  { icon: Radio, label: "Radio" },
];

interface SidebarProps {
  className?: string;
  onMenuItemClick?: (item: string) => void;
}

export function Sidebar({ className, onMenuItemClick }: SidebarProps) {
  const handleMenuClick = (label: string) => {
    onMenuItemClick?.(label);
  };
  return (
    <motion.aside 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed left-0 top-0 h-screen w-64 p-6 custom-scrollbar overflow-y-auto",
        "bg-music-sidebar border-r border-border/20",
        className
      )}
    >
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center">
          <SparklesText 
            className="font-orbitron text-2xl font-black bg-gradient-to-r from-music-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wider drop-shadow-lg"
            sparklesCount={12}
            colors={{
              first: "#A07CFE",
              second: "#FE8FB5"
            }}
          >
            TUNECRAFT
          </SparklesText>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-6 mb-8 border-b border-border/20 pb-4"
      >
        <button className="text-music-accent font-semibold text-sm">MUSIC</button>
      </motion.div>

      {/* Menu Section */}
      <div className="mb-8">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-xs font-semibold mb-4 tracking-wider"
        >
          MENU
        </motion.h3>
        <nav className="space-y-2">
                    {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 4 }}
                onClick={() => handleMenuClick(item.label)}
                className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-lg text-left transition-all duration-300",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Contact Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-auto"
      >
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => window.location.href = 'mailto:sudhanshuyadav174@gmail.com'}
          className={cn(
            "flex items-center gap-3 w-full p-2 rounded-lg text-left transition-all duration-300",
            "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <Mail className="w-5 h-5" />
          <span className="font-medium">Contact Us</span>
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}