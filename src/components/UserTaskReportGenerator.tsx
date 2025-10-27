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
import { FileText, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

const UserTaskReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState<"week" | "month">("week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      let startDate: Date;
      let endDate: Date;
      const now = new Date();

      if (reportPeriod === "week") {
        // Calculate the start of the current Friday-to-Thursday week
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const fridayDay = 5; // Friday is 5

        // Calculate days to subtract to get to the most recent Friday
        // If today is Friday (5), subtract 0. If Saturday (6), subtract 1. If Sunday (0), subtract 2.
        // (currentDay + 7 - fridayDay) % 7
        const daysToSubtract = (currentDay + 7 - fridayDay) % 7;

        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysToSubtract);
        startDate.setHours(0, 0, 0, 0); // Set to start of the day

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // 6 days after Friday is Thursday
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
      } else { // month
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      const { data: tasks, error } = await supabase.rpc('get_my_tasks_for_report', {
        start_date_iso: startDate.toISOString(),
        end_date_iso: endDate.toISOString(),
      });

      if (error) throw error;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(18);
      doc.text("My Task Report", 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(`Period: ${format(startDate, "PPP")} - ${format(endDate, "PPP")}`, 14, yPos);
      yPos += 15;

      const tableColumn = ["Title", "Description", "Status", "Priority", "Due Date", "Created At"];
      const tableRows: any[] = [];

      tasks?.forEach((task: Task) => {
        const taskData = [
          task.title,
          task.description || "N/A",
          task.status,
          task.priority,
          task.due_date ? format(new Date(task.due_date), "PPP") : "N/A",
          format(new Date(task.created_at), "PPP"),
        ];
        tableRows.push(taskData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
      });

      doc.save(`My_Task_Report_${format(now, "yyyyMMdd_HHmmss")}.pdf`);

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
  }, [reportPeriod, toast]);

  return (
    <Card className="p-6 space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          Generate My Task Report
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
              <SelectItem value="week">Current Week (Fri-Thu)</SelectItem>
              <SelectItem value="month">Current Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateReport} disabled={isGeneratingReport} className="w-full sm:w-auto">
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

export default UserTaskReportGenerator;