"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value from 0 to 100 */
  value?: number;
  /** Color variant for the progress fill */
  variant?: "default" | "success" | "warning" | "muted";
}

const progressVariants = {
  default: "bg-pink-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  muted: "bg-gray-400",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, variant = "success", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "h-1.5 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            progressVariants[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
