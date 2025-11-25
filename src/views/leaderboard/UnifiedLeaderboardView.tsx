"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import LeaderboardColumnControls from "@/components/leaderboard-column-controls";
import LeaderboardFilters from "@/components/leaderboard-filters";
import LeaderboardSidebar from "@/components/leaderboard-sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDecimal,
  formatInteger,
  formatPercent,
} from "@/lib/format-leaderboard";
import type {
  CategoryLeaderboardEntry,
  GroupLeaderboardEntry,
  LeaderboardEntry,
  PredictionLeaderboardEntry,
} from "@/services/leaderboard";

type ViewType = "USER" | "PREDICTION" | "CATEGORY" | "GROUP";

type Forecast = {
  id: string;
  title: string;
};

type Category = {
  id: string;
  name: string;
};

type UnifiedLeaderboardViewProps = {
  viewType: ViewType;
  organizationName: string;
} & (
  | {
      viewType: "USER";
      data: LeaderboardEntry[];
      isOrgAdmin?: boolean;
      currentUserId?: string;
      forecasts: Forecast[];
      categories: Category[];
    }
  | {
      viewType: "PREDICTION";
      data: PredictionLeaderboardEntry[];
      forecasts: Forecast[];
      categories: Category[];
    }
  | {
      viewType: "CATEGORY";
      data: CategoryLeaderboardEntry[];
      forecasts: Forecast[];
      categories: Category[];
    }
  | {
      viewType: "GROUP";
      data: GroupLeaderboardEntry[];
    }
);

