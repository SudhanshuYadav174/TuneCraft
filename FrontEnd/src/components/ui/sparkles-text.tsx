"use client";

import React from "react";
import { motion } from "framer-motion";

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

interface SparklesTextProps {
  children: string;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

export const SparklesText: React.FC<SparklesTextProps> = ({
  children,
  className = "",
  sparklesCount = 10,
  colors = {
    first: "#A07CFE",
    second: "#FE8FB5",
  },
}) => {
  const [sparkles, setSparkles] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
  }>>([]);

  const textRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();
    const newSparkles = Array.from({ length: sparklesCount }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      color: Math.random() > 0.5 ? colors.first : colors.second,
      delay: Math.random() * 2,
    }));

    setSparkles(newSparkles);
  }, [children, sparklesCount, colors.first, colors.second]);

  return (
    <span className={`relative inline-block ${className}`} ref={textRef}>
      {children}
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          color={sparkle.color}
          delay={sparkle.delay}
        />
      ))}
    </span>
  );
};