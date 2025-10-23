"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListTodo, Hourglass, PlayCircle, CheckCircle } from "lucide-react";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import TaskStatsCard from "@/components/TaskStatsCard";

// Define a type for the RPC function's return value
interface TaskCounts {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
}

const TaskSummaryPage: React.FC = () => {
  const { toast } = useToast();

  // Fetch aggregate task counts using the RPC function
  const { data: taskCounts, isLoading: loadingTasks } = useQuery<TaskCounts>({
    queryKey: ['allTasksSummaryCounts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_task_counts');

      if (error) {
        toast({
          title: "Error fetching tasks summary",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      // The RPC function returns a single row, so we expect data[0]
      return data[0] as TaskCounts;
    },
  });

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
                value={taskCounts?.total_tasks || 0}
                icon={<ListTodo />}
                iconColor="text-blue-500 dark:text-blue-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="Pending Tasks"
                value={taskCounts?.pending_tasks || 0}
                icon={<Hourglass />}
                iconColor="text-yellow-500 dark:text-yellow-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="In Progress"
                value={taskCounts?.in_progress_tasks || 0}
                icon={<PlayCircle />}
                iconColor="text-orange-500 dark:text-orange-400"
                to="/admin/task-summary"
              />
              <TaskStatsCard
                title="Completed Tasks"
                value={taskCounts?.completed_tasks || 0}
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