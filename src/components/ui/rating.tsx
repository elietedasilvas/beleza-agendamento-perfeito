import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const handleMouseEnter = (star: number) => {
    if (readOnly) return;
    setHoverValue(star);
  };
  
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };
  
  const handleClick = (star: number) => {
    if (readOnly) return;
    onChange?.(star);
  };
  
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-8 w-8";
      default: return "h-6 w-6";
    }
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => {
        const isActive = (hoverValue !== null ? star <= hoverValue : star <= value);
        
        return (
          <Star
            key={star}
            className={cn(
              getSizeClass(),
              "cursor-pointer transition-colors",
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              readOnly && "cursor-default"
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}
