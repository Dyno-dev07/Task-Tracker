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
import React from "react";
// Removed AnimatePresence and motion imports for debugging

const queryClient = new QueryClient();

// Removed pageVariants as animations are temporarily disabled

const AppRoutes = () => {
  // Removed useLocation as it's only needed for AnimatePresence
  // const location = useLocation();

  return (
    // Removed AnimatePresence wrapper
    <Routes> {/* Removed location and key props as they are for AnimatePresence */}
      <Route path="/" element={<Index />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      {/* Protected routes */}
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks/all" element={<AllTasksPage />} />
        <Route path="/tasks/:status" element={<TaskListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Admin Routes protected by AdminRouteGuard */}
        <Route element={<AdminRouteGuard />}>
          <Route path="/admin/users-tasks" element={<UserTasksPage />} />
          <Route path="/admin/task-summary" element={<TaskSummaryPage />} />
        </Route>
      </Route>
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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