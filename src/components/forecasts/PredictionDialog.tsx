"use client";

import PredictionForm, {
  GroupSubmissionContext,
  PredictionSubmissionOptions,
} from "@/components/forecasts/PredictionForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ForecastType, PredictionType } from "@/generated/prisma";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";

type PredictionDialogProps = {
  forecastId: string;
  forecastTitle: string;
  forecastType: ForecastType;
  forecastPredictionType?: PredictionType;
  categoricalOptions?: string[];
  existingPrediction?: {
    id: string;
    value: string;
    confidence: number | null;
    reasoning: string | null;
    method: string | null;
    estimatedTime: number | null;
    equityInvestment: number | null;
    debtFinancing: number | null;
    isGroupPrediction?: boolean;
    submittedBy?: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
  groupContext?: GroupSubmissionContext | null;
  submissionOptions?: PredictionSubmissionOptions;
};

export default function PredictionDialog({
  forecastId,
  forecastTitle,
  forecastType,
  forecastPredictionType,
  categoricalOptions = [],
  existingPrediction,
  groupContext,
  submissionOptions,
}: PredictionDialogProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isUpdate = !!existingPrediction;

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setShowSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {isUpdate ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Update Prediction
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Make Prediction {/* ← CHANGED HERE */}
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Prediction submitted</DialogTitle>
              <DialogDescription>
                Your prediction for &quot;{forecastTitle}&quot; has been saved
                successfully.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setOpen(false);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isUpdate ? "Update Your Prediction" : "Make Your Prediction"}
              </DialogTitle>
              <DialogDescription>
                {isUpdate
                  ? `Update your prediction for "${forecastTitle}".`
                  : `Submit your prediction for "${forecastTitle}".`}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <PredictionForm
                forecastId={forecastId}
                forecastType={forecastType}
                forecastPredictionType={forecastPredictionType}
                categoricalOptions={categoricalOptions}
                existingPrediction={existingPrediction}
                onSuccess={handleSuccess}
                groupContext={groupContext}
                submissionOptions={submissionOptions}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
