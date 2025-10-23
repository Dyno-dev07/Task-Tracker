"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Home, ListTodo, Hourglass, PlayCircle, CheckCircle, LogOut, Menu, Settings, Users, FileText, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onLogout: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isDesktopSidebarOpen: boolean;
  userRole: "Admin" | "Regular" | null;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "All Tasks", path: "/tasks/all", icon: ListTodo },
  { name: "Pending Tasks", path: "/tasks/pending", icon: Hourglass },
  { name: "In Progress", path: "/tasks/in-progress", icon: PlayCircle },
  { name: "Completed Tasks", path: "/tasks/completed", icon: CheckCircle },
  { name: "Settings", path: "/settings", icon: Settings },
  // Admin-specific items
  { name: "User Tasks", path: "/admin/users-tasks", icon: Users, adminOnly: true },
  { name: "Task Summary", path: "/admin/task-summary", icon: BarChart2, adminOnly: true },
];

const SidebarContent: React.FC<{ onLogout: () => void; closeSidebar?: () => void; isDesktopSidebarOpen: boolean; userRole: "Admin" | "Regular" | null }> = ({ onLogout, closeSidebar, isDesktopSidebarOpen, userRole }) => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && userRole !== "Admin") {
            return null;
          }
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                !isDesktopSidebarOpen && "justify-center"
              )}
            >
              <Icon className="h-4 w-4" />
              {isDesktopSidebarOpen && item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button onClick={onLogout} className={cn("w-full flex items-center gap-3", !isDesktopSidebarOpen && "justify-center")}>
          <LogOut className="h-4 w-4" />
          {isDesktopSidebarOpen && "Logout"}
        </Button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isMobileSidebarOpen, setIsMobileSidebarOpen, isDesktopSidebarOpen, userRole }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onLogout={onLogout} closeSidebar={() => setIsMobileSidebarOpen(false)} isDesktopSidebarOpen={true} userRole={userRole} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 hidden flex-col border-r bg-background transition-all duration-300 md:flex",
      isDesktopSidebarOpen ? "w-64" : "w-20"
    )}>
      <SidebarContent onLogout={onLogout} isDesktopSidebarOpen={isDesktopSidebarOpen} userRole={userRole} />
    </aside>
  );
};

export default Sidebar;