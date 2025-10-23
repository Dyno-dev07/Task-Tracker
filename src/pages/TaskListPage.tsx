"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // Import motion
import EditTaskDialog from "@/components/EditTaskDialog"; // Import EditTaskDialog
import DeleteTaskDialog from "@/components/DeleteTaskDialog"; // Import DeleteTaskDialog

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
      staggerChildren: 0.1, // Stagger the animation of children by 0.1 seconds
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

const TaskListPage: React.FC = () => {
  const { status } = useParams<{ status: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // New state for date filter

  const fetchTasksByStatus = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (selectedDate) {
      const startOfDay = format(selectedDate, "yyyy-MM-ddT00:00:00.000Z");
      const endOfDay = format(selectedDate, "yyyy-MM-ddT23:59:59.999Z");
      query = query.gte("created_at", startOfDay).lte("created_at", endOfDay);
    }

    const { data, error } = await query;

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
    setLoading(false);
  }, [status, toast, selectedDate]); // Add selectedDate to dependencies

  useEffect(() => {
    fetchTasksByStatus();
  }, [fetchTasksByStatus]);

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
    <PageTransitionWrapper>
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
                      <div className="flex justify-end gap-1 mt-4"> {/* Moved action buttons here */}
                        <EditTaskDialog task={task} onTaskUpdated={fetchTasksByStatus} />
                        <DeleteTaskDialog taskId={task.id} onTaskDeleted={fetchTasksByStatus} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default TaskListPage;