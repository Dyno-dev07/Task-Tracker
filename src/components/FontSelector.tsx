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
      <Select value={font} onValueChange={(value: "inter" | "roboto" | "poppins" | "times-new-roman" | "montserrat" | "playfair-display" | "bebas-neue") => setFont(value)}>
        <SelectTrigger id="font-select" className="w-[180px]">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inter">Inter</SelectItem>
          <SelectItem value="roboto">Roboto</SelectItem>
          <SelectItem value="poppins">Poppins</SelectItem>
          <SelectItem value="times-new-roman">Times New Roman</SelectItem>
          <SelectItem value="montserrat">Montserrat</SelectItem>
          <SelectItem value="playfair-display">Playfair Display</SelectItem>
          <SelectItem value="bebas-neue">Bebas Neue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSelector;