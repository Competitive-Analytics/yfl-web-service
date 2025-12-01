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

type UserForecastDetailViewProps = {
  forecast: ForecastWithOrg;
  existingPrediction?: {
    id: string;
    value: string;
    confidence: number | null;
    reasoning: string | null;
    method: string | null;
    estimatedTime: number | null;
    equityInvestment: number | null;
    debtFinancing: number | null;
    // Prediction metrics (populated after actual value is released)
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
  } | null;
};

export default function UserForecastDetailView({
  forecast,
  existingPrediction,
}: UserForecastDetailViewProps) {
  const options =
    forecast.type === ForecastType.CATEGORICAL && forecast.options
      ? (forecast.options as string[])
      : [];

  const isExpired = new Date(forecast.dueDate) <= new Date();

  return (
    <div className="space-y-6">
      {/* Header with back button and leaderboard */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={Router.HOME}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{forecast.title}</h1>
        </div>

      {/* Top-right Make Prediction button (hidden after due date) */}
      {!isExpired && (
          <PredictionDialog
            forecastId={forecast.id}
            forecastTitle={forecast.title}
            forecastType={forecast.type}
            categoricalOptions={options}
            existingPrediction={existingPrediction}
          />
        )}
      </div>

      {/* Key Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Title</dt>
            <dd className="mt-1 text-lg font-semibold">{forecast.title}</dd>
          </div>

          {/* Description */}
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

          {/* Due Date */}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Due Date
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {format(new Date(forecast.dueDate), "MMMM d, yyyy")}
            </dd>
          </div>

          {/* Data Release Date */}
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

          {/* Actual Value (if exists) */}
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

      {/* Your Prediction (if submitted) */}
      {existingPrediction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Prediction</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Submitted
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Prediction Value - Highlighted */}
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Your Prediction
                </div>
                <div className="text-2xl font-bold">
                  {formatForecastValue(
                    existingPrediction.value,
                    forecast.dataType
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid gap-3 text-sm">
                {existingPrediction.confidence !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">
                      {existingPrediction.confidence}%
                    </span>
                  </div>
                )}
                {existingPrediction.method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">
                      {existingPrediction.method}
                    </span>
                  </div>
                )}
                {existingPrediction.estimatedTime !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Time:
                    </span>
                    <span className="font-semibold">
                      {existingPrediction.estimatedTime} minutes
                    </span>
                  </div>
                )}
                {existingPrediction.equityInvestment !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Equity Investment:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(existingPrediction.equityInvestment)}
                    </span>
                  </div>
                )}
                {existingPrediction.debtFinancing !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Debt Financing:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(existingPrediction.debtFinancing)}
                    </span>
                  </div>
                )}
              </div>

              {existingPrediction.reasoning && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Reasoning
                  </div>
                  <p className="text-sm leading-relaxed">
                    {existingPrediction.reasoning}
                  </p>
                </div>
              )}

              {/* Submission timestamps */}
              <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                <div>
                  First submitted:{" "}
                  {format(
                    new Date(existingPrediction.createdAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                {existingPrediction.updatedAt.getTime() !==
                  existingPrediction.createdAt.getTime() && (
                  <div>
                    Last updated:{" "}
                    {format(
                      new Date(existingPrediction.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics (shown after actual value is released) */}
      {existingPrediction &&
        forecast.actualValue !== null &&
        (existingPrediction.isCorrect !== null ||
          existingPrediction.error !== null ||
          existingPrediction.brierScore !== null ||
          existingPrediction.roiScore !== null) && (
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Accuracy Metrics */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Accuracy
                  </h4>
                  <div className="grid gap-3 text-sm">
                    {existingPrediction.isCorrect !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Result:</span>
                        <Badge
                          variant={
                            existingPrediction.isCorrect
                              ? "default"
                              : "destructive"
                          }
                        >
                          {existingPrediction.isCorrect
                            ? "Correct"
                            : "Incorrect"}
                        </Badge>
                      </div>
                    )}
                    {existingPrediction.highLow && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Prediction Type:
                        </span>
                        <Badge
                          variant={
                            existingPrediction.highLow === "PERFECT"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {existingPrediction.highLow}
                        </Badge>
                      </div>
                    )}
                    {existingPrediction.error !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Error:</span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.error,
                            forecast.dataType
                          )}
                        </span>
                      </div>
                    )}
                    {existingPrediction.absoluteError !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Absolute Error:
                        </span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.absoluteError,
                            forecast.dataType
                          )}
                        </span>
                      </div>
                    )}
                    {existingPrediction.absoluteActualErrorPct !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Error % (vs Actual):
                        </span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.absoluteActualErrorPct,
                            null,
                            true
                          )}
                        </span>
                      </div>
                    )}
                    {existingPrediction.absoluteForecastErrorPct !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Error % (vs Forecast):
                        </span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.absoluteForecastErrorPct,
                            null,
                            true
                          )}
                        </span>
                      </div>
                    )}
                    {existingPrediction.brierScore !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Brier Score:
                        </span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.brierScore,
                            null,
                            false,
                            4
                          )}
                        </span>
                      </div>
                    )}
                    {existingPrediction.ppVariance !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Probability Variance:
                        </span>
                        <span className="font-semibold">
                          {formatErrorMetric(
                            existingPrediction.ppVariance,
                            null,
                            false,
                            4
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Metrics - Only show if investments were made */}
                {(existingPrediction.equityInvestment !== null ||
                  existingPrediction.debtFinancing !== null) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Financial Performance
                    </h4>
                    <div className="grid gap-3 text-sm">
                      {existingPrediction.totalInvestment !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Investment:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(existingPrediction.totalInvestment)}
                          </span>
                        </div>
                      )}
                      {existingPrediction.roiScore !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            ROI Score:
                          </span>
                          <span
                            className={
                              existingPrediction.roiScore >= 0
                                ? "font-semibold text-green-600 dark:text-green-400"
                                : "font-semibold text-red-600 dark:text-red-400"
                            }
                          >
                            {formatErrorMetric(
                              existingPrediction.roiScore,
                              forecast.dataType
                            )}
                          </span>
                        </div>
                      )}
                      {existingPrediction.roe !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Return on Equity:
                          </span>
                          <span
                            className={
                              existingPrediction.roe >= 0
                                ? "font-semibold text-green-600 dark:text-green-400"
                                : "font-semibold text-red-600 dark:text-red-400"
                            }
                          >
                            {formatCurrency(existingPrediction.roe, {
                              showSign: existingPrediction.roe > 0,
                            })}
                          </span>
                        </div>
                      )}
                      {existingPrediction.roePct !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ROE %:</span>
                          <span
                            className={
                              existingPrediction.roePct >= 0
                                ? "font-semibold text-green-600 dark:text-green-400"
                                : "font-semibold text-red-600 dark:text-red-400"
                            }
                          >
                            {formatPercentage(existingPrediction.roePct, {
                              showSign: existingPrediction.roePct > 0,
                            })}
                          </span>
                        </div>
                      )}
                      {existingPrediction.financingGrossProfit !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Financing Gross Profit:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              existingPrediction.financingGrossProfit
                            )}
                          </span>
                        </div>
                      )}
                      {existingPrediction.debtRepayment !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Debt Repayment:
                          </span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(existingPrediction.debtRepayment)}
                          </span>
                        </div>
                      )}
                      {existingPrediction.rof !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Net Return on Financing:
                          </span>
                          <span
                            className={
                              existingPrediction.rof >= 0
                                ? "font-semibold text-green-600 dark:text-green-400"
                                : "font-semibold text-red-600 dark:text-red-400"
                            }
                          >
                            {formatCurrency(existingPrediction.rof, {
                              showSign: existingPrediction.rof > 0,
                            })}
                          </span>
                        </div>
                      )}
                      {existingPrediction.rofPct !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ROF %:</span>
                          <span
                            className={
                              existingPrediction.rofPct >= 0
                                ? "font-semibold text-green-600 dark:text-green-400"
                                : "font-semibold text-red-600 dark:text-red-400"
                            }
                          >
                            {formatPercentage(existingPrediction.rofPct, {
                              showSign: existingPrediction.rofPct > 0,
                            })}
                          </span>
                        </div>
                      )}
                      {existingPrediction.netProfitEquityPlusDebt !== null && (
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Total Net Profit:</span>
                          <span
                            className={
                              existingPrediction.netProfitEquityPlusDebt >= 0
                                ? "font-bold text-lg text-green-600 dark:text-green-400"
                                : "font-bold text-lg text-red-600 dark:text-red-400"
                            }
                          >
                            {formatCurrency(
                              existingPrediction.netProfitEquityPlusDebt,
                              {
                                showSign:
                                  existingPrediction.netProfitEquityPlusDebt >
                                  0,
                              }
                            )}
                          </span>
                        </div>
                      )}
                      {existingPrediction.roiEquityPlusDebtPct !== null && (
                        <div className="flex justify-between">
                          <span className="font-medium">Total ROI %:</span>
                          <span
                            className={
                              existingPrediction.roiEquityPlusDebtPct >= 0
                                ? "font-bold text-lg text-green-600 dark:text-green-400"
                                : "font-bold text-lg text-red-600 dark:text-red-400"
                            }
                          >
                            {formatPercentage(
                              existingPrediction.roiEquityPlusDebtPct,
                              {
                                showSign:
                                  existingPrediction.roiEquityPlusDebtPct > 0,
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Efficiency Metrics */}
                {existingPrediction.profitPerHour !== null && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Efficiency
                    </h4>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Profit per Hour:
                        </span>
                        <span
                          className={
                            existingPrediction.profitPerHour >= 0
                              ? "font-semibold text-green-600 dark:text-green-400"
                              : "font-semibold text-red-600 dark:text-red-400"
                          }
                        >
                          {formatCurrency(existingPrediction.profitPerHour, {
                            showSign: existingPrediction.profitPerHour > 0,
                          })}
                          /hr
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Forecast closed message */}
      {isExpired && !existingPrediction && (
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="rounded-lg border border-muted bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                This forecast has closed. Predictions can no longer be
                submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
