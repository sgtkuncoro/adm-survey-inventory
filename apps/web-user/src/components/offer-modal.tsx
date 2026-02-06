"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, ExternalLink } from "lucide-react";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: {
    id: string;
    cpi: number;
    loi: number;
    providerName: string;
    externalId: string;
  } | null;
  onStart: () => void;
}

export function OfferModal({ isOpen, onClose, survey, onStart }: OfferModalProps) {
  if (!survey) return null;

  const payout = (survey.cpi / 100 / 2).toFixed(2); // 50% payout

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Survey</DialogTitle>
          <DialogDescription>
            You are about to start a survey provided by {survey.providerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Estimated Reward</p>
            <div className="flex items-center text-2xl font-bold text-green-600">
              <DollarSign className="h-5 w-5 mr-1" />
              {payout}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Estimated Time</p>
             <div className="flex items-center text-2xl font-bold">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              {survey.loi} <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" className="w-full" size="lg" onClick={onStart}>
            Start Survey
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
