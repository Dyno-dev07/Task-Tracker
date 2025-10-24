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
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // Directly import
import AdminRouteGuard from "./components/AdminRouteGuard";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import { AnimatePresence } from "framer-motion";
import React from "react";

const queryClient = new QueryClient();

// New component to handle routes and AnimatePresence
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransitionWrapper><Index /></PageTransitionWrapper>} />
        <Route path="/signup" element={<PageTransitionWrapper><SignUp /></PageTransitionWrapper>} />
        <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
        <Route path="/forgot-password" element={<PageTransitionWrapper><ForgotPassword /></PageTransitionWrapper>} />
        <Route path="/update-password" element={<PageTransitionWrapper><UpdatePassword /></PageTransitionWrapper>} />
        {/* Protected routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<PageTransitionWrapper><Dashboard /></PageTransitionWrapper>} />
          <Route path="/tasks/all" element={<PageTransitionWrapper><AllTasksPage /></PageTransitionWrapper>} />
          <Route path="/tasks/:status" element={<PageTransitionWrapper><TaskListPage /></PageTransitionWrapper>} />
          <Route path="/settings" element={<PageTransitionWrapper><SettingsPage /></PageTransitionWrapper>} />
          {/* Admin Routes protected by AdminRouteGuard */}
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin/users-tasks" element={<PageTransitionWrapper><UserTasksPage /></PageTransitionWrapper>} />
            <Route path="/admin/task-summary" element={<PageTransitionWrapper><TaskSummaryPage /></PageTransitionWrapper>} />
          </Route>
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransitionWrapper><NotFound /></PageTransitionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Wrapped children in a React.Fragment */}
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes /> {/* Render the new AppRoutes component */}
        </BrowserRouter>
      </>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;