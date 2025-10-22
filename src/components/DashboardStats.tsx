"use client";

import React from "react";
import TaskStatsCard from "./TaskStatsCard";
import { ListTodo, Hourglass, PlayCircle, CheckCircle } from "lucide-react";

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
        icon={<ListTodo />}
        iconColor="text-blue-500 dark:text-blue-400"
      />
      <TaskStatsCard
        title="Pending Tasks"
        value={pendingTasks}
        icon={<Hourglass />}
        iconColor="text-yellow-500 dark:text-yellow-400"
      />
      <TaskStatsCard
        title="In Progress"
        value={inProgressTasks}
        icon={<PlayCircle />}
        iconColor="text-orange-500 dark:text-orange-400"
      />
      <TaskStatsCard
        title="Completed Tasks"
        value={completedTasks}
        icon={<CheckCircle />}
        iconColor="text-green-500 dark:text-green-400"
      />
    </div>
  );
};

export default DashboardStats;