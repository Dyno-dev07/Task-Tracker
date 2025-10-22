"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeAnimationContextType {
  isThemeAnimating: boolean;
  triggerThemeAnimation: () => void;
}

const ThemeAnimationContext = createContext<ThemeAnimationContextType | undefined>(undefined);

export const ThemeAnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);

  const triggerThemeAnimation = () => {
    setIsThemeAnimating(true);
    // Increased timeout to ensure it covers the full application re-render
    setTimeout(() => {
      setIsThemeAnimating(false);
    }, 1000); // 1000ms (1 second) should be ample time
  };

  return (
    <ThemeAnimationContext.Provider value={{ isThemeAnimating, triggerThemeAnimation }}>
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