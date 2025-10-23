"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const GlobalAnnouncementDisplay: React.FC = () => {
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8 flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading announcement...</span>
      </div>
    );
  }

  if (isError) {
    // Optionally show a toast for the error, but don't block rendering if it's just an announcement
    console.error("Error fetching global announcement:", error);
    return null;
  }

  if (!announcement || !announcement.is_visible || !announcement.content) {
    return null; // Don't render if no announcement, not visible, or empty content
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
        <CardTitle className="text-lg text-yellow-700 dark:text-yellow-200">Important Notice</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-yellow-800 dark:text-yellow-100">
          {announcement.content}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default GlobalAnnouncementDisplay;