"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListTodo, Hourglass, PlayCircle, CheckCircle } from "lucide-react";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import TaskStatsCard from "@/components/TaskStatsCard";

interface Task {
  id: string;
  status: "pending" | "in-progress" | "completed";
}

const TaskSummaryPage: React.FC = () => {
  const { toast } = useToast();

  const { data: allTasks = [], isLoading: loadingTasks } = useQuery<Task[]>({
    queryKey: ['allTasksSummary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, status");

      if (error) {
        toast({
          title: "Error fetching tasks summary",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Task[];
    },
  });

  const totalTasks = allTasks.length;
  const pendingTasks = allTasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = allTasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = allTasks.filter((task) => task.status === "completed").length;

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full p-4 md:p-6">
        <div className="w-full max-w-4xl text-center space-y-6 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Overall Task Summary</h1>

          {loadingTasks ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <TaskStatsCard
                title="Total Tasks"
                value={totalTasks}
                icon={<ListTodo />}
                iconColor="text-blue-500 dark:text-blue-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="Pending Tasks"
                value={pendingTasks}
                icon={<Hourglass />}
                iconColor="text-yellow-500 dark:text-yellow-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="In Progress"
                value={inProgressTasks}
                icon={<PlayCircle />}
                iconColor="text-orange-500 dark:text-orange-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="Completed Tasks"
                value={completedTasks}
                icon={<CheckCircle />}
                iconColor="text-green-500 dark:text-green-400"
                to="/admin/task-summary"
              />
            </div>
          )}
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default TaskSummaryPage;