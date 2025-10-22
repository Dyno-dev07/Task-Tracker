import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { useTheme } from "next-themes";
import React, { useEffect } from "react"; // Import useEffect

const AppWithThemeKey = () => {
  const { resolvedTheme } = useTheme();
  console.log("AppWithThemeKey: resolvedTheme changed to", resolvedTheme);

  // Explicitly set the class on the document.documentElement (which is <html>)
  // This ensures the theme class is always applied directly when resolvedTheme changes.
  useEffect(() => {
    if (resolvedTheme) {
      document.documentElement.className = resolvedTheme;
    }
  }, [resolvedTheme]);

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