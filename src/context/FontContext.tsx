"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FontKey = "inter" | "roboto" | "poppins" | "times-new-roman" | "montserrat" | "playfair-display" | "bebas-neue"; // Define available fonts

interface FontContextType {
  font: FontKey;
  setFont: (font: FontKey) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const fontMap: Record<FontKey, string> = {
  inter: "Inter, sans-serif",
  roboto: "Roboto, sans-serif",
  poppins: "Poppins, sans-serif",
  "times-new-roman": "'Times New Roman', serif",
  montserrat: "Montserrat, sans-serif",
  "playfair-display": "'Playfair Display', serif",
  "bebas-neue": "'Bebas Neue', sans-serif",
};

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [font, setFontState] = useState<FontKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("selectedFont") as FontKey) || "inter";
    }
    return "inter";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set the CSS variable on the document.documentElement (html tag)
      // This variable is then used by Tailwind's font-sans utility class.
      document.documentElement.style.setProperty("--font-sans", fontMap[font]);
      localStorage.setItem("selectedFont", font);
    }
  }, [font]);

  const setFont = (newFont: FontKey) => {
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