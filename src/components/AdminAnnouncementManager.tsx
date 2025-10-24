"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Loader2, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  content: z.string().min(10, { message: "Announcement must be at least 10 characters." }).max(500, { message: "Announcement must not exceed 500 characters." }),
  is_visible: z.boolean(),
});

interface Announcement {
  id: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const AdminAnnouncementManager: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the single announcement
  const { data: announcement, isLoading, isError, error } = useQuery<Announcement | null>({
    queryKey: ['globalAnnouncement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
        throw error;
      }
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: announcement?.content || "", // Ensure fallback for content
      is_visible: announcement?.is_visible ?? false, // Ensure fallback for boolean
    },
  });

  // Reset form values when the dialog opens or announcement data changes
  useEffect(() => {
    if (open) {
      form.reset({
        content: announcement?.content || "",
        is_visible: announcement?.is_visible ?? false,
      });
    }
  }, [open, announcement, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (announcement) {
        // Update existing announcement
        const { error } = await supabase
          .from("announcements")
          .update({
            content: values.content,
            is_visible: values.is_visible,
          })
          .eq("id", announcement.id);

        if (error) throw error;

        toast({
          title: "Announcement Updated!",
          description: "The global announcement has been successfully updated.",
        });
      } else {
        // Create new announcement
        const { error } = await supabase
          .from("announcements")
          .insert({
            content: values.content,
            is_visible: values.is_visible,
          });

        if (error) throw error;

        toast({
          title: "Announcement Created!",
          description: "A new global announcement has been created.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['globalAnnouncement'] });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to manage announcement",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isError) {
    toast({
        title: "Error loading announcement",
        description: error?.message || "Could not load global announcement.",
        variant: "destructive",
    });
    // Allow admins to create if there's an error or no announcement found
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          Manage Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit Global Announcement" : "Create Global Announcement"}</DialogTitle>
          <DialogDescription>
            {announcement ? "Update the existing announcement or toggle its visibility." : "Create a new global announcement for all users."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your announcement here..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Visible to Users</FormLabel>
                    <DialogDescription>
                      Toggle to make the announcement visible or hidden from all users.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Saving...
                </span>
              ) : (
                "Save Announcement"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAnnouncementManager;