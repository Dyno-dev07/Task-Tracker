"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const DataDeletionReminder: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mb-8 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
        <CardTitle className="text-lg text-yellow-700 dark:text-yellow-200">Important Notice</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-yellow-800 dark:text-yellow-100">
          Please be aware that all task data will be permanently deleted on the first Saturday of every month. Ensure you download any critical reports before this date.
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default DataDeletionReminder;