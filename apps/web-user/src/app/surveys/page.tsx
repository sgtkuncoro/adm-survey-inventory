"use client";

import { useState } from "react";
import { useUserEligibility, useStartSession } from "@/hooks/use-surveys";
import { SurveyCard } from "@/components/survey-card";
import { OfferModal } from "@/components/offer-modal";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SurveyFeedPage() {
  const { data: eligibility, isLoading, error, refetch, isRefetching } = useUserEligibility();
  const { mutate: startSession, isPending: isStarting } = useStartSession();

  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  const handleStartClick = (survey: any) => {
    setSelectedSurvey(survey);
  };

  const handleConfirmStart = () => {
    if (!selectedSurvey) return;

    startSession(selectedSurvey.id, {
      onSuccess: (data: any) => {
        // Redirect to survey entry URL
        window.location.href = data.entryUrl;
      },
      onError: (err) => {
        toast.error("Failed to start survey: " + err.message);
        setSelectedSurvey(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Finding the best surveys for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-red-500">Failed to load surveys.</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const surveys = eligibility?.surveys || [];
  const bestBid = eligibility?.bestBid;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Surveys</h1>
          <p className="text-muted-foreground mt-1">
            Complete surveys to earn rewards.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium mb-2">No surveys available right now</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We couldn't find any surveys matching your profile at the moment. 
            Inventory changes frequently, so please check back later.
          </p>
          <Button onClick={() => refetch()}>Check Again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey: any) => (
            <div key={survey.id} className="h-full">
              <SurveyCard
                id={survey.id}
                providerName="Partner Network" // We might want to pass provider name if available, or keep generic
                cpi={survey.cpi}
                loi={survey.loi || 15}
                isBestMatch={bestBid?.externalBidId === survey.id}
              />
              <div className="mt-2 hidden">
                {/* Hidden trigger for modal logic if we want to bypass link navigation */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 
        Note: The SurveyCard currently links to /surveys/[id]/start. 
        We can either implement that route OR intercept the click.
        For now, let's assume we want to use the Modal on this page 
        instead of a separate page.
        
        To do that, we strictly need to change SurveyCard to accept an onClick 
        OR we handle the routing on /surveys/[id]/start to just redirect.
        
        Let's stick to the modal approach here for better UX. 
        I'll wrap the cards in a way to capture clicks if SurveyCard allows, 
        or I'll update SurveyCard to accept onStart.
        
        Actually, SurveyCard uses a Link. Let's create the /surveys/[id]/start route 
        to handle the intermediate state, OR simpler: 
        Re-write SurveyCard usage here to pass an onClick if I modify SurveyCard.
        
        Let's modify SurveyCard to be more flexible first.
      */}

      <OfferModal
        isOpen={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        survey={
          selectedSurvey
            ? {
                id: selectedSurvey.id,
                cpi: selectedSurvey.cpi,
                loi: selectedSurvey.loi || 15,
                providerName: "Partner Network",
                externalId: selectedSurvey.id,
              }
            : null
        }
        onStart={handleConfirmStart}
      />
    </div>
  );
}
