"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface SparkleProps {
  x: number;
  y: number;
  color: string;
  delay: number;
}

const Sparkle: React.FC<SparkleProps> = ({ x, y, color, delay }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
};

interface SparklesWordRotateProps {
  words: string[];
  duration?: number;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
  motionProps?: HTMLMotionProps<"div">;
}

export const SparklesWordRotate: React.FC<SparklesWordRotateProps> = ({
  words,
  duration = 2500,
  className = "",
  sparklesCount = 10,
  colors = {
    first: "#A07CFE",
    second: "#FE8FB5",
  },
  motionProps = {},
}) => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [sparkles, setSparkles] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
  }>>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  React.useEffect(() => {
    const generateSparkles = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newSparkles = [];
      
      for (let i = 0; i < sparklesCount; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          color: i % 2 === 0 ? colors.first : colors.second,
          delay: Math.random() * 2,
        });
      }
      
      setSparkles(newSparkles);
    };

    generateSparkles();
    const resizeObserver = new ResizeObserver(generateSparkles);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [sparklesCount, colors.first, colors.second, currentWordIndex]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          color={sparkle.color}
          delay={sparkle.delay}
        />
      ))}
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
        className="text-white"
        {...motionProps}
      >
        <span 
          className="bg-gradient-to-r from-[#A07CFE] to-[#FE8FB5] bg-clip-text text-transparent"
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