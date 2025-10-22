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
    // The animation duration is about 0.1s (visible) + 0.1s (delay) + 0.3s (exit) = 0.5s
    // We'll set the timeout slightly longer to ensure CSS has time to apply.
    setTimeout(() => {
      setIsThemeAnimating(false);
    }, 600); // 600ms should be enough for the animation and CSS to settle
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