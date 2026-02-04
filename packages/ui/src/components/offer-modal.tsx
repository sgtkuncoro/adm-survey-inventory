import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog"; // Changed from ./ui/dialog
import { Button } from "../button"; // Changed from ./ui/button
import { Clock, DollarSign } from "lucide-react";

export interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  cpi: number;
  loi: number;
  isLoading?: boolean;
}

export function OfferModal({
  isOpen,
  onClose,
  onStart,
  cpi,
  loi,
  isLoading,
}: OfferModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Survey Opportunity</DialogTitle>
          <DialogDescription>
            We found a survey match for you!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <DollarSign className="w-5 h-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Reward</p>
                <p className="text-2xl font-bold">${cpi.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-right">Time</p>
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-lg font-bold">~{loi}m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Answers must be truthful and consistent.</p>
            <p>• Surveys may screen you out if you don't fit the criteria.</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button
            onClick={onStart}
            disabled={isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? "Starting..." : "Start Survey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
