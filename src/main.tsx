import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { FontProvider } from "./context/FontContext.tsx";
import { ThemeAnimationProvider, useThemeAnimation } from "./context/ThemeAnimationContext.tsx";
import ThemeChangeAnimator from "./components/ThemeChangeAnimator.tsx";

// This component will consume the ThemeAnimationContext
const AppWithThemeAnimationKey = () => {
  const { themeChangeCount } = useThemeAnimation();

  return (
    <FontProvider> {/* FontProvider needs to wrap App */}
      <App key={themeChangeCount} />
      <ThemeChangeAnimator />
    </FontProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <ThemeAnimationProvider> {/* ThemeAnimationProvider must wrap AppWithThemeAnimationKey */}
      <AppWithThemeAnimationKey />
    </ThemeAnimationProvider>
  </ThemeProvider>
);