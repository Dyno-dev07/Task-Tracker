"use client";

import React from "react";
import TaskStatsCard from "./TaskStatsCard";
import { ListTodo, Hourglass, CheckCircle, XCircle } from "lucide-react";

interface DashboardStatsProps {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalTasks,
  pendingTasks,
  inProgressTasks,
  completedTasks,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TaskStatsCard
        title="Total Tasks"
        value={totalTasks}
        icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
      />
      <TaskStatsCard
        title="Pending Tasks"
        value={pendingTasks}
        icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
      />
      <TaskStatsCard
        title="In Progress"
        value={inProgressTasks}
        icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <TaskStatsCard
        title="Completed Tasks"
        value={completedTasks}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};

export default DashboardStats;