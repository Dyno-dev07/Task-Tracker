import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { ThemeAnimationProvider } from "./context/ThemeAnimationContext.tsx"; // Import new provider
import ThemeChangeAnimator from "./components/ThemeChangeAnimator.tsx"; // Import animator

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <FontProvider>
      <ThemeAnimationProvider> {/* Wrap App with ThemeAnimationProvider */}
        <App />
        <ThemeChangeAnimator /> {/* Render animator here */}
      </ThemeAnimationProvider>
    </FontProvider>
  </ThemeProvider>
);