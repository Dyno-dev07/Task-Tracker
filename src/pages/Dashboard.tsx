"use client";

import React, { useEffect, useState, useCallback } from "react";
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

const greetings = [
  "Hello",
  "Hi there",
  "Welcome back",
  "Great to see you",
  "Howdy",
  "Greetings",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchTasks = useCallback(async () => {
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
  }, [toast]);

  const fetchUserProfile = useCallback(async () => {
    setLoadingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setUserFirstName(null);
      } else if (profileData) {
        setUserFirstName(profileData.first_name);
      }
    }
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchTasks();
  }, [fetchUserProfile, fetchTasks]);

  useEffect(() => {
    if (userFirstName) {
      const randomIndex = Math.floor(Math.random() * greetings.length);
      setGreeting(`${greetings[randomIndex]}, ${userFirstName}!`);
    } else {
      setGreeting("Welcome to Your Dashboard!");
    }
  }, [userFirstName]);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;

  const isLoading = loadingTasks || loadingProfile;

  return (
    <div className="flex flex-col items-center w-full"> {/* Adjusted width to fill parent */}
      <div className="text-center space-y-4 mb-8 mt-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {isLoading ? "Loading Dashboard..." : greeting}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Here's an overview of your tasks.
        </p>
      </div>

      {isLoading ? (
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
      {/* Removed TaskNavigation, CreateTaskDialog, and Logout button */}
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;