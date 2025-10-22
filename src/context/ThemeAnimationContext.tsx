"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeAnimationContextType {
  isThemeAnimating: boolean;
  triggerThemeAnimation: () => void;
  themeChangeCount: number; // New: Expose the counter
}

const ThemeAnimationContext = createContext<ThemeAnimationContextType | undefined>(undefined);

export const ThemeAnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const [themeChangeCount, setThemeChangeCount] = useState(0); // New: State for the counter

  const triggerThemeAnimation = () => {
    setIsThemeAnimating(true);
    setThemeChangeCount((prevCount) => prevCount + 1); // Increment the counter
    setTimeout(() => {
      setIsThemeAnimating(false);
    }, 1000); // 1000ms (1 second) should be ample time
  };

  return (
    <ThemeAnimationContext.Provider value={{ isThemeAnimating, triggerThemeAnimation, themeChangeCount }}>
      {children}
    </ThemeAnimationContext.Provider>
  );
};

export const useThemeAnimation = () => {
  const context = useContext(ThemeAnimationContext);
  if (context === undefined) {
    throw new Error("useThemeAnimation must be used within a ThemeAnimationProvider");
  }
  return context;
};