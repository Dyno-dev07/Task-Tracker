"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2, CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  remarks: string | null;
}

interface UserProfile {
  id: string;
  first_name: string;
  department: string;
}

const AdminTaskReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | "all">("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch all users to get department info for filters
  const { data: users = [], isLoading: loadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['allUsersForAdminReport'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, department");
      if (error) {
        toast({
          title: "Error fetching users for report",
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
      let startDate: Date | null = customStartDate ? startOfDay(customStartDate) : null;
      let endDate: Date | null = customEndDate ? endOfDay(customEndDate) : null;
      const now = new Date();

      if (!startDate || !endDate) {
        toast({
          title: "Missing Dates",
          description: "Please select both a start and an end date for the custom range.",
          variant: "destructive",
        });
        setIsGeneratingReport(false);
        return;
      }

      const { data: tasks, error } = await supabase.rpc('get_all_tasks_with_profiles', {
        user_id_filter: null,
        start_date_iso: startDate.toISOString(),
        end_date_iso: endDate.toISOString(),
        priority_filter: null,
        status_filter: null,
        department_name: selectedDepartment === "all" ? null : selectedDepartment,
      });

      if (error) throw error;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(18);
      doc.text("Admin Task Summary Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      const periodText = `Custom Range: ${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;

      doc.text(`Period: ${periodText}`, 14, yPos);
      yPos += 7;
      doc.text(`Department: ${selectedDepartment === "all" ? "All" : selectedDepartment}`, 14, yPos);
      yPos += 15;

      const tableColumn = ["User", "Department", "Title", "Description", "Status", "Priority", "Due Date", "Created At", "Remarks"];
      const tableRows: any[] = [];

      tasks?.forEach((task: TaskWithProfile) => {
        const taskData = [
          task.first_name || "N/A",
          task.department || "N/A",
          task.title,
          task.description || "N/A",
          task.status,
          task.priority,
          task.due_date ? format(new Date(task.due_date), "PPP") : "N/A",
          format(new Date(task.created_at), "PPP"),
          task.remarks || "N/A",
        ];
        tableRows.push(taskData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
      });

      doc.save(`Admin_Task_Report_${format(now, "yyyyMMdd_HHmmss")}.pdf`);

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
  }, [customStartDate, customEndDate, selectedDepartment, toast]);

  return (
    <Card className="p-6 space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          Generate Detailed Task Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="custom-start-date" className="text-left">Start Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  initialFocus
                />
                {customStartDate && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setCustomStartDate(undefined)} className="w-full">Clear Start Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="custom-end-date" className="text-left">End Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  initialFocus
                />
                {customEndDate && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setCustomEndDate(undefined)} className="w-full">Clear End Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
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

        <Button onClick={generateReport} disabled={isGeneratingReport || loadingUsers || !customStartDate || !customEndDate} className="w-full sm:w-auto">
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
  );
};

export default AdminTaskReportGenerator;