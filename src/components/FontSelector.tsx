"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFont } from "@/context/FontContext";
import { Label } from "@/components/ui/label";

const FontSelector: React.FC = () => {
  const { font, setFont } = useFont();

  return (
    <div className="space-y-2">
      <Label htmlFor="font-select">Select Font</Label>
      <Select value={font} onValueChange={(value: "inter" | "roboto" | "poppins") => setFont(value)}>
        <SelectTrigger id="font-select" className="w-[180px]">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inter">Inter</SelectItem>
          <SelectItem value="roboto">Roboto</SelectItem>
          <SelectItem value="poppins">Poppins</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSelector;