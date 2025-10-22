"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn for conditional class merging

interface TaskStatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  iconColor?: string; // New prop for icon color
}

const TaskStatsCard: React.FC<TaskStatsCardProps> = ({ title, value, icon, iconColor }) => {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={cn("h-4 w-4", iconColor)}>{icon}</div>} {/* Apply iconColor here */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default TaskStatsCard;