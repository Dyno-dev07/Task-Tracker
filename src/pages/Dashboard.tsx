"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardStats from "@/components/DashboardStats";
import { Loader2, CalendarIcon } from "lucide-react";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import LatestTasksSection from "@/components/LatestTasksSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Define a type for your task data
interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store all tasks for stats
  const [filteredDashboardTasks, setFilteredDashboardTasks] = useState<Task[]>([]); // Tasks for the dashboard section
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Filter states for dashboard tasks
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");

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
      setAllTasks([]);
    } else {
      setAllTasks(data as Task[]);
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
      setGreeting(`Welcome to your tasks, ${userFirstName}!`);
    } else {
      setGreeting("Welcome to Your Dashboard!");
    }
  }, [userFirstName]);

  // Apply filters to the latest 10 tasks for the dashboard section
  useEffect(() => {
    let currentTasks = [...allTasks];

    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
      currentTasks = currentTasks.filter(task =>
        format(new Date(task.created_at), "yyyy-MM-dd") === formattedSelectedDate
      );
    }
    if (selectedPriority !== "all") {
      currentTasks = currentTasks.filter(task => task.priority === selectedPriority);
    }
    if (selectedStatus !== "all") {
      currentTasks = currentTasks.filter(task => task.status === selectedStatus);
    }

    setFilteredDashboardTasks(currentTasks.slice(0, 10)); // Always show max 10 filtered tasks
  }, [allTasks, selectedDate, selectedPriority, selectedStatus]);


  const totalTasks = allTasks.length;
  const pendingTasks = allTasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = allTasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = allTasks.filter((task) => task.status === "completed").length;

  const isLoading = loadingTasks || loadingProfile;

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full">
        <div className="text-center space-y-4 mb-8 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {isLoading ? "Loading Dashboard..." : greeting}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Check if you're slayin' your tasks or just existing in the office
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <DashboardStats
              totalTasks={totalTasks}
              pendingTasks={pendingTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
            />

            <div className="w-full max-w-4xl flex flex-wrap justify-center gap-4 my-8">
              {/* Calendar Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-2">
                      <Button variant="ghost" onClick={() => setSelectedDate(undefined)} className="w-full">Clear Date</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Select onValueChange={(value: "all" | "low" | "medium" | "high") => setSelectedPriority(value)} value={selectedPriority}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select onValueChange={(value: "all" | "pending" | "in-progress" | "completed") => setSelectedStatus(value)} value={selectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <LatestTasksSection tasks={filteredDashboardTasks} totalTaskCount={totalTasks} onTaskChange={fetchTasks} />
          </>
        )}
      </div>
    </PageTransitionWrapper>
  );
};

export default Dashboard;