import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { ThemeAnimationProvider } from "./context/ThemeAnimationContext.tsx";
import ThemeChangeAnimator from "./components/ThemeChangeAnimator.tsx";
import { useTheme } from "next-themes"; // Import useTheme

// A wrapper component to get the current theme and apply it as a key to the App
const RootApp = () => {
  const { theme } = useTheme(); // Get the current theme from next-themes

  return (
    <FontProvider>
      <ThemeAnimationProvider>
        {/* Use the theme as a key to force re-mount of App when theme changes */}
        <App key={theme} />
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