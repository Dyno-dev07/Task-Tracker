"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListTodo, Hourglass, PlayCircle, CheckCircle, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TaskStatsCard from "@/components/TaskStatsCard";
import AdminTaskReportGenerator from "@/components/AdminTaskReportGenerator"; // Import the new component

// Define a type for the RPC function's return value for counts
interface TaskCounts {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
}

// Define the return type for the RPC function for tasks with profiles
interface TaskWithProfile {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  user_id: string;
  first_name: string;
  department: string;
  remarks: string | null; // Added remarks field
}

interface UserProfile {
  id: string;
  first_name: string;
  department: string;
}

const TaskSummaryPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch aggregate task counts using the RPC function
  const { data: taskCounts, isLoading: loadingSummaryCounts } = useQuery<TaskCounts>({
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
      return data[0] as TaskCounts;
    },
  });

  // Fetch all users to get department info for filters and display
  const { data: users = [], isLoading: loadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['allUsersForReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, department");
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

  const departments = Array.from(new Set(users.map(user => user.department))).sort();

  // Fetch all tasks with profile info for the "Tasks by Department" section
  const { data: allTasksWithProfiles = [], isLoading: loadingAllTasks, refetch: refetchAllTasksWithProfiles } = useQuery<TaskWithProfile[]>({
    queryKey: ['allTasksWithProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_tasks_with_profiles', {
        user_id_filter: null, // Consistent order
        start_date_iso: null,
        end_date_iso: null,
        priority_filter: null,
        status_filter: null,
        department_name: null, // Consistent order
      });

      if (error) {
        toast({
          title: "Error fetching all tasks for display",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as TaskWithProfile[];
    },
  });

  // Calculate task counts grouped by department
  const departmentTaskCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    allTasksWithProfiles.forEach(task => {
      const departmentName = task.department || "Unassigned";
      counts[departmentName] = (counts[departmentName] || 0) + 1;
    });
    return counts;
  }, [allTasksWithProfiles]);

  const handleTaskChange = () => {
    queryClient.invalidateQueries({ queryKey: ['allTasksWithProfiles'] });
    queryClient.invalidateQueries({ queryKey: ['allTasksSummaryCounts'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate general tasks query (for other pages)
    queryClient.invalidateQueries({ queryKey: ['overallTasksStats'] }); // Invalidate overall stats
    queryClient.invalidateQueries({ queryKey: ['filteredTasks'] }); // Invalidate filtered tasks
  };

  return (
    <div className="flex flex-col items-center w-full p-4 md:p-6">
      <div className="w-full max-w-4xl text-center space-y-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Overall Task Summary</h1>

        {loadingSummaryCounts ? (
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

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Tasks by Department Overview</h2>
        {loadingAllTasks ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : Object.keys(departmentTaskCounts).length === 0 ? (
          <p className="text-lg text-gray-600 dark:text-gray-400">No tasks found across all departments.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(departmentTaskCounts).map(([departmentName, count]) => (
              <Card key={departmentName} className="flex flex-col justify-between h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{departmentName}</CardTitle>
                  <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count} Tasks</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Admin Task Report Generator */}
        <AdminTaskReportGenerator />
      </div>
    </div>
  );
};

export default TaskSummaryPage;