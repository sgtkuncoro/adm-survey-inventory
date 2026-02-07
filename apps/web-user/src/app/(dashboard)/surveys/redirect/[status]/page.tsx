"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/supabase/client";

export default function SurveyRedirectPage() {
  const { status } = useParams<{ status: string }>();
  const searchParams = useSearchParams();
  const payoutCents = searchParams.get("payout");
  const payout = payoutCents ? (parseInt(payoutCents) / 100).toFixed(2) : "0.00";

  // Optional: Refresh user wallet balance on success
  useEffect(() => {
    if (status === "complete") {
      // In a real app, we might trigger a global state refresh here
      // invalidateQueries(['user', 'wallet'])
    }
  }, [status]);

  const getContent = () => {
    switch (status) {
      case "complete":
        return {
          title: "Survey Completed!",
          description: "Great job! Your reward has been added to your wallet.",
          icon: <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />,
          color: "text-green-600",
        };
      case "screenout":
        return {
          title: "Not a Match",
          description: "Thank you for your time. Unfortunately, you did not qualify for this specific survey.",
          icon: <XCircle className="h-16 w-16 text-orange-500 mb-4" />,
          color: "text-orange-600",
        };
      case "over_quota":
        return {
          title: "Quota Full",
          description: "This survey has already reached its required number of participants.",
          icon: <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />,
          color: "text-yellow-600",
        };
      case "quality_term":
        return {
          title: "Survey Ended",
          description: "The survey was terminated due to quality control checks.",
          icon: <AlertCircle className="h-16 w-16 text-red-500 mb-4" />,
          color: "text-red-600",
        };
        case "timeout":
        return {
          title: "Session Expired",
          description: "Your survey session has timed out.",
          icon: <Clock className="h-16 w-16 text-muted-foreground mb-4" />,
          color: "text-muted-foreground",
        };
      default:
        return {
          title: "Survey Ended",
          description: "The survey session has ended.",
          icon: <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />,
          color: "text-muted-foreground",
        };
    }
  };

  const content = getContent();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">{content.icon}</div>
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "complete" && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-800 font-medium">Reward Earned</p>
              <p className="text-3xl font-bold text-green-600">${payout}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild size="lg">
            <Link href="/surveys">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Surveys
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
