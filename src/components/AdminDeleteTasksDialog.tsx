"use client";

import React, { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AdminDeleteTasksDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = useCallback(async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both a start and an end date for the deletion range.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_tasks_by_date_range', {
        start_date_iso: startOfDay(startDate).toISOString(),
        end_date_iso: endOfDay(endDate).toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Tasks Deleted!",
        description: "Task records within the selected range have been successfully deleted.",
      });
      setOpen(false);
      setStartDate(undefined);
      setEndDate(undefined);
      // Invalidate all relevant queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['overallTasksStats'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allTasksSummaryCounts'] });
      queryClient.invalidateQueries({ queryKey: ['allTasksWithProfiles'] });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [startDate, endDate, toast, queryClient]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Task Records
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task Records by Date Range</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all task records
            created within the selected date range from the database.
            <br /><br />
            Please select a start and end date for the deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="start-date" className="text-left text-sm font-medium">Start Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
                {startDate && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setStartDate(undefined)} className="w-full">Clear Start Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="end-date" className="text-left text-sm font-medium">End Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
                {endDate && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setEndDate(undefined)} className="w-full">Clear End Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting || !startDate || !endDate} className="bg-red-500 hover:bg-red-600">
            {isDeleting ? (
              <span>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                Deleting...
              </span>
            ) : (
              "Delete Records"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminDeleteTasksDialog;