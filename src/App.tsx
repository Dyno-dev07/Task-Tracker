import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./components/AuthLayout";
import TaskListPage from "./pages/TaskListPage";
import AllTasksPage from "./pages/AllTasksPage";
import SettingsPage from "./pages/SettingsPage";
import UserTasksPage from "./pages/UserTasksPage";
import TaskSummaryPage from "./pages/TaskSummaryPage";
import AdminRouteGuard from "./components/AdminRouteGuard";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import { AnimatePresence, motion } from "framer-motion"; // Import motion
import React from "react";

const queryClient = new QueryClient();

// Define pageVariants directly in App.tsx
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Starts slightly below for a "bounce up" entry
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0, // Bounces up to its final position
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 25,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    y: 0, // Fades out in place to prevent scrollbar issues
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

const AppRoutes = () => {
  const location = useLocation();

  // Helper function to wrap route elements with motion.div
  const wrapWithMotion = (Component: React.ElementType) => (
    <motion.div
      key={location.pathname} // Key is crucial for AnimatePresence to detect route changes
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full absolute inset-0 overflow-y-auto"
    >
      <Component />
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}> {/* No key on Routes here, AnimatePresence handles it */}
        <Route path="/" element={wrapWithMotion(Index)} />
        <Route path="/signup" element={wrapWithMotion(SignUp)} />
        <Route path="/login" element={wrapWithMotion(Login)} />
        <Route path="/forgot-password" element={wrapWithMotion(ForgotPassword)} />
        <Route path="/update-password" element={wrapWithMotion(UpdatePassword)} />
        {/* Protected routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={wrapWithMotion(Dashboard)} />
          <Route path="/tasks/all" element={wrapWithMotion(AllTasksPage)} />
          <Route path="/tasks/:status" element={wrapWithMotion(TaskListPage)} />
          <Route path="/settings" element={wrapWithMotion(SettingsPage)} />
          {/* Admin Routes protected by AdminRouteGuard */}
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin/users-tasks" element={wrapWithMotion(UserTasksPage)} />
            <Route path="/admin/task-summary" element={wrapWithMotion(TaskSummaryPage)} />
          </Route>
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={wrapWithMotion(NotFound)} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    <Toaster />
    <Sonner />
  </>
);

export default App;