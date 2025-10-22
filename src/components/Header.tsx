"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

interface HeaderProps {
  onTaskCreated: () => void;
  onOpenMobileSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTaskCreated, onOpenMobileSidebar }) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      )}
      <div className="flex-grow"></div> {/* Spacer */}
      {!isMobile && (
        <CreateTaskDialog onTaskCreated={onTaskCreated} />
      )}
    </header>
  );
};

export default Header;