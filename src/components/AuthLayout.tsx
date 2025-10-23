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
import SplashScreen from "./SplashScreen";

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuthCheck, setIsLoadingAuthCheck] = useState(true); // For initial session check
  const [showLoginSplashScreen, setShowLoginSplashScreen] = useState(false); // For post-login splash
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // If coming from login/signup and a session exists, show splash screen
      if (location.state?.fromLogin && currentSession) {
        setShowLoginSplashScreen(true);
        const timer = setTimeout(() => {
          setShowLoginSplashScreen(false);
          // Clear the state so it doesn't show again on refresh
          navigate(location.pathname, { replace: true, state: {} });
        }, 2000); // 2-second splash screen
        return () => clearTimeout(timer);
      }
      setIsLoadingAuthCheck(false); // Auth check complete
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsLoadingAuthCheck(false); // Ensure auth check is marked complete if logged out
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.state?.fromLogin, location.pathname]);

  useEffect(() => {
    if (!isLoadingAuthCheck && !session && !showLoginSplashScreen) {
      navigate("/login");
    }
  }, [isLoadingAuthCheck, session, showLoginSplashScreen, navigate]);

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

  if (isLoadingAuthCheck || showLoginSplashScreen) {
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
        <main className="flex-1 p-4 md:p-6 relative overflow-y-auto">
          {/* Outlet is now wrapped by PageTransitionWrapper in App.tsx */}
          <Outlet />
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