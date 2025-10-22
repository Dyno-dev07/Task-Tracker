"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

interface LatestTasksSectionProps {
  tasks: Task[];
  totalTaskCount: number;
}

const LatestTasksSection: React.FC<LatestTasksSectionProps> = ({ tasks, totalTaskCount }) => {
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
    <div className="w-full max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Latest Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center">No tasks found with the current filters.</p>
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
      {totalTaskCount > 10 && (
        <div className="text-center mt-8">
          <Link to="/tasks/all">
            <Button variant="outline">View All Tasks</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LatestTasksSection;