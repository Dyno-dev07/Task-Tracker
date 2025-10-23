"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download } from "lucide-react";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  department: string;
}

const ReportsPage: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState<"week" | "month">("week");
  const [selectedDepartment, setSelectedDepartment] = useState<string | "all">("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  // Fetch all users to get department info
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

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      let startDate: Date;
      let endDate: Date;
      const now = new Date();

      if (reportPeriod === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else { // month
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      let query = supabase
        .from("tasks")
        .select("*, profiles(first_name, department)") // Join with profiles to get user info
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (selectedDepartment !== "all") {
        // Filter by department by joining with profiles table
        query = query.in('user_id', users.filter(u => u.department === selectedDepartment).map(u => u.id));
      }

      const { data: tasks, error } = await query;

      if (error) throw error;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(18);
      doc.text("Task Summary Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(`Period: ${format(startDate, "PPP")} - ${format(endDate, "PPP")}`, 14, yPos);
      yPos += 7;
      doc.text(`Department: ${selectedDepartment === "all" ? "All" : selectedDepartment}`, 14, yPos);
      yPos += 15;

      const tableColumn = ["User", "Department", "Title", "Status", "Priority", "Due Date"];
      const tableRows: any[] = [];

      tasks?.forEach((task: any) => {
        const userProfile = task.profiles as UserProfile; // Type assertion for joined data
        const taskData = [
          userProfile?.first_name || "N/A",
          userProfile?.department || "N/A",
          task.title,
          task.status,
          task.priority,
          task.due_date ? format(new Date(task.due_date), "PPP") : "N/A",
        ];
        tableRows.push(taskData);
      });

      (doc as any).autoTable(tableColumn, tableRows, { startY: yPos });

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
  }, [reportPeriod, selectedDepartment, users, toast]);

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full p-4 md:p-6">
        <div className="w-full max-w-4xl text-center space-y-6 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Generate Reports
          </h1>

          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="report-period" className="w-full sm:w-auto text-left sm:text-right">Report Period:</label>
                <Select onValueChange={(value: "week" | "month") => setReportPeriod(value)} value={reportPeriod}>
                  <SelectTrigger id="report-period" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Current Week</SelectItem>
                    <SelectItem value="month">Current Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="department-filter" className="w-full sm:w-auto text-left sm:text-right">Filter by Department:</label>
                <Select onValueChange={(value: string | "all") => setSelectedDepartment(value)} value={selectedDepartment}>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate PDF Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default ReportsPage;