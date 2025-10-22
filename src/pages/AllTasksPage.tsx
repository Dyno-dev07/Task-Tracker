"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

const AllTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

    if (selectedDate) {
      const startOfDay = format(selectedDate, "yyyy-MM-ddT00:00:00.000Z");
      const endOfDay = format(selectedDate, "yyyy-MM-ddT23:59:59.999Z");
      query = query.gte("created_at", startOfDay).lte("created_at", endOfDay);
    }
    if (selectedPriority !== "all") {
      query = query.eq("priority", selectedPriority);
    }
    if (selectedStatus !== "all") {
      query = query.eq("status", selectedStatus);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
      setTasks([]);
    } else {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [toast, selectedDate, selectedPriority, selectedStatus]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  const getPriorityBadgeVariant = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-4xl text-center space-y-6 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Your Tasks</h1>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {/* Calendar Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
                {selectedDate && (
                  <div className="p-2">
                    <Button variant="ghost" onClick={() => setSelectedDate(undefined)} className="w-full">Clear Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Priority Filter */}
            <Select onValueChange={(value: "all" | "low" | "medium" | "high") => setSelectedPriority(value)} value={selectedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select onValueChange={(value: "all" | "pending" | "in-progress" | "completed") => setSelectedStatus(value)} value={selectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-lg text-gray-600 dark:text-gray-400">No tasks found with the current filters.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <Card key={task.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                      <Badge variant="outline">{task.status}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.description && <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{task.description}</p>}
                    {task.due_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {format(new Date(task.due_date), "PPP")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {format(new Date(task.created_at), "PPP")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default AllTasksPage;