"use client";
import React from "react";
import { motion } from "framer-motion";

export const Confetti = () => {
  const colors = ["#60a5fa", "#fbbf24", "#34d399", "#f472b6", "#a78bfa", "#f87171"];
  return (
    <div className="w-full h-full flex flex-wrap items-center justify-center">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            top: "50%",
            left: "50%",
            opacity: 1,
            scale: 1,
            rotate: Math.random() * 360,
          }}
          animate={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            scale: 0.7 + Math.random() * 0.6,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 2.5 + Math.random() * 1.5, ease: "easeOut" }}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: colors[i % colors.length],
            zIndex: 100,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti; 