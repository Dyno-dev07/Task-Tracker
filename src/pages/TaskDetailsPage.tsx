"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CalendarIcon, Tag, Info, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import EditTaskDialog from "@/components/EditTaskDialog";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
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
  profiles?: {
    first_name: string;
    department: string;
  };
}

const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return null;

    const { data, error } = await supabase
      .from("tasks")
      .select("*, profiles(first_name, department)")
      .eq("id", taskId)
      .single();

    if (error) {
      toast({
        title: "Error fetching task details",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    return data as Task;
  }, [taskId, toast]);

  const { data: task, isLoading, error, refetch } = useQuery<Task | null>({
    queryKey: ['taskDetails', taskId],
    queryFn: fetchTaskDetails,
    enabled: !!taskId,
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

  if (isLoading) {
    return (
      <SplashScreen text="Loading task details" />
    );
  }

  if (error || !task) {
    return (
      <PageTransitionWrapper>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Task Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            The task you are looking for does not exist or you do not have permission to view it.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </PageTransitionWrapper>
    );
  }

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full p-4 md:p-6">
        <div className="w-full max-w-2xl space-y-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/admin/users-tasks">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Tasks
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-grow text-center">
              Task Details
            </h1>
            <div className="w-24"></div> {/* Spacer to balance the header */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant={getPriorityBadgeVariant(task.priority)} className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {task.priority}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Info className="h-3 w-3" /> {task.status}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-1">Description:</h3>
                  <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4" />
                <span>Created: {format(new Date(task.created_at), "PPP")}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Due Date: {format(new Date(task.due_date), "PPP")}</span>
                </div>
              )}
              {task.profiles && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span>Assigned to: {task.profiles.first_name} ({task.profiles.department})</span>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <EditTaskDialog task={task} onTaskUpdated={refetch} />
                <DeleteTaskDialog taskId={task.id} onTaskDeleted={() => {
                  toast({
                    title: "Task Deleted!",
                    description: "The task has been successfully removed.",
                  });
                  queryClient.invalidateQueries({ queryKey: ['userTasks'] });
                  queryClient.invalidateQueries({ queryKey: ['allTasksSummary'] });
                  queryClient.invalidateQueries({ queryKey: ['tasks'] });
                  navigate("/admin/users-tasks"); // Navigate back after deletion
                }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default TaskDetailsPage;