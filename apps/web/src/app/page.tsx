"use client";

import { useState } from "react";
import { useEligibility, useStartSession } from "@/hooks/use-surveys";
import { SurveyCard, OfferModal } from "@packages/ui";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: eligibility, isLoading, error } = useEligibility();
  const { mutate: startSession, isPending: isStarting } = useStartSession();

  const [selectedBid, setSelectedBid] = useState<{
    bidId: string;
    cpi: number;
    loi: number;
  } | null>(null);

  const handleStart = () => {
    if (!selectedBid) return;

    startSession(selectedBid.bidId, {
      onSuccess: (data: any) => {
        window.open(data.url, "_blank");
        setSelectedBid(null);
      },
      onError: (err) => {
        alert("Failed to start survey: " + err.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading surveys. Please try again later.
      </div>
    );
  }

  // Assuming eligibility returns an object with `bestBid` or `eligibleBids`
  // Adjust based on actual API response structure from apps/worker/src/lib/surveys/eligibility.ts
  const bestBid = eligibility?.bestBid;
  const hasSurveys = !!bestBid;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mission Feed</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {bestBid ? (
          <>
            <SurveyCard
              cpi={bestBid.cpiCents / 100} // Convert cents to dollars
              loi={15} // Default estimate (API doesn't return LOI yet)
              onClick={() =>
                setSelectedBid({
                  bidId: bestBid.externalBidId,
                  cpi: bestBid.cpiCents / 100,
                  loi: 15,
                })
              }
            />
          </>
        ) : (
          <div className="col-span-full text-center p-12 border rounded-xl bg-muted/10">
            <h3 className="text-xl font-semibold mb-2">No Surveys Available</h3>
            <p className="text-muted-foreground">
              Check back later for new opportunities.
            </p>
          </div>
        )}
      </div>

      {selectedBid && (
        <OfferModal
          isOpen={!!selectedBid}
          onClose={() => setSelectedBid(null)}
          onStart={handleStart}
          cpi={selectedBid.cpi}
          loi={selectedBid.loi}
          isLoading={isStarting}
        />
      )}
    </div>
  );
}
