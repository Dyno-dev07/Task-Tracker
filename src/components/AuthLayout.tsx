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
import PageTransitionWrapper from "./PageTransitionWrapper";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./SplashScreen";

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingInitialAuthContent, setIsLoadingInitialAuthContent] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuthAndInitialData = async () => {
      const [sessionData, minDelay] = await Promise.all([
        supabase.auth.getSession(),
        new Promise(resolve => setTimeout(resolve, 2000)) // 2-second minimum delay
      ]);

      const currentSession = sessionData.data.session;
      setSession(currentSession);

      if (currentSession) {
        const { count, error } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", currentSession.user.id);

        if (error) {
          console.error("Error fetching initial task count for splash screen:", error);
        }
      }
      setIsLoadingInitialAuthContent(false);
    };

    checkAuthAndInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsLoadingInitialAuthContent(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoadingInitialAuthContent && !session) {
      navigate("/login");
    }
  }, [isLoadingInitialAuthContent, session, navigate]);

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
  };

  if (isLoadingInitialAuthContent) {
    return <SplashScreen text="Getting your tasks ready" />;
  }

  if (!session) {
    return null;
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
        <main className="flex-1 p-4 md:p-6 relative">
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
      </div>
    </div>
  );
};

export default AuthLayout;