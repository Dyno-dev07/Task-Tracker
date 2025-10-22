"use client";

import React from "react";
import { motion } from "framer-motion";

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
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      // absolute inset-0 takes the element out of the document flow and positions it
      // to fill its parent. overflow-hidden ensures any animation movement outside
      // these bounds is clipped, preventing scrollbars.
      className="w-full h-full absolute inset-0 overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default PageTransitionWrapper;