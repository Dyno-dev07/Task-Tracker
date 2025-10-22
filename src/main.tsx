import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { ThemeAnimationProvider, useThemeAnimation } from "./context/ThemeAnimationContext.tsx"; // Import useThemeAnimation
import ThemeChangeAnimator from "./components/ThemeChangeAnimator.tsx";
// Removed useTheme from next-themes as it's no longer needed for the key

// A wrapper component to get the current theme and apply it as a key to the App
const RootApp = () => {
  const { themeChangeCount } = useThemeAnimation(); // Get the themeChangeCount

  return (
    <FontProvider>
      <ThemeAnimationProvider>
        {/* Use themeChangeCount as a key to force re-mount of App when theme changes */}
        <App key={themeChangeCount} />
        <ThemeChangeAnimator />
      </ThemeAnimationProvider>
    </FontProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <RootApp /> {/* Render the new wrapper component */}
  </ThemeProvider>
);