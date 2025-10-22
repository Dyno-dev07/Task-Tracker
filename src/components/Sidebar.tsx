"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Home, ListTodo, Hourglass, PlayCircle, CheckCircle, LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onLogout: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Pending Tasks", path: "/tasks/pending", icon: Hourglass },
  { name: "In Progress", path: "/tasks/in-progress", icon: PlayCircle },
  { name: "Completed Tasks", path: "/tasks/completed", icon: CheckCircle },
];

const SidebarContent: React.FC<{ onLogout: () => void; closeSidebar?: () => void }> = ({ onLogout, closeSidebar }) => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button onClick={onLogout} className="w-full flex items-center gap-3">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
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
          <SidebarContent onLogout={onLogout} closeSidebar={() => setIsMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background md:flex">
      <SidebarContent onLogout={onLogout} />
    </aside>
  );
};

export default Sidebar;