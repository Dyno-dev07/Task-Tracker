"use client";

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import SplashScreen from "./SplashScreen";

interface Profile {
  role: "Admin" | "Regular";
}

const AdminRouteGuard: React.FC = () => {
  const [userRole, setUserRole] = useState<"Admin" | "Regular" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // If no user or error, AuthLayout will handle redirection to login
        setIsLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile or profile not found:", profileError);
        setUserRole(null);
        toast({
          title: "Access Denied",
          description: "Could not retrieve user role. Please try again.",
          variant: "destructive",
        });
        navigate("/dashboard", { replace: true });
        return;
      }

      if (profileData.role === "Admin") {
        setUserRole("Admin");
      } else {
        setUserRole("Regular");
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive",
        });
        navigate("/dashboard", { replace: true });
      }
      setIsLoading(false);
    };

    checkAdminRole();
  }, [navigate, toast]);

  if (isLoading) {
    return <SplashScreen text="Verifying permissions" />;
  }

  // If userRole is Admin, render the child routes
  // If userRole is Regular, they would have been redirected by now
  // If userRole is null (e.g., profile not found), they would have been redirected
  return userRole === "Admin" ? <Outlet /> : null;
};

export default AdminRouteGuard;