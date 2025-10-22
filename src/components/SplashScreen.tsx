"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SplashScreenProps {
  text: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ text }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {text}
          <motion.span
            animate={{ rotateZ: [0, 15, -15, 0], scaleY: [1, 0.2, 1] }} // Wink animation
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            😉
          </motion.span>
        </h1>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
      </motion.div>
    </div>
  );
};

export default SplashScreen;