"use client";

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { MadeWithDyad } from "./made-with-dyad";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar"; // Import Sidebar
import Header from "./Header"; // Import Header
import CreateTaskDialog from "./CreateTaskDialog"; // Import CreateTaskDialog
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast"; // Import useToast

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast(); // Initialize useToast

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

  // Placeholder for task creation refresh, will be passed to CreateTaskDialog
  const handleTaskCreated = () => {
    // This function will be called when a task is created.
    // In a real app, you might want to trigger a re-fetch of tasks in the Dashboard/TaskListPage.
    // For now, we'll just close the sidebar if it's open.
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
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

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        onLogout={handleLogout}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />
      <div className="flex flex-col flex-1 md:ml-64"> {/* Adjust margin for desktop sidebar */}
        <Header onTaskCreated={handleTaskCreated} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-40">
            <CreateTaskDialog onTaskCreated={handleTaskCreated} />
          </div>
        )}
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default AuthLayout;