export default function UnifiedLeaderboardView(
  props: UnifiedLeaderboardViewProps
) {
  const { viewType, organizationName } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>(() => {
    // Set initial sorting based on view type
    switch (viewType) {
      case "GROUP":
        return [{ id: "accuracyRate", desc: true }];
      default:
        return [];
    }
  });

  // Define column visibility based on view type
  const getInitialColumnVisibility = (): VisibilityState => {
    switch (viewType) {
      case "USER":
        return {
          // Default visible columns
          userName: true,
          userEmail: props.isOrgAdmin || false,

          // Counts & accuracy - NEW FIELDS VISIBLE
          totalCompletedPredictions: false,
          completedBinaryPredictions: false,
          completedContinuousPredictions: false,
          correctPredictions: false,
          incorrectPredictions: false,
          accuracyRate: true,
          incorrectRate: true,
          avgProbabilityBinary: true,
          highPercentContinuous: true,
          lowPercentContinuous: true,
          perfectPercentContinuous: true,

          // Capital & profit - NEW FIELDS VISIBLE
          totalEquityInvestment: true,
          totalDebtFinancing: true,
          totalInvestment: true,
          totalNetProfit: true,
          fundBalance: true,
          profitFromEquity: true,
          profitFromFinancing: true,

          // Overall ROI - NEW FIELDS VISIBLE
          roiReal: true,
          roiAverage: true,
          roiMedian: true,

          // Equity returns - NEW FIELDS VISIBLE
          roeReal: true,
          roeAverage: true,
          roeMedian: true,

          // Financing returns - NEW FIELDS VISIBLE
          interestPaymentOnDebt: true,
          rofReal: true,
          rofAverage: true,
          rofMedian: true,

          // Error metrics - NEW FIELDS VISIBLE
          avgActualError: true,
          medianActualError: true,
          avgForecastError: true,
          medianForecastError: true,

          // Time & productivity - NEW FIELDS VISIBLE
          totalForecastTimeMinutes: true,
          avgTimePerForecastMinutes: true,
          weightedAvgHourlyProfit: true,
          simpleAvgHourlyProfit: true,

          // Legacy fields - HIDDEN
          totalPredictions: false,
          highCountContinuous: false,
          lowCountContinuous: false,
          perfectCountContinuous: false,
          avgRoiEquityPlusDebtPct: false,
          totalRoe: false,
          avgRoePct: false,
          totalRof: false,
          avgRofPct: false,
          avgAbsoluteError: false,
          avgAbsoluteActualErrorPct: false,
          avgAbsoluteForecastErrorPct: false,
          avgProfitPerHour: false,
          avgBrierScore: false,
          avgRoiScore: false,
        };

      case "PREDICTION":
        return {
          forecastTitle: true,
          forecastType: true,
          categoryName: true,
          totalParticipants: true,
          participantsCompleted: true,
          correctPredictions: false,
          incorrectPredictions: false,
          accuracyRate: true,
          avgProbability: false,
          highCount: false,
          lowCount: false,
          perfectCount: false,
          avgActualError: true,
          avgForecastError: false,
          totalInvestment: true,
          totalNetProfit: true,
          avgRoi: true,
          totalEquityInvestment: false,
          totalDebtFinancing: false,
          avgTimePerPrediction: true,
          totalTimeSpent: false,
        };

      case "CATEGORY":
        return {
          categoryName: true,
          categoryDescription: false,
          totalForecasts: true,
          completedForecasts: true,
          totalParticipants: true,
          totalPredictions: true,
          avgPredictionsPerForecast: true,
          correctPredictions: false,
          accuracyRate: true,
          totalInvestment: true,
          totalNetProfit: true,
          avgRoi: true,
          totalTimeSpent: false,
          avgTimePerPrediction: true,
        };

      case "GROUP":
        return {
          memberCount: true,
          totalCompletedPredictions: true,
          accuracyRate: true,
          roiReal: true,
          totalNetProfit: true,
          totalInvestment: false,
          totalEquityInvestment: false,
          totalDebtFinancing: false,
          avgTimePerForecastMinutes: false,
          avgActualError: false,
        };

      default:
        return {};
    }
  };

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    getInitialColumnVisibility()
  );

  // Define columns based on view type
  const columns = useMemo<
    ColumnDef<
      | LeaderboardEntry
      | PredictionLeaderboardEntry
      | CategoryLeaderboardEntry
      | GroupLeaderboardEntry
    >[]
  >(() => {
    const baseColumns: ColumnDef<
      | LeaderboardEntry
      | PredictionLeaderboardEntry
      | CategoryLeaderboardEntry
      | GroupLeaderboardEntry
    >[] = [
      {
        id: "rank",
        header: () => <div className="text-center font-medium">Rank</div>,
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.index + 1}</div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ];

    switch (viewType) {
      case "USER":
        return [
          ...baseColumns,
          {
            accessorKey: "userName",
            header: ({ column }) => (
              <button
                className="flex"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Name
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="font-medium">
                {row.getValue("userName") || "Anonymous"}
              </div>
            ),
          },
          {
            accessorKey: "userEmail",
            header: ({ column }) => (
              <button
                className="flex"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Email
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => <div>{row.getValue("userEmail")}</div>,
          },
          {
            accessorKey: "totalPredictions",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Predictions
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("totalPredictions"))}
              </div>
            ),
          },
          {
            accessorKey: "correctPredictions",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Correct
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("correctPredictions"))}
              </div>
            ),
          },
          {
            accessorKey: "accuracyRate",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Accuracy Rate
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatPercent(row.getValue("accuracyRate"))}
              </div>
            ),
          },
          {
            accessorKey: "avgBrierScore",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Avg Brier Score
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatDecimal(row.getValue("avgBrierScore"))}
              </div>
            ),
          },
          {
            accessorKey: "avgAbsoluteError",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Avg Absolute Error
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatDecimal(row.getValue("avgAbsoluteError"))}
              </div>
            ),
          },
          {
            accessorKey: "totalNetProfit",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Net Profit
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatCurrency(row.getValue("totalNetProfit"))}
              </div>
            ),
          },
          {
            accessorKey: "totalInvestment",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Investment
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatCurrency(row.getValue("totalInvestment"))}
              </div>
            ),
          },
          {
            accessorKey: "totalEquityInvestment",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Equity Investment
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatCurrency(row.getValue("totalEquityInvestment"))}
              </div>
            ),
          },
          {
            accessorKey: "totalDebtFinancing",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Debt Financing
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatCurrency(row.getValue("totalDebtFinancing"))}
              </div>
            ),
          },
          {
            accessorKey: "roiReal",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                ROI (Real) %
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatPercent(row.getValue("roiReal"))}
              </div>
            ),
          },
          // Add additional key columns - this is a subset for brevity
          {
            accessorKey: "fundBalance",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Fund Balance
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatCurrency(row.getValue("fundBalance"))}
              </div>
            ),
          },
        ];

      case "PREDICTION":
        return [
          ...baseColumns,
          {
            accessorKey: "forecastTitle",
            header: ({ column }) => (
              <button
                className="flex"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Forecast
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="font-medium max-w-xs truncate">
                {row.getValue("forecastTitle")}
              </div>
            ),
          },
          {
            accessorKey: "forecastType",
            header: "Type",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("forecastType")}</div>
            ),
          },
          {
            accessorKey: "categoryName",
            header: "Category",
            cell: ({ row }) => <div>{row.getValue("categoryName") || "—"}</div>,
          },
          {
            accessorKey: "totalParticipants",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Participants
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("totalParticipants"))}
              </div>
            ),
          },
          {
            accessorKey: "participantsCompleted",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Completed
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("participantsCompleted"))}
              </div>
            ),
          },
          {
            accessorKey: "accuracyRate",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Accuracy Rate
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatPercent(row.getValue("accuracyRate"))}
              </div>
            ),
          },
          {
            accessorKey: "totalNetProfit",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Net Profit
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatCurrency(row.getValue("totalNetProfit"))}
              </div>
            ),
          },
          // Add more PREDICTION columns as needed...
        ];

      case "CATEGORY":
        return [
          ...baseColumns,
          {
            accessorKey: "categoryName",
            header: ({ column }) => (
              <button
                className="flex"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Category
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="font-medium">{row.getValue("categoryName")}</div>
            ),
          },
          {
            accessorKey: "totalForecasts",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Forecasts
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("totalForecasts"))}
              </div>
            ),
          },
          {
            accessorKey: "totalPredictions",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Predictions
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("totalPredictions"))}
              </div>
            ),
          },
          {
            accessorKey: "accuracyRate",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Accuracy Rate
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatPercent(row.getValue("accuracyRate"))}
              </div>
            ),
          },
          {
            accessorKey: "totalNetProfit",
            header: ({ column }) => (
              <button
                className="flex justify-end w-full"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Total Net Profit
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right font-medium">
                {formatCurrency(row.getValue("totalNetProfit"))}
              </div>
            ),
          },
          // Add more CATEGORY columns as needed...
        ];

      case "GROUP":
        return [
          ...baseColumns,
          {
            accessorKey: "groupName",
            header: ({ column }) => (
              <button
                className="flex items-center font-medium"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Group
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div>
                <div className="font-semibold">{row.getValue("groupName")}</div>
              </div>
            ),
          },
          {
            accessorKey: "memberCount",
            header: ({ column }) => (
              <button
                className="flex w-full justify-end"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Members
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("memberCount"))}
              </div>
            ),
          },
          {
            accessorKey: "totalCompletedPredictions",
            header: ({ column }) => (
              <button
                className="flex w-full justify-end"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Predictions
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatInteger(row.getValue("totalCompletedPredictions"))}
              </div>
            ),
          },
          {
            accessorKey: "accuracyRate",
            header: ({ column }) => (
              <button
                className="flex w-full justify-end"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Accuracy
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatPercent(row.getValue("accuracyRate"))}
              </div>
            ),
          },
          {
            accessorKey: "roiReal",
            header: ({ column }) => (
              <button
                className="flex w-full justify-end"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                ROI (Real)
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatPercent(row.getValue("roiReal"))}
              </div>
            ),
          },
          {
            accessorKey: "totalNetProfit",
            header: ({ column }) => (
              <button
                className="flex w-full justify-end"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Net Profit
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </button>
            ),
            cell: ({ row }) => (
              <div className="text-right">
                {formatCurrency(row.getValue("totalNetProfit"))}
              </div>
            ),
          },
        ];

      default:
        return baseColumns;
    }
  }, [viewType]);

  const table = useReactTable({
    data: props.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  // Sync sorting with URL
  useEffect(() => {
    if (sorting.length > 0) {
      const params = new URLSearchParams(searchParams);
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      router.push(`?${params.toString()}`);
    }
  }, [sorting, router, searchParams]);

  // Get title and description based on view type
  const getTitle = () => {
    switch (viewType) {
      case "USER":
        return "Leaderboard";
      case "PREDICTION":
        return "Leaderboard by Prediction";
      case "CATEGORY":
        return "Leaderboard by Category";
      case "GROUP":
        return "Group Leaderboard";
      default:
        return "Leaderboard";
    }
  };

  const getDescription = () => {
    switch (viewType) {
      case "USER":
        return `Aggregated prediction performance for ${organizationName}`;
      case "PREDICTION":
        return `Aggregated performance metrics by forecast for ${organizationName}`;
      case "CATEGORY":
        return `Aggregated performance metrics by category for ${organizationName}`;
      case "GROUP":
        return `Organization: ${organizationName}`;
      default:
        return `Performance metrics for ${organizationName}`;
    }
  };

  const getInfoMessage = () => {
    switch (viewType) {
      case "USER":
        return "The leaderboard only includes predictions for forecasts that have actual values set. Metrics are calculated based on prediction accuracy, investment returns, and other performance indicators.";
      case "PREDICTION":
        return "The leaderboard shows forecasts that have actual values set, aggregating metrics across all user predictions for each forecast.";
      case "CATEGORY":
        return "The leaderboard shows categories with their aggregated metrics across all forecasts and predictions within each category.";
      case "GROUP":
        return null; // No info message for groups
      default:
        return null;
    }
  };

  // Determine if we should show filters (not for GROUP view)
  const shouldShowFilters = viewType !== "GROUP";

  // Get current filters for saving (needed for column controls)
  const getCurrentFilters = () => {
    const params = new URLSearchParams(searchParams);
    const selectedForecastIds =
      params.get("forecastIds")?.split(",").filter(Boolean) || [];
    const selectedCategoryIds =
      params.get("categoryIds")?.split(",").filter(Boolean) || [];
    const selectedForecastTypes =
      params.get("forecastTypes")?.split(",").filter(Boolean) || [];
    const recentCount = params.get("recentCount") || "all";
    const minForecasts = params.get("minForecasts") || "all";
    const dateFromStr = params.get("dateFrom");
    const dateToStr = params.get("dateTo");

    return {
      ...(selectedForecastIds.length > 0 && {
        forecastIds: selectedForecastIds,
      }),
      ...(selectedCategoryIds.length > 0 && {
        categoryIds: selectedCategoryIds,
      }),
      ...(selectedForecastTypes.length > 0 && {
        forecastTypes: selectedForecastTypes,
      }),
      ...(recentCount !== "all" && { recentCount }),
      ...(minForecasts !== "all" && { minForecasts }),
      ...(dateFromStr && { dateFrom: dateFromStr }),
      ...(dateToStr && { dateTo: dateToStr }),
    };
  };

  // Handle applying a saved view (needed for column controls)
  const handleApplyView = (view: {
    filters: Record<string, unknown>;
    sortBy: string | null;
    sortOrder: string | null;
    columnVisibility: Record<string, boolean>;
  }) => {
    const filters = view.filters as {
      forecastIds?: string[];
      categoryIds?: string[];
      forecastTypes?: string[];
      recentCount?: string;
      minForecasts?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    // Build URL params from saved filters
    const params = new URLSearchParams();

    if (filters.forecastIds?.length) {
      params.set("forecastIds", filters.forecastIds.join(","));
    }
    if (filters.categoryIds?.length) {
      params.set("categoryIds", filters.categoryIds.join(","));
    }
    if (filters.forecastTypes?.length) {
      params.set("forecastTypes", filters.forecastTypes.join(","));
    }
    if (filters.recentCount && filters.recentCount !== "all") {
      params.set("recentCount", filters.recentCount);
    }
    if (filters.minForecasts && filters.minForecasts !== "all") {
      params.set("minForecasts", filters.minForecasts);
    }
    if (filters.dateFrom) {
      params.set("dateFrom", filters.dateFrom);
    }
    if (filters.dateTo) {
      params.set("dateTo", filters.dateTo);
    }

    // Apply column visibility
    table.getAllColumns().forEach((column) => {
      if (column.id in view.columnVisibility) {
        column.toggleVisibility(view.columnVisibility[column.id]);
      }
    });

    // Navigate with new filters
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{getTitle()}</h1>
        <p className="text-muted-foreground">{getDescription()}</p>
      </div>

      {/* Column Controls - Only show for views that have filters */}
      {shouldShowFilters && (
        <LeaderboardColumnControls
          table={table}
          isOrgAdmin={"isOrgAdmin" in props ? props.isOrgAdmin : false}
          viewType={viewType}
          currentFilters={getCurrentFilters()}
          onApplyView={handleApplyView}
          filtersButton={
            <LeaderboardSidebar viewType={viewType}>
              <LeaderboardFilters
                forecasts={"forecasts" in props ? props.forecasts : []}
                categories={"categories" in props ? props.categories : []}
                participantCount={props.data.length}
              />
            </LeaderboardSidebar>
          }
        />
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isCurrentUser =
                    viewType === "USER" &&
                    "currentUserId" in props &&
                    props.currentUserId &&
                    "userId" in row.original &&
                    row.original.userId === props.currentUserId;
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={
                        isCurrentUser ? "bg-muted/50 font-medium" : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {viewType === "GROUP"
                      ? "No group predictions yet."
                      : "No results found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Info Message */}
      {getInfoMessage() && (
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> {getInfoMessage()}
          </p>
        </div>
      )}
    </div>
  );
}
