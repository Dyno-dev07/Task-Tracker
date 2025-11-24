"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import EditTaskDialog from "@/components/EditTaskDialog";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  user_id: string;
  remarks: string | null;
  first_name: string; // No longer optional, will be flattened
  department: string; // No longer optional, will be flattened
  profiles?: { // Keep optional for the raw supabase response before flattening
    first_name: string;
    department: string;
  };
}

interface UserProfile {
  id: string;
  first_name: string;
}

const TASKS_PER_PAGE = 9; // Display 9 tasks per page

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

const UserTasksPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | "all">("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users (profiles)
  const { data: users = [], isLoading: loadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name");
      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as UserProfile[];
    },
  });

  // Fetch tasks based on filters and selected user
  const fetchTasks = useCallback(async () => {
    let query = supabase
      .from("tasks")
      .select("*, profiles(first_name, department)", { count: 'exact' }) // Request exact count
      .order("created_at", { ascending: false });

    // Apply filters
    if (selectedUserId !== "all") {
      query = query.eq("user_id", selectedUserId);
    }
    if (selectedDate) {
      const startOfDayLocal = new Date(selectedDate);
      startOfDayLocal.setHours(0, 0, 0, 0);
      const startOfDayUTC = startOfDayLocal.toISOString();

      const endOfDayLocal = new Date(selectedDate);
      endOfDayLocal.setHours(23, 59, 59, 999);
      const endOfDayUTC = endOfDayLocal.toISOString();

      query = query.gte("created_at", startOfDayUTC).lte("created_at", endOfDayUTC);
    }
    if (selectedPriority !== "all") {
      query = query.eq("priority", selectedPriority);
    }
    if (selectedStatus !== "all") {
      query = query.eq("status", selectedStatus);
    }

    // Apply pagination
    const from = (currentPage - 1) * TASKS_PER_PAGE;
    const to = from + TASKS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    setTotalTasksCount(count || 0); // Set total count

    // Flatten the data structure
    const flattenedData = data?.map(task => ({
      ...task,
      first_name: task.profiles?.first_name || "N/A",
      department: task.profiles?.department || "N/A",
    })) || [];

    return flattenedData as Task[];
  }, [toast, selectedUserId, selectedDate, selectedPriority, selectedStatus, currentPage]);

  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchUserTasks } = useQuery<Task[]>({
    queryKey: ['userTasks', { userId: selectedUserId, date: selectedDate?.toISOString(), priority: selectedPriority, status: selectedStatus, currentPage }],
    queryFn: fetchTasks,
  });

  const getPriorityBadgeVariant = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const truncateDescription = (description: string | null, limit: number) => {
    if (!description) return null;
    if (description.length <= limit) return description;
    return description.substring(0, limit) + "...";
  };

  const totalPages = Math.ceil(totalTasksCount / TASKS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, selectedDate, selectedPriority, selectedStatus]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl text-center space-y-6 mt-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">View User Tasks</h1>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {/* User Selector */}
          <Select onValueChange={(value: string | "all") => setSelectedUserId(value)} value={selectedUserId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {loadingUsers ? (
                <SelectItem value="loading" disabled>Loading users...</SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

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

        {(loadingUsers || loadingTasks) ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-lg text-gray-600 dark:text-gray-400">No tasks found for the selected user with the current filters.</p>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {tasks.map((task) => (
              <motion.div key={task.id} variants={itemVariants}>
                <Card className="flex flex-col justify-between h-full relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-end w-full mb-2"> {/* Container for icons, aligned right */}
                      <div className="flex items-center gap-1">
                        {task.remarks && (
                          <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" title="Remarks exist" />
                        )}
                        <TaskDetailsDialog task={task} onTaskUpdated={refetchUserTasks} />
                      </div>
                    </div>
                    <CardTitle className="text-center">{task.title}</CardTitle> {/* Centered title */}
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                      <Badge variant="outline">{task.status}</Badge>
                      {/* Display user's first name for admin view */}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {task.first_name || "Unknown User"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {truncateDescription(task.description, 200)}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {format(new Date(task.due_date), "PPP")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {format(new Date(task.created_at), "PPP")}
                    </p>
                    <div className="flex justify-end gap-1 mt-4">
                      <EditTaskDialog task={task} onTaskUpdated={refetchUserTasks} />
                      <DeleteTaskDialog taskId={task.id} onTaskDeleted={refetchUserTasks} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {tasks.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loadingTasks}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loadingTasks}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTasksPage;