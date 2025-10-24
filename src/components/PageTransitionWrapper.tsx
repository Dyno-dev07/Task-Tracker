"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom"; // Import useLocation

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Starts slightly below for a "bounce up" entry
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0, // Bounces up to its final position
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 25,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    y: 0, // Fades out in place to prevent scrollbar issues
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const location = useLocation(); // Get location inside the wrapper

  return (
    <motion.div
      key={location.pathname} // Apply key here
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      // absolute inset-0 takes the element out of the document flow and positions it
      // to fill its parent. overflow-y-auto ensures vertical scrolling when content overflows.
      className="w-full h-full absolute inset-0 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
};

export default PageTransitionWrapper;