"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2, CalendarIcon, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { useOutletContext } from "react-router-dom"; // Import useOutletContext

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

interface AuthLayoutContext {
  userRole: "Admin" | "Regular" | null;
}

interface TaskReportGeneratorProps {
  adminDeleteButton?: React.ReactNode; // New prop for the delete button
}

const TaskReportGenerator: React.FC<TaskReportGeneratorProps> = ({ adminDeleteButton }) => {
  const { toast } = useToast();
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | "all">("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { userRole } = useOutletContext<AuthLayoutContext>(); // Get userRole from AuthLayout context

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  // Fetch all users to get department info for filters (only for admins)
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
    enabled: userRole === "Admin", // Only fetch users if the current user is an Admin
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

      let userIdFilter: string | null = null;
      let departmentNameFilter: string | null = null;

      if (userRole === "Regular") {
        if (!currentUserId) {
          toast({
            title: "Authentication Error",
            description: "Could not retrieve your user ID. Please try logging in again.",
            variant: "destructive",
          });
          setIsGeneratingReport(false);
          return;
        }
        userIdFilter = currentUserId;
        departmentNameFilter = null; // Regular users don't filter by department
      } else if (userRole === "Admin") {
        userIdFilter = null; // Admins can see all users' tasks
        departmentNameFilter = selectedDepartment === "all" ? null : selectedDepartment;
      } else {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to generate this report.",
          variant: "destructive",
        });
        setIsGeneratingReport(false);
        return;
      }

      const { data: tasks, error } = await supabase.rpc('get_all_tasks_with_profiles', {
        user_id_filter: userIdFilter,
        start_date_iso: startDate.toISOString(),
        end_date_iso: endDate.toISOString(),
        priority_filter: null,
        status_filter: null,
        department_name: departmentNameFilter,
      });

      if (error) throw error;

      // Sort tasks by first_name alphabetically
      const sortedTasks = tasks?.sort((a, b) => {
        const nameA = a.first_name || "";
        const nameB = b.first_name || "";
        return nameA.localeCompare(nameB);
      }) || [];

      const reportData = sortedTasks.map((task: TaskWithProfile) => ({
        "User": task.first_name || "N/A",
        "Department": task.department || "N/A",
        "Title": task.title,
        "Description": task.description || "N/A",
        "Status": task.status,
        "Priority": task.priority,
        "Due Date": task.due_date ? format(new Date(task.due_date), "PPP") : "N/A",
        "Created At": format(new Date(task.created_at), "PPP"),
        "Remarks": task.remarks || "N/A",
      })) || [];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(reportData);

      // Add a title row
      const title = userRole === "Admin" ? "Admin Task Summary Report" : "My Task Report";
      const periodText = `Period: ${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;
      const departmentText = userRole === "Admin" ? `Department: ${selectedDepartment === "all" ? "All" : selectedDepartment}` : "";

      XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws, [[periodText]], { origin: "A2" });
      if (userRole === "Admin") {
        XLSX.utils.sheet_add_aoa(ws, [[departmentText]], { origin: "A3" });
      }
      

      // Move headers down to row 5 (or 4 if no department text for regular user)
      const headerRowOffset = userRole === "Admin" ? 4 : 3; // 0-indexed, so row 5 is index 4
      XLSX.utils.sheet_add_json(ws, reportData, { origin: `A${headerRowOffset + 1}`, skipHeader: false });

      // Set column widths
      const wscols = [
        { wch: 15 }, // User
        { wch: 18 }, // Department
        { wch: 25 }, // Title
        { wch: 40 }, // Description
        { wch: 12 }, // Status
        { wch: 12 }, // Priority
        { wch: 15 }, // Due Date
        { wch: 15 }, // Created At
        { wch: 30 }, // Remarks
      ];
      ws['!cols'] = wscols;

      // Make header row bold
      const headerRowIndex = headerRowOffset;
      const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
        if (ws[cell_address]) {
          ws[cell_address].s = {
            font: { bold: true }
          };
        }
      }

      // Apply color coding to Status and Priority columns
      const statusColIndex = reportData.length > 0 ? Object.keys(reportData[0]).indexOf("Status") : -1;
      const priorityColIndex = reportData.length > 0 ? Object.keys(reportData[0]).indexOf("Priority") : -1;

      if (statusColIndex !== -1 || priorityColIndex !== -1) {
        for (let R = 0; R < reportData.length; ++R) {
          const dataRowIndex = headerRowIndex + 1 + R; // Data starts after header row
          const task = sortedTasks?.[R]; // Get the original task object for status/priority values

          if (task) {
            // Status column styling
            if (statusColIndex !== -1) {
              const statusCellAddress = XLSX.utils.encode_cell({ r: dataRowIndex, c: statusColIndex });
              if (ws[statusCellAddress]) {
                let bgColor = "FFFFFF"; // Default white
                switch (task.status) {
                  case "pending":
                    bgColor = "FFFF00"; // Yellow
                    break;
                  case "in-progress":
                    bgColor = "FFA500"; // Orange
                    break;
                  case "completed":
                    bgColor = "00FF00"; // Green
                    break;
                }
                ws[statusCellAddress].s = {
                  fill: { fgColor: { rgb: bgColor } },
                  alignment: { horizontal: "center" }
                };
              }
            }

            // Priority column styling
            if (priorityColIndex !== -1) {
              const priorityCellAddress = XLSX.utils.encode_cell({ r: dataRowIndex, c: priorityColIndex });
              if (ws[priorityCellAddress]) {
                let bgColor = "FFFFFF"; // Default white
                switch (task.priority) {
                  case "low":
                    bgColor = "D3D3D3"; // Light Gray
                    break;
                  case "medium":
                    bgColor = "ADD8E6"; // Light Blue
                    break;
                  case "high":
                    bgColor = "FF0000"; // Red
                    break;
                }
                ws[priorityCellAddress].s = {
                  fill: { fgColor: { rgb: bgColor } },
                  alignment: { horizontal: "center" }
                };
              }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "Task Report");

      const filename = `${userRole === "Admin" ? "Admin_Task_Report" : "My_Task_Report"}_${format(now, "yyyyMMdd_HHmmss")}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({
        title: "Report Generated!",
        description: "Your Excel report has been successfully downloaded.",
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
  }, [customStartDate, customEndDate, selectedDepartment, toast, userRole, currentUserId]);

  return (
    <Card className="p-6 space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          {userRole === "Admin" ? "Generate Detailed Task Report" : "Generate My Task Report"}
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

        {userRole === "Admin" && (
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
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button onClick={generateReport} disabled={isGeneratingReport || loadingUsers || !customStartDate || !customEndDate} className="w-full sm:w-auto">
            {isGeneratingReport ? (
              <span>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                Generating...
              </span>
            ) : (
              <span>
                <FileSpreadsheet className="mr-2 h-4 w-4 inline-block" />
                Generate Excel Report
              </span>
            )}
          </Button>
          {userRole === "Admin" && adminDeleteButton}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskReportGenerator;