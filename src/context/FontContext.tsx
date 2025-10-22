"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Font = "inter" | "roboto" | "poppins" | "times-new-roman" | "montserrat" | "playfair-display" | "bebas-neue"; // Define available fonts

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [font, setFontState] = useState<Font>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("selectedFont") as Font) || "inter";
    }
    return "inter";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Remove existing font classes before adding the new one
      document.body.className.split(' ').forEach(cls => {
        if (cls.startsWith('font-')) {
          document.body.classList.remove(cls);
        }
      });
      document.body.classList.add(`font-${font}`); // Apply font class to body
      localStorage.setItem("selectedFont", font);
    }
  }, [font]);

  const setFont = (newFont: Font) => {
    setFontState(newFont);
  };

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};