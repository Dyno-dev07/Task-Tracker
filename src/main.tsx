import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { useTheme } from "next-themes";
import React from "react";

const AppWithThemeKey = () => {
  const { resolvedTheme } = useTheme();
  // Add a console log to observe changes in resolvedTheme
  console.log("AppWithThemeKey: resolvedTheme changed to", resolvedTheme);

  return (
    <FontProvider>
      <App key={resolvedTheme} />
    </FontProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <AppWithThemeKey />
  </ThemeProvider>
);