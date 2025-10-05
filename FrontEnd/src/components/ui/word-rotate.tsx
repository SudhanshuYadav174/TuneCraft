"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface WordRotateProps {
  words: string[];
  duration?: number;
  className?: string;
  motionProps?: HTMLMotionProps<"div">;
}

export const WordRotate: React.FC<WordRotateProps> = ({
  words,
  duration = 2500,
  className = "",
  motionProps = {},
}) => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className={`inline-block ${className}`}>
      <motion.div
        key={currentWordIndex}
        initial={{ opacity: 0, y: 20, rotateX: 90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -20, rotateX: -90 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
        {...motionProps}
      >
        <span 
          className="bg-gradient-to-r from-[#A07CFE] via-purple-400 to-[#FE8FB5] bg-clip-text text-transparent font-bold"
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {words[currentWordIndex]}
        </span>
      </motion.div>
    </div>
  );
};