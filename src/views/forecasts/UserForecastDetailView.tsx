"use client";

import PredictionDialog from "@/components/forecasts/PredictionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Router from "@/constants/router";
import { Forecast, ForecastType } from "@/generated/prisma";
import {
  formatCurrency,
  formatErrorMetric,
  formatForecastValue,
  formatPercentage,
} from "@/lib/format-metrics";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Trophy } from "lucide-react";
import Link from "next/link";

type ForecastWithOrg = Forecast & {
  organization: {
    id: string;
    name: string;
  };
};

type SubmissionScope = "INDIVIDUAL" | "GROUP";

type PredictionSummary = {
  id: string;
  value: string;
  confidence: number | null;
  reasoning: string | null;
  method: string | null;
  estimatedTime: number | null;
  equityInvestment: number | null;
  debtFinancing: number | null;
  totalInvestment: number | null;
  isCorrect: boolean | null;
  highLow: string | null;
  ppVariance: number | null;
  error: number | null;
  brierScore: number | null;
  absoluteError: number | null;
  absoluteActualErrorPct: number | null;
  absoluteForecastErrorPct: number | null;
  roiScore: number | null;
  roe: number | null;
  roePct: number | null;
  financingGrossProfit: number | null;
  debtRepayment: number | null;
  rof: number | null;
  rofPct: number | null;
  netProfitEquityPlusDebt: number | null;
  roiEquityPlusDebtPct: number | null;
  profitPerHour: number | null;
  createdAt: Date;
  updatedAt: Date;
  isGroupPrediction?: boolean;
  submittedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
};

type GroupContext = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string | null;
    email: string;
  }[];
};

type SubmissionOptions = {
  canSubmitIndividual: boolean;
  canSubmitGroup: boolean;
  defaultType: SubmissionScope;
  lockedType?: SubmissionScope;
};

type UserForecastDetailViewProps = {
  forecast: ForecastWithOrg;
  prediction: PredictionSummary | null;
  groupContext?: GroupContext | null;
  submissionOptions: SubmissionOptions;
};

