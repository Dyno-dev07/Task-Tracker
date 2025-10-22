"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to Your Dashboard!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          This is where your tasks will appear.
        </p>
        <Button onClick={() => console.log("Create new task")}>Create New Task</Button>
        <Button variant="outline" onClick={handleLogout} className="ml-4">
          Logout
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;