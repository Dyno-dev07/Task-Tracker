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
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
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

type PeriodType = "all" | "day" | "week" | "month" | "year";

const AdminTaskReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [periodType, setPeriodType] = useState<PeriodType>("all");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | "all">("all"); // 0-11 as strings
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()); // Current year and last 4 years

  const months = [
    { value: "0", label: "January" }, { value: "1", label: "February" },
    { value: "2", label: "March" }, { value: "3", label: "April" },
    { value: "4", label: "May" }, { value: "5", label: "June" },
    { value: "6", label: "July" }, { value: "7", label: "August" },
    { value: "8", label: "September" }, { value: "9", label: "October" },
    { value: "10", label: "November" }, { value: "11", label: "December" },
  ];

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      const now = new Date();

      if (periodType === "day" && selectedDay) {
        startDate = startOfDay(selectedDay);
        endDate = endOfDay(selectedDay);
      } else if (periodType === "week" && selectedDay) {
        // Week from Sunday to Saturday
        startDate = startOfWeek(selectedDay, { weekStartsOn: 0 }); // Sunday
        endDate = endOfWeek(selectedDay, { weekStartsOn: 0 }); // Saturday
      } else if (periodType === "month" && selectedMonth !== "all" && selectedYear !== "all") {
        const yearNum = parseInt(selectedYear);
        const monthNum = parseInt(selectedMonth);
        startDate = startOfMonth(new Date(yearNum, monthNum));
        endDate = endOfMonth(new Date(yearNum, monthNum));
      } else if (periodType === "year" && selectedYear !== "all") {
        const yearNum = parseInt(selectedYear);
        startDate = startOfYear(new Date(yearNum, 0, 1));
        endDate = endOfYear(new Date(yearNum, 11, 31));
      }
      // If periodType is "all", startDate and endDate remain null, fetching all tasks.

      const { data: tasks, error } = await supabase.rpc('get_all_tasks_with_profiles', {
        user_id_filter: null,
        start_date_iso: startDate ? startDate.toISOString() : null,
        end_date_iso: endDate ? endDate.toISOString() : null,
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
      let periodText = "All Time";
      if (startDate && endDate) {
        periodText = `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;
      } else if (periodType === "year" && selectedYear !== "all") {
        periodText = `Year: ${selectedYear}`;
      } else if (periodType === "month" && selectedMonth !== "all" && selectedYear !== "all") {
        periodText = `Month: ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
      } else if (periodType === "day" && selectedDay) {
        periodText = `Day: ${format(selectedDay, "PPP")}`;
      } else if (periodType === "week" && selectedDay) {
        periodText = `Week of: ${format(startOfWeek(selectedDay, { weekStartsOn: 0 }), "PPP")}`;
      }

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
  }, [periodType, selectedDay, selectedMonth, selectedYear, selectedDepartment, toast, months, years]);

  return (
    <Card className="p-6 space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          Generate Detailed Task Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="period-type" className="w-full sm:w-auto text-left sm:text-right">Report Period Type:</label>
          <Select onValueChange={(value: PeriodType) => {
            setPeriodType(value);
            // Reset specific date selections when period type changes
            setSelectedDay(undefined);
            setSelectedMonth("all");
            setSelectedYear("all");
          }} value={periodType}>
            <SelectTrigger id="period-type" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Specific Day</SelectItem>
              <SelectItem value="week">Specific Week</SelectItem>
              <SelectItem value="month">Specific Month</SelectItem>
              <SelectItem value="year">Specific Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(periodType === "day" || periodType === "week") && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="select-day" className="w-full sm:w-auto text-left sm:text-right">Select Day:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[180px] justify-start text-left font-normal",
                    !selectedDay && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDay ? format(selectedDay, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  initialFocus
                />
                {selectedDay && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setSelectedDay(undefined)} className="w-full">Clear Day</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {(periodType === "month" || periodType === "year") && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="select-year" className="w-full sm:w-auto text-left sm:text-right">Select Year:</label>
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger id="select-year" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {periodType === "month" && selectedYear !== "all" && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="select-month" className="w-full sm:w-auto text-left sm:text-right">Select Month:</label>
            <Select onValueChange={setSelectedMonth} value={selectedMonth}>
              <SelectTrigger id="select-month" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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