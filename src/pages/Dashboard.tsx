"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useOutletContext } from "react-router-dom"; // Import useOutletContext
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
import { useQuery } from "@tanstack/react-query";
import GlobalAnnouncementDisplay from "@/components/GlobalAnnouncementDisplay"; // Import the renamed component
import AdminAnnouncementManager from "@/components/AdminAnnouncementManager"; // Import the new admin component

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

interface AuthLayoutContext {
  userRole: "Admin" | "Regular" | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { userRole } = useOutletContext<AuthLayoutContext>(); // Get userRole from context

  // Filter states for dashboard tasks
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");

  // Fetch tasks using react-query (RLS will ensure only current user's tasks are fetched)
  const { data: allTasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters directly to the query for the current user's tasks
      if (selectedDate) {
        const formattedSelectedDate = format(selectedDate, "yyyy-MM-ddT00:00:00.000Z");
        const endOfDay = format(selectedDate, "yyyy-MM-ddT23:59:59.999Z");
        query = query.gte("created_at", formattedSelectedDate).lte("created_at", endOfDay);
      }
      if (selectedPriority !== "all") {
        query = query.eq("priority", selectedPriority);
      }
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        throw error; // Throw error to react-query
      }
      return data as Task[];
    },
  });

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
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userFirstName) {
      setGreeting(`Welcome to your tasks, ${userFirstName}!`);
    } else {
      setGreeting("Welcome to Your Dashboard!");
    }
  }, [userFirstName]);

  // The filteredDashboardTasks will now be based on the `allTasks` which are already filtered by RLS and component state
  const filteredDashboardTasks = React.useMemo(() => {
    return allTasks.slice(0, 10); // Always show max 10 filtered tasks
  }, [allTasks]);


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

        {/* Global Announcement Display */}
        <GlobalAnnouncementDisplay />

        {/* Admin Announcement Manager (only for admins) */}
        {userRole === "Admin" && (
          <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
            <AdminAnnouncementManager />
          </div>
        )}

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

            <LatestTasksSection tasks={filteredDashboardTasks} totalTaskCount={totalTasks} onTaskChange={refetchTasks} />
          </>
        )}
      </div>
    </PageTransitionWrapper>
  );
};

export default Dashboard;