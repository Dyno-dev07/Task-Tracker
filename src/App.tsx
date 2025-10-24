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
import { AnimatePresence, motion } from "framer-motion"; // Import AnimatePresence and motion

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 25, mass: 1 } },
  exit: { opacity: 0, y: 0, scale: 0.98, transition: { duration: 0.2 } },
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait"> {/* Use AnimatePresence here */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Index /></motion.div>} />
        <Route path="/signup" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><SignUp /></motion.div>} />
        <Route path="/login" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Login /></motion.div>} />
        <Route path="/forgot-password" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><ForgotPassword /></motion.div>} />
        <Route path="/update-password" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><UpdatePassword /></motion.div>} />
        {/* Protected routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Dashboard /></motion.div>} />
          <Route path="/tasks/all" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><AllTasksPage /></motion.div>} />
          <Route path="/tasks/:status" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><TaskListPage /></motion.div>} />
          <Route path="/settings" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><SettingsPage /></motion.div>} />
          {/* Admin Routes protected by AdminRouteGuard */}
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin/users-tasks" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><UserTasksPage /></motion.div>} />
            <Route path="/admin/task-summary" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><TaskSummaryPage /></motion.div>} />
          </Route>
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><NotFound /></motion.div>} />
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