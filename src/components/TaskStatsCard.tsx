"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskStatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

const TaskStatsCard: React.FC<TaskStatsCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default TaskStatsCard;