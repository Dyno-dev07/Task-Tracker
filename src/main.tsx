import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { useTheme } from "next-themes";
import React from "react"; // Import React for useEffect

const AppWithThemeKey = () => {
  const { resolvedTheme } = useTheme();
  console.log("AppWithThemeKey: resolvedTheme changed to", resolvedTheme);

  // The next-themes library already handles setting the class on document.documentElement.
  // This useEffect was redundant and potentially interfering with other class/style manipulations.
  // It has been removed to allow themes and fonts to coexist.
  // useEffect(() => {
  //   if (resolvedTheme) {
  //     document.documentElement.className = resolvedTheme;
  //   }
  // }, [resolvedTheme]);

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