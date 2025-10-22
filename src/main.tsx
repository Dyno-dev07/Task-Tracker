import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { useTheme } from "next-themes"; // Import useTheme from next-themes

// A wrapper component to get the current theme and apply it as a key to the App
const AppWithThemeKey = () => {
  const { theme } = useTheme(); // Get the current theme from next-themes

  // Use the theme as a key to force re-mount of App when theme changes.
  // This ensures all components re-evaluate their styles based on the new HTML class.
  return (
    <FontProvider>
      <App key={theme} />
    </FontProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <AppWithThemeKey /> {/* Render the new wrapper component */}
  </ThemeProvider>
);