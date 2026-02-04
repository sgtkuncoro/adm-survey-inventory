import * as React from "react";
import { cn } from "../lib/utils";
import { ArrowRight, DollarSign, Clock } from "lucide-react";

export interface SurveyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cpi: number; // in dollars
  loi: number; // in minutes (optional estimate)
  onClick?: () => void;
  isLoading?: boolean;
}

export const SurveyCard = React.forwardRef<HTMLDivElement, SurveyCardProps>(
  ({ className, cpi, loi, onClick, isLoading, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md cursor-pointer",
          className,
        )}
        onClick={onClick}
        {...props}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <DollarSign className="w-5 h-5" />
            </div>
            {loi && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~{loi} min</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            Answer Surveys
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share your opinion and earn rewards.
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="font-bold text-xl">Up to ${cpi.toFixed(2)}</div>
            <div className="bg-secondary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SurveyCard.displayName = "SurveyCard";
