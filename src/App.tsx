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
import ReportsPage from "./pages/ReportsPage";
import TaskDetailsPage from "./pages/TaskDetailsPage"; // Import the new page
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import AdminRouteGuard from "./components/AdminRouteGuard";
import { AnimatePresence } from "framer-motion";
import React from "react";

const queryClient = new QueryClient();

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <PageTransitionWrapper key={location.pathname}>
      {children}
    </PageTransitionWrapper>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AnimatedRoute><Index /></AnimatedRoute>} />
            <Route path="/signup" element={<AnimatedRoute><SignUp /></AnimatedRoute>} />
            <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
            {/* Protected routes */}
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
              <Route path="/tasks/all" element={<AnimatedRoute><AllTasksPage /></AnimatedRoute>} />
              <Route path="/tasks/:status" element={<AnimatedRoute><TaskListPage /></AnimatedRoute>} />
              <Route path="/task/:taskId" element={<AnimatedRoute><TaskDetailsPage /></AnimatedRoute>} /> {/* New route for task details */}
              <Route path="/settings" element={<AnimatedRoute><SettingsPage /></AnimatedRoute>} />
              {/* Admin Routes protected by AdminRouteGuard */}
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin/users-tasks" element={<AnimatedRoute><UserTasksPage /></AnimatedRoute>} />
                <Route path="/admin/task-summary" element={<AnimatedRoute><TaskSummaryPage /></AnimatedRoute>} />
                <Route path="/admin/reports" element={<AnimatedRoute><ReportsPage /></AnimatedRoute>} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;