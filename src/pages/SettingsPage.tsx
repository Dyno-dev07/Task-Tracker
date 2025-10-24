"use client";

import React from "react";
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // Re-adding this import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import FontSelector from "@/components/FontSelector";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage: React.FC = () => {
  return (
    <PageTransitionWrapper>
      <div className="flex flex-col items-center w-full p-4 md:p-6">
        <div className="w-full max-w-2xl space-y-8 mt-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <SettingsIcon className="h-10 w-10 text-primary" />
            Settings
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span>Choose your preferred theme:</span>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <FontSelector />
            </CardContent>
          </Card>

          {/* Future customization options can be added here */}
        </div>
      </div>
    </PageTransitionWrapper>
  );
};

export default SettingsPage;