"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  remarks: z.string().max(1000, { message: "Remarks must not exceed 1000 characters." }).optional().nullable(),
});

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  remarks: string | null; // Added remarks field
  first_name?: string; // Optional for admin view
  department?: string; // Optional for admin view
}

interface TaskDetailsDialogProps {
  task: Task;
  onTaskUpdated: () => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ task, onTaskUpdated }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      remarks: task.remarks || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        remarks: task.remarks || "",
      });
    }
  }, [open, task, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          remarks: values.remarks,
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Remarks Updated!",
        description: "Your remarks have been successfully saved.",
      });
      setOpen(false);
      onTaskUpdated(); // Notify parent to refresh tasks
    } catch (error: any) {
      toast({
        title: "Failed to update remarks",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View task details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Details: {task.title}</DialogTitle>
          <DialogDescription>
            View full task information and add your remarks.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4"> {/* Added ScrollArea for content */}
          <div className="space-y-4 py-2">
            <div>
              <h3 className="font-semibold text-sm mb-1">Title</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{task.title}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Description</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {task.description || "No description provided."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-semibold text-sm mb-1">Status</h3>
                <Badge variant="outline">{task.status}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Priority</h3>
                <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
              </div>
            </div>
            {task.due_date && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Due Date</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(task.due_date), "PPP")}
                </p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm mb-1">Created At</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {format(new Date(task.created_at), "PPP")}
              </p>
            </div>
            {task.first_name && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Assigned User</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{task.first_name}</p>
              </div>
            )}
            {task.department && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Department</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{task.department}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add your remarks here..."
                          className="resize-y min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                      Saving Remarks...
                    </span>
                  ) : (
                    "Save Remarks"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;