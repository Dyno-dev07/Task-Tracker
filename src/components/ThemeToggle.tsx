"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeAnimation } from "@/context/ThemeAnimationContext"; // Import useThemeAnimation

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { triggerThemeAnimation } = useThemeAnimation(); // Use the new hook

  const handleThemeChange = (newTheme: string) => {
    triggerThemeAnimation(); // Trigger animation BEFORE changing theme
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("green")}>
          Green
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("purple")}>
          Purple
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("blue")}>
          Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("pink")}>
          Pink
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("orange")}>
          Orange
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}