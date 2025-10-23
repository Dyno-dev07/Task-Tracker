"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js"; // Import User type
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateTaskDialog from "./CreateTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import SplashScreen from "./SplashScreen";

interface Profile {
  first_name: string;
  role: "Admin" | "Regular"; // Assuming these are the roles
}

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuthCheck, setIsLoadingAuthCheck] = useState(true);
  const [showLoginSplashScreen, setShowLoginSplashScreen] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"Admin" | "Regular" | null>(null); // New state for user role
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const fetchUserProfile = useCallback(async (user: User) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, role") // Select role as well
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      setUserFirstName(null);
      setUserRole(null);
    } else if (profileData) {
      setUserFirstName(profileData.first_name);
      setUserRole(profileData.role); // Set user role
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        await fetchUserProfile(currentSession.user);
      } else {
        setUserRole(null); // Clear role if no session
      }
      
      if (location.state?.fromLogin && currentSession) {
        setShowLoginSplashScreen(true);
        const timer = setTimeout(() => {
          setShowLoginSplashScreen(false);
          navigate(location.pathname, { replace: true, state: {} });
        }, 2000);
        return () => clearTimeout(timer);
      }
      setIsLoadingAuthCheck(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUserRole(null); // Clear role on logout
        setIsLoadingAuthCheck(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.state?.fromLogin, location.pathname, fetchUserProfile]);

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
        userRole={userRole} // Pass userRole
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${mainContentMarginClass}`}>
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          userRole={userRole} // Pass userRole
        />
        <main className="flex-1 p-4 md:p-6 relative overflow-y-auto">
          <Outlet context={{ userRole }} /> {/* Pass userRole via context */}
        </main>
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-40">
            <CreateTaskDialog />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;