export default function UserForecastDetailView({
  forecast,
  prediction,
  groupContext,
  submissionOptions,
}: UserForecastDetailViewProps) {
  const options =
    forecast.type === ForecastType.CATEGORICAL && forecast.options
      ? (forecast.options as string[])
      : [];

  const isExpired = new Date(forecast.dueDate) <= new Date();
  const ctaTitle = prediction
    ? prediction.isGroupPrediction
      ? "Update Your Group Prediction"
      : "Update Your Prediction"
    : "Submit Your Prediction";
  const ctaDescription = prediction
    ? "You can update your prediction until the due date."
    : submissionOptions.canSubmitGroup && groupContext
    ? "Submit either an individual or group prediction before the due date."
    : "Make your forecast before the due date.";

  const showPerformanceCard =
    prediction &&
    forecast.actualValue !== null &&
    (prediction.isCorrect !== null ||
      prediction.error !== null ||
      prediction.brierScore !== null ||
      prediction.roiScore !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={Router.HOME}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{forecast.title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Title</dt>
            <dd className="mt-1 text-lg font-semibold">{forecast.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1">
              {forecast.description ? (
                <p className="text-sm">{forecast.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description provided
                </p>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Due Date
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {format(new Date(forecast.dueDate), "MMMM d, yyyy")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Data Release Date
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {forecast.dataReleaseDate
                ? format(new Date(forecast.dataReleaseDate), "MMMM d, yyyy")
                : "Not specified"}
            </dd>
          </div>
          {forecast.actualValue !== null && (
            <div className="border-t pt-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Actual Value
              </dt>
              <dd className="mt-1">
                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-3 py-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-green-900 dark:text-green-100">
                    {formatForecastValue(
                      forecast.actualValue,
                      forecast.dataType
                    )}
                  </span>
                </div>
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {!isExpired && (
        <Card className="border-primary">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{ctaTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {ctaDescription}
                </p>
              </div>
              <PredictionDialog
                forecastId={forecast.id}
                forecastTitle={forecast.title}
                forecastType={forecast.type}
                categoricalOptions={options}
                existingPrediction={prediction ?? undefined}
                groupContext={groupContext ?? undefined}
                submissionOptions={submissionOptions}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {groupContext && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Group</CardTitle>
              <Badge variant="secondary">{groupContext.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-sm">
                {groupContext.members.length > 0
                  ? groupContext.members
                      .map((member) => member.name || member.email)
                      .join(", ")
                  : "No members assigned"}
              </p>
            </div>
            {prediction?.isGroupPrediction && prediction.submittedBy && (
              <div className="text-sm text-muted-foreground">
                Latest group prediction submitted by{" "}
                <span className="font-medium">
                  {prediction.submittedBy.name || prediction.submittedBy.email}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {prediction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Prediction</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {prediction.isGroupPrediction ? "Group" : "Submitted"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {prediction.isGroupPrediction
                    ? "Group Prediction"
                    : "Your Prediction"}
                </div>
                <div className="text-2xl font-bold">
                  {formatForecastValue(prediction.value, forecast.dataType)}
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                {prediction.confidence !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">
                      {prediction.confidence}%
                    </span>
                  </div>
                )}
                {prediction.method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{prediction.method}</span>
                  </div>
                )}
                {prediction.estimatedTime !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Time:
                    </span>
                    <span className="font-semibold">
                      {prediction.estimatedTime} minutes
                    </span>
                  </div>
                )}
                {prediction.equityInvestment !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Equity Investment:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(prediction.equityInvestment)}
                    </span>
                  </div>
                )}
                {prediction.debtFinancing !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Debt Financing:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(prediction.debtFinancing)}
                    </span>
                  </div>
                )}
              </div>

              {prediction.reasoning && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Reasoning
                  </div>
                  <p className="text-sm leading-relaxed">
                    {prediction.reasoning}
                  </p>
                </div>
              )}

              <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                <div>
                  First submitted:{" "}
                  {format(
                    new Date(prediction.createdAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                {prediction.updatedAt.getTime() !==
                  prediction.createdAt.getTime() && (
                  <div>
                    Last updated:{" "}
                    {format(
                      new Date(prediction.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPerformanceCard && prediction && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Accuracy
                </h4>
                <div className="grid gap-3 text-sm">
                  {prediction.isCorrect !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Result:</span>
                      <Badge
                        variant={prediction.isCorrect ? "default" : "destructive"}
                      >
                        {prediction.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                  )}
                  {prediction.highLow && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Prediction Type:
                      </span>
                      <Badge
                        variant={
                          prediction.highLow === "PERFECT"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {prediction.highLow}
                      </Badge>
                    </div>
                  )}
                  {prediction.error !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Error:</span>
                      <span className="font-semibold">
                        {formatErrorMetric(prediction.error, forecast.dataType)}
                      </span>
                    </div>
                  )}
                  {prediction.absoluteError !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Absolute Error:
                      </span>
                      <span className="font-semibold">
                        {formatErrorMetric(
                          prediction.absoluteError,
                          forecast.dataType
                        )}
                      </span>
                    </div>
                  )}
                  {prediction.absoluteActualErrorPct !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Error % (vs Actual):
                      </span>
                      <span className="font-semibold">
                        {formatErrorMetric(
                          prediction.absoluteActualErrorPct,
                          null,
                          true
                        )}
                      </span>
                    </div>
                  )}
                  {prediction.absoluteForecastErrorPct !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Error % (vs Forecast):
                      </span>
                      <span className="font-semibold">
                        {formatErrorMetric(
                          prediction.absoluteForecastErrorPct,
                          null,
                          true
                        )}
                      </span>
                    </div>
                  )}
                  {prediction.absoluteForecastErrorPct !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Forecast Accuracy:
                      </span>
                      <span className="font-semibold">
                        {formatPercentage(
                          1 - (prediction.absoluteForecastErrorPct || 0)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Additional Metrics
                </h4>
                <div className="grid gap-3 text-sm">
                  {prediction.brierScore !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brier Score:</span>
                      <span className="font-semibold">
                        {prediction.brierScore?.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {prediction.roiScore !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROI Score:</span>
                      <span className="font-semibold">
                        {prediction.roiScore?.toFixed(3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
