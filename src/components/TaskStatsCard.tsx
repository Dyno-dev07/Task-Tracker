"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom"; // Import Link

interface TaskStatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  iconColor?: string;
  to: string; // New prop for navigation path
}

const TaskStatsCard: React.FC<TaskStatsCardProps> = ({ title, value, icon, iconColor, to }) => {
  return (
    <Link
      to={to}
      className="block transition-transform duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95" // Bounce animation
    >
      <Card className="w-full max-w-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className={cn("h-4 w-4", iconColor)}>{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TaskStatsCard;