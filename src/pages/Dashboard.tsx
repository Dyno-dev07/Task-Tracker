"use client";

import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardStats from "@/components/DashboardStats";
import { Loader2 } from "lucide-react";

// Define a type for your task data
interface Task {
  id: string;
  user_id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        setTasks([]);
      } else {
        setTasks(data as Task[]);
      }
      setLoadingTasks(false);
    };

    fetchTasks();
  }, [toast]);

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

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to Your Dashboard!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Here's an overview of your tasks.
        </p>
      </div>

      {loadingTasks ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <DashboardStats
          totalTasks={totalTasks}
          pendingTasks={pendingTasks}
          inProgressTasks={inProgressTasks}
          completedTasks={completedTasks}
        />
      )}

      <div className="mt-8 flex space-x-4">
        <Button onClick={() => console.log("Create new task")}>Create New Task</Button>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;