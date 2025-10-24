import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

const queryClient = new QueryClient();

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: "100vw",
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Index /></motion.div>} />
        <Route path="/signup" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><SignUp /></motion.div>} />
        <Route path="/login" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Login /></motion.div>} />
        <Route path="/forgot-password" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><ForgotPassword /></motion.div>} />
        <Route path="/update-password" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><UpdatePassword /></motion.div>} />
        {/* Protected routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Dashboard /></motion.div>} />
          <Route path="/tasks/all" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><AllTasksPage /></motion.div>} />
          <Route path="/tasks/:status" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><TaskListPage /></motion.div>} />
          <Route path="/settings" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><SettingsPage /></motion.div>} />
          {/* Admin Routes protected by AdminRouteGuard */}
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin/users-tasks" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><UserTasksPage /></motion.div>} />
            <Route path="/admin/task-summary" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><TaskSummaryPage /></motion.div>} />
          </Route>
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><NotFound /></motion.div>} />
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