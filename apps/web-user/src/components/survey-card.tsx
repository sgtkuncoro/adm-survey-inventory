import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SurveyCardProps {
  id: string;
  providerName: string;
  cpi: number; // in cents
  loi: number; // in minutes
  stars?: number;
  isBestMatch?: boolean;
  onStart?: () => void;
}

export function SurveyCard({
  id,
  providerName,
  cpi,
  loi,
  stars = 4,
  isBestMatch,
  onStart,
}: SurveyCardProps) {
  const payout = (cpi / 100 / 2).toFixed(2); // Assuming 50% payout share

  return (
    <Card className={cn("flex flex-col h-full hover:border-primary/50 transition-colors", isBestMatch && "border-primary shadow-md")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Survey Opportunity</CardTitle>
            <CardDescription className="text-xs mt-1">
              Provided by {providerName}
            </CardDescription>
          </div>
          {isBestMatch && (
            <Badge className="bg-primary text-primary-foreground text-xs py-0.5 px-2">
              Best Match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Earn
            </span>
            <div className="flex items-center text-green-600 font-bold text-xl">
              <DollarSign className="h-4 w-4 mr-0.5" />
              {payout}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Time
            </span>
            <div className="flex items-center font-medium text-lg">
              <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {loi} <span className="text-xs ml-1 text-muted-foreground font-normal">min</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {onStart ? (
          <Button onClick={onStart} className="w-full font-semibold">
              Start Survey
              <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button asChild className="w-full font-semibold">
            <Link href={`/surveys/${id}/start`}>
              Start Survey
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
