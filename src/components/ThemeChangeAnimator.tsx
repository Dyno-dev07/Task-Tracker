"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeAnimation } from "@/context/ThemeAnimationContext";

const ThemeChangeAnimator: React.FC = () => {
  const { isThemeAnimating } = useThemeAnimation();

  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.1, // Quick flash in
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 1.2, // Slightly expand as it fades out
      transition: {
        delay: 0.1, // Hold for a moment
        duration: 0.3, // Fade out
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence>
      {isThemeAnimating && (
        <motion.div
          key="theme-animator"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary text-primary-foreground"
          style={{ pointerEvents: "none" }} // Allow clicks to pass through after animation
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            className="text-2xl font-bold"
          >
            Changing Theme... ✨
          </motion.span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "50%" }}
            exit={{ width: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="h-1 bg-primary-foreground mt-4 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeChangeAnimator;