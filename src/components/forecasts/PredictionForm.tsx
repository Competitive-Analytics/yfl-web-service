"use client";

import {
  createPredictionAction,
  updatePredictionAction,
} from "@/app/(protected)/(user)/f/[forecastId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ForecastType } from "@/generated/prisma";
import { useActionState, useEffect } from "react";

type PredictionFormProps = {
  forecastId: string;
  forecastType: ForecastType;
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
  } | null;
  isReadOnly?: boolean;
  onSuccess?: () => void;
};

// Central list of method options for the dropdown
export const METHOD_OPTIONS = [
  "Guess / POOMA",
  "Intuitive / Educated Guess / Feeling / SWAG",
  "Visual Extrapolation",
  "Experiential Judgment (Internal Source)",
  "Experiential Judgment (External / 3rd Party Source)",
  "Subject Matter Experts (Internal Source)",
  "Subject Matter Experts (External / 3rd Party Source)",
  "Survey / Interview / Dialogue",
  "Focus Group / Strategic Polylogue",
  "Blind Software Output",
  "Simple Statistics (Averages, Medians, etc.)",
  "Moving Averages / Weighted Moving Averages",
  "Exponential Smoothing",
  "Percentile Distributions",
  "ARIMA",
  "Bivariate Linear Regression",
  "Multivariate Regression",
  "Analogue / Other",
  "Ensemble – Multiple QUAL Methods / Scenarios",
  "Ensemble – Multiple QUANT Methods / Scenarios",
  "Ensemble – QUANT + QUAL Methods / Scenarios",
  "AI / Machine Learning Model",
] as const;

export default function PredictionForm({
  forecastId,
  forecastType,
  categoricalOptions = [],
  existingPrediction,
  isReadOnly = false,
  onSuccess,
}: PredictionFormProps) {
  const isUpdate = !!existingPrediction;

  const [state, formAction, isPending] = useActionState(
    isUpdate
      ? updatePredictionAction.bind(
          null,
          existingPrediction.id,
          forecastId,
          forecastType
        )
      : createPredictionAction.bind(null, forecastId, forecastType),
    undefined
  );

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  // Show success message if submission was successful
  if (state?.success) {
    return (
      <div className="rounded-lg border border-green-500 bg-green-50 p-4">
        <h3 className="font-semibold text-green-900">
          {isUpdate ? "Prediction Updated!" : "Prediction Submitted!"}
        </h3>
        <p className="text-sm text-green-700 mt-1">
          {isUpdate
            ? "Your prediction has been successfully updated."
            : "Your prediction has been successfully recorded."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.errors?._form && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {state.errors._form.join(", ")}
          </p>
        </div>
      )}

      {/* Prediction Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Prediction Details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Value Input - varies by forecast type */}
          <div className="space-y-2">
            <Label htmlFor="value">
              Your Prediction <span className="text-destructive">*</span>
            </Label>

            {forecastType === ForecastType.BINARY && (
              <Select
                name="value"
                defaultValue={
                  state?.data?.value || existingPrediction?.value || ""
                }
                disabled={isReadOnly || isPending}
              >
                <SelectTrigger
                  className={state?.errors?.value ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select your prediction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            )}

            {forecastType === ForecastType.CONTINUOUS && (
              <Input
                type="number"
                step="any"
                id="value"
                name="value"
                placeholder="Enter a numerical value"
                defaultValue={
                  state?.data?.value || existingPrediction?.value || ""
                }
                disabled={isReadOnly || isPending}
                aria-invalid={!!state?.errors?.value}
                className={state?.errors?.value ? "border-destructive" : ""}
              />
            )}

            {forecastType === ForecastType.CATEGORICAL && (
              <Select
                name="value"
                defaultValue={
                  state?.data?.value || existingPrediction?.value || ""
                }
                disabled={isReadOnly || isPending}
              >
                <SelectTrigger
                  className={state?.errors?.value ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {state?.errors?.value && (
              <p className="text-sm text-destructive">
                {state.errors.value.join(", ")}
              </p>
            )}
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <Label htmlFor="confidence">
              Confidence Level (0-100){" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              type="number"
              id="confidence"
              name="confidence"
              min="0"
              max="100"
              placeholder="e.g., 75"
              defaultValue={
                state?.data?.confidence ||
                existingPrediction?.confidence?.toString() ||
                ""
              }
              disabled={isReadOnly || isPending}
              aria-invalid={!!state?.errors?.confidence}
              className={state?.errors?.confidence ? "border-destructive" : ""}
            />
            {state?.errors?.confidence && (
              <p className="text-sm text-destructive">
                {state.errors.confidence.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              How confident are you? (0-100)
            </p>
          </div>
        </div>
      </div>

      {/* Financial Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Financial Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Equity Investment - NOW REQUIRED */}
          <div className="space-y-2">
            <Label htmlFor="equityInvestment">
              Equity Investment <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              id="equityInvestment"
              name="equityInvestment"
              min="0"
              max="20000000"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0 – 20,000,000"
              defaultValue={
                state?.data?.equityInvestment ||
                existingPrediction?.equityInvestment?.toString() ||
                ""
              }
              disabled={isReadOnly || isPending}
              aria-invalid={!!state?.errors?.equityInvestment}
              className={
                state?.errors?.equityInvestment ? "border-destructive" : ""
              }
            />
            {state?.errors?.equityInvestment && (
              <p className="text-sm text-destructive">
                {state.errors.equityInvestment.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Whole-dollar amount (no decimals)
            </p>
          </div>

          {/* Debt Financing */}
          <div className="space-y-2">
            <Label htmlFor="debtFinancing">
              Debt Financing <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              id="debtFinancing"
              name="debtFinancing"
              min="0"
              placeholder="e.g., 5000"
              defaultValue={
                state?.data?.debtFinancing ||
                existingPrediction?.debtFinancing?.toString() ||
                ""
              }
              disabled={isReadOnly || isPending}
              aria-invalid={!!state?.errors?.debtFinancing}
              className={
                state?.errors?.debtFinancing ? "border-destructive" : ""
              }
            />
            {state?.errors?.debtFinancing && (
              <p className="text-sm text-destructive">
                {state.errors.debtFinancing.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Amount of debt financing
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Methodology</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="method">
              Method <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Select
              name="method"
              defaultValue={
                state?.data?.method || existingPrediction?.method || ""
              }
              disabled={isReadOnly || isPending}
            >
              <SelectTrigger
                className={state?.errors?.method ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.method && (
              <p className="text-sm text-destructive">
                {state.errors.method.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Prediction method used
            </p>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">
              Estimated Time (minutes){" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              type="number"
              id="estimatedTime"
              name="estimatedTime"
              min="0"
              placeholder="e.g., 30"
              defaultValue={
                state?.data?.estimatedTime ||
                existingPrediction?.estimatedTime?.toString() ||
                ""
              }
              disabled={isReadOnly || isPending}
              aria-invalid={!!state?.errors?.estimatedTime}
              className={
                state?.errors?.estimatedTime ? "border-destructive" : ""
              }
            />
            {state?.errors?.estimatedTime && (
              <p className="text-sm text-destructive">
                {state.errors.estimatedTime.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Time spent on prediction
            </p>
          </div>
        </div>

        {/* Reasoning - Full Width */}
        <div className="space-y-2">
          <Label htmlFor="reasoning">
            Reasoning <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Textarea
            id="reasoning"
            name="reasoning"
            placeholder="Explain your reasoning..."
            rows={4}
            maxLength={1000}
            defaultValue={
              state?.data?.reasoning || existingPrediction?.reasoning || ""
            }
            disabled={isReadOnly || isPending}
            aria-invalid={!!state?.errors?.reasoning}
            className={state?.errors?.reasoning ? "border-destructive" : ""}
          />
          {state?.errors?.reasoning && (
            <p className="text-sm text-destructive">
              {state.errors.reasoning.join(", ")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Share your thought process (max 1000 characters)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      {!isReadOnly && (
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isUpdate
              ? "Updating..."
              : "Submitting..."
            : isUpdate
            ? "Update Prediction"
            : "Submit Prediction"}
        </Button>
      )}
    </form>
  );
}
