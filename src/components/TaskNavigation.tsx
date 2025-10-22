"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TaskNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: "Pending Tasks", path: "/tasks/pending" },
    { name: "In Progress", path: "/tasks/in-progress" },
    { name: "Completed Tasks", path: "/tasks/completed" },
  ];

  return (
    <nav className="mb-8">
      <ul className="flex flex-wrap justify-center gap-4">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "outline"}
                className={cn(
                  "transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.name}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TaskNavigation;