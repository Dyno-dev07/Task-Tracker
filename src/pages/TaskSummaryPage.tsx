"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListTodo, Hourglass, PlayCircle, CheckCircle, FileText, Download, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TaskStatsCard from "@/components/TaskStatsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfMonth, endOfMonth } from "date-fns"; // Removed startOfWeek, endOfWeek
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import EditTaskDialog from "@/components/EditTaskDialog";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";

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
}

interface UserProfile {
  id: string;
  first_name: string;
  department: string;
}

const TaskSummaryPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reportPeriod, setReportPeriod] = useState<"week" | "month">("week");
  const [selectedReportDepartment, setSelectedReportDepartment] = useState<string | "all">("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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
        user_id_filter: null,
        start_date_iso: null,
        end_date_iso: null,
        priority_filter: null,
        status_filter: null,
        department_name: null, // Fetch all departments initially
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

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      let startDate: Date;
      let endDate: Date;
      const now = new Date(); // Capture current date/time once

      if (reportPeriod === "week") {
        endDate = now; // Report ends today
        startDate = new Date(now); // Create a new date object
        startDate.setDate(now.getDate() - 6); // Subtract 6 days for a 7-day period
      } else { // month
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      const { data: tasks, error } = await supabase.rpc('get_all_tasks_with_profiles', {
        start_date_iso: startDate.toISOString(),
        end_date_iso: endDate.toISOString(),
        department_name: selectedReportDepartment === "all" ? null : selectedReportDepartment,
        user_id_filter: null,
        priority_filter: null,
        status_filter: null,
      });

      if (error) throw error;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(18);
      doc.text("Task Summary Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(`Period: ${format(startDate, "PPP")} - ${format(endDate, "PPP")}`, 14, yPos);
      yPos += 7;
      doc.text(`Department: ${selectedReportDepartment === "all" ? "All" : selectedReportDepartment}`, 14, yPos);
      yPos += 15;

      // Updated table columns to include Description and Created At
      const tableColumn = ["User", "Department", "Title", "Description", "Status", "Priority", "Due Date", "Created At"];
      const tableRows: any[] = [];

      tasks?.forEach((task: TaskWithProfile) => {
        const taskData = [
          task.first_name || "N/A",
          task.department || "N/A",
          task.title,
          task.description || "N/A", // Added description
          task.status,
          task.priority,
          task.due_date ? format(new Date(task.due_date), "PPP") : "N/A",
          format(new Date(task.created_at), "PPP"), // Added created_at
        ];
        tableRows.push(taskData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
      });

      doc.save(`Task_Report_${format(now, "yyyyMMdd_HHmmss")}.pdf`);

      toast({
        title: "Report Generated!",
        description: "Your PDF report has been successfully downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate report",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [reportPeriod, selectedReportDepartment, toast]);

  const handleTaskChange = () => {
    queryClient.invalidateQueries({ queryKey: ['allTasksWithProfiles'] });
    queryClient.invalidateQueries({ queryKey: ['allTasksSummaryCounts'] });
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

        <Card className="p-6 space-y-4 mt-12">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Generate Task Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="report-period" className="w-full sm:w-auto text-left sm:text-right">Report Period:</label>
              <Select onValueChange={(value: "week" | "month") => setReportPeriod(value)} value={reportPeriod}>
                <SelectTrigger id="report-period" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Current Week (Last 7 Days)</SelectItem>
                  <SelectItem value="month">Current Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="department-filter" className="w-full sm:w-auto text-left sm:text-right">Filter by Department:</label>
              <Select onValueChange={(value: string | "all") => setSelectedReportDepartment(value)} value={selectedReportDepartment}>
                <SelectTrigger id="department-filter" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {loadingUsers ? (
                    <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateReport} disabled={isGeneratingReport || loadingUsers} className="w-full sm:w-auto">
              {isGeneratingReport ? (
                <span>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Generating...
                </span>
              ) : (
                <span>
                  <Download className="mr-2 h-4 w-4 inline-block" />
                  Generate PDF Report
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskSummaryPage;