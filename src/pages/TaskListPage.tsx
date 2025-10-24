"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CalendarIcon, CheckCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import EditTaskDialog from "@/components/EditTaskDialog";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQuery and useQueryClient

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

// Variants for the cascading animation
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

const TaskListPage: React.FC = () => {
  const { status } = useParams<{ status: string }>();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const queryClient = useQueryClient(); // Initialize useQueryClient

  const fetchTasks = useCallback(async () => {
    if (!status) return []; // Handle case where status might be undefined

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (selectedDate) {
      // Set start and end of the selected day in local time, then convert to ISO string (which is UTC)
      const startOfDayLocal = new Date(selectedDate);
      startOfDayLocal.setHours(0, 0, 0, 0);
      const startOfDayUTC = startOfDayLocal.toISOString();

      const endOfDayLocal = new Date(selectedDate);
      endOfDayLocal.setHours(23, 59, 59, 999);
      const endOfDayUTC = endOfDayLocal.toISOString();

      query = query.gte("created_at", startOfDayUTC).lte("created_at", endOfDayUTC);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    return data as Task[];
  }, [status, toast, selectedDate]);

  const { data: tasks = [], isLoading: loading, refetch: refetchTasksByStatus } = useQuery<Task[]>({
    queryKey: ['tasks', status, { date: selectedDate?.toISOString() }],
    queryFn: fetchTasks,
    enabled: !!status, // Only run query if status is defined
  });

  const handleUpdateStatus = async (taskId: string, newStatus: "in-progress" | "completed") => {
    setIsUpdatingStatus(taskId);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Task Status Updated!",
        description: `Task moved to ${newStatus}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate tasks query to trigger re-fetch
    } catch (error: any) {
      toast({
        title: "Failed to update task status",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getStatusTitle = (statusParam: string | undefined) => {
    switch (statusParam) {
      case "pending":
        return "Pending Tasks";
      case "in-progress":
        return "In Progress Tasks";
      case "completed":
        return "Completed Tasks";
      default:
        return "All Tasks";
    }
  };

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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl text-center space-y-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-grow text-center">
            {getStatusTitle(status)}
          </h1>
        </div>

        {/* Calendar Filter */}
        <div className="flex justify-center mb-6">
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-lg text-gray-600 dark:text-gray-400">No {status} tasks found with the current filters.</p>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {tasks.map((task) => (
              <motion.div key={task.id} variants={itemVariants}>
                <Card className="flex flex-col justify-between h-full">
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                      <Badge variant="outline">{task.status}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.description && <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{task.description}</p>}
                    {task.due_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {format(new Date(task.due_date), "PPP")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {format(new Date(task.created_at), "PPP")}
                    </p>
                    <div className="flex justify-end gap-1 mt-4">
                      {task.status === "in-progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(task.id, "completed")}
                          disabled={isUpdatingStatus === task.id}
                        >
                          <span className="inline-flex items-center">
                            {isUpdatingStatus === task.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Complete
                          </span>
                        </Button>
                      )}
                      {task.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateStatus(task.id, "in-progress")}
                          disabled={isUpdatingStatus === task.id}
                        >
                          <span className="inline-flex items-center">
                            {isUpdatingStatus === task.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <PlayCircle className="mr-2 h-4 w-4" />
                            )}
                            In Progress
                          </span>
                        </Button>
                      )}
                      <EditTaskDialog task={task} onTaskUpdated={refetchTasksByStatus} />
                      <DeleteTaskDialog taskId={task.id} onTaskDeleted={refetchTasksByStatus} />
                    </div>
                  </CardContent>
                  </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;