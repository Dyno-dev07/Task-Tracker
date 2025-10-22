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

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    console.log("Current active theme:", theme);
  }, [theme]);

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
        <DropdownMenuItem onClick={() => { setTheme("light"); console.log("Attempting to set theme to light"); }}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("dark"); console.log("Attempting to set theme to dark"); }}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("green"); console.log("Attempting to set theme to green"); }}>
          Green
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("purple"); console.log("Attempting to set theme to purple"); }}>
          Purple
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("blue"); console.log("Attempting to set theme to blue"); }}>
          Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("pink"); console.log("Attempting to set theme to pink"); }}>
          Pink
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("orange"); console.log("Attempting to set theme to orange"); }}>
          Orange
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme("system"); console.log("Attempting to set theme to system"); }}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}