"use client";

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateTaskDialog from "./CreateTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import PageTransitionWrapper from "./PageTransitionWrapper"; // Import PageTransitionWrapper
import { AnimatePresence } from "framer-motion"; // Import AnimatePresence

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const location = useLocation(); // For AnimatePresence key

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [loading, session, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    }
  };

  const handleTaskCreated = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
    // In a real app, you might want to trigger a re-fetch of tasks in the Dashboard/TaskListPage.
    // For this example, we'll just close the sidebar if it's open.
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null; // Will be redirected by useEffect
  }

  const sidebarWidthClass = isDesktopSidebarOpen ? "md:w-64" : "md:w-20";
  const mainContentMarginClass = isDesktopSidebarOpen ? "md:ml-64" : "md:ml-20";

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        onLogout={handleLogout}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isDesktopSidebarOpen={isDesktopSidebarOpen}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${mainContentMarginClass}`}>
        <Header
          onTaskCreated={handleTaskCreated}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
        />
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <PageTransitionWrapper key={location.pathname}>
              <Outlet />
            </PageTransitionWrapper>
          </AnimatePresence>
        </main>
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-40">
            <CreateTaskDialog onTaskCreated={handleTaskCreated} />
          </div>
        )}
        {/* Removed MadeWithDyad from AuthLayout */}
      </div>
    </div>
  );
};

export default AuthLayout;