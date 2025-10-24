"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import EditTaskDialog from "./EditTaskDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import { CheckCircle, PlayCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

interface LatestTasksSectionProps {
  tasks: Task[];
  totalTaskCount: number;
  onTaskChange: () => void; // Callback for when a task is updated or deleted
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

const LatestTasksSection: React.FC<LatestTasksSectionProps> = ({ tasks, totalTaskCount, onTaskChange }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Initialize useQueryClient

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
      onTaskChange(); // Call the prop to invalidate queries in Dashboard
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
    <div className="w-full max-w-6xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Latest Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center">No tasks found with the current filters.</p>
      ) : (
        <motion.div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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
                    <EditTaskDialog task={task} onTaskUpdated={onTaskChange} />
                    <DeleteTaskDialog taskId={task.id} onTaskDeleted={onTaskChange} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      {totalTaskCount > 10 && (
        <div className="text-center mt-8">
          <Link to="/tasks/all">
            <Button variant="outline">View All Tasks</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LatestTasksSection;