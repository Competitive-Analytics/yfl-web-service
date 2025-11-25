"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, FilterX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

type Forecast = {
  id: string;
  title: string;
};

type Category = {
  id: string;
  name: string;
};

type LeaderboardFiltersProps = {
  forecasts: Forecast[];
  categories: Category[];
  participantCount: number;
};

const FORECAST_TYPES = [
  { value: "BINARY", label: "Binary" },
  { value: "CONTINUOUS", label: "Continuous" },
  { value: "CATEGORICAL", label: "Categorical" },
];

const RECENT_OPTIONS = [
  { value: "5", label: "Past 5" },
  { value: "10", label: "Past 10" },
  { value: "20", label: "Past 20" },
  { value: "all", label: "All" },
];

const MIN_FORECASTS_OPTIONS = [
  { value: "1", label: "1+" },
  { value: "25", label: "25+" },
  { value: "32", label: "32+" },
  { value: "64", label: "64+" },
  { value: "150", label: "150+" },
  { value: "all", label: "All" },
];

export default function LeaderboardFilters({
  forecasts,
  categories,
  participantCount,
}: LeaderboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const selectedForecastIds =
    searchParams.get("forecastIds")?.split(",").filter(Boolean) || [];
  const selectedCategoryIds =
    searchParams.get("categoryIds")?.split(",").filter(Boolean) || [];
  const selectedForecastTypes =
    searchParams.get("forecastTypes")?.split(",").filter(Boolean) || [];
  const recentCount = searchParams.get("recentCount") || "all";
  const minForecasts = searchParams.get("minForecasts") || "all";
  const dateFromStr = searchParams.get("dateFrom");
  const dateToStr = searchParams.get("dateTo");

  // Local state for date range picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dateFromStr ? new Date(dateFromStr) : undefined,
    to: dateToStr ? new Date(dateToStr) : undefined,
  });

  // Update URL with new filter values
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    router.push(`?`);
  };

  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // Only update URL filters if both from and to are selected
    if (range?.from && range?.to) {
      updateFilters({
        dateFrom: range.from.toISOString().split("T")[0],
        dateTo: range.to.toISOString().split("T")[0],
      });
    } else {
      // Clear date filters if range is incomplete
      updateFilters({
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  };

  // Format date range display
  const formatDateRange = () => {
    if (!dateRange?.from) return "Pick a date range";
    if (dateRange.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    }
    return dateRange.from.toLocaleDateString();
  };

  const hasActiveFilters =
    selectedForecastIds.length > 0 ||
    selectedCategoryIds.length > 0 ||
    selectedForecastTypes.length > 0 ||
    recentCount !== "all" ||
    minForecasts !== "all" ||
    dateRange?.from ||
    dateRange?.to;

  return (
    <div className="space-y-4">
      {/* Header Row */}

      {/* Filters and Column Selector Grid */}
      {/* Forecast Multi-Select */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Filter by Forecast
        </label>
        <MultiSelectCombobox
          options={forecasts.map((f) => ({ value: f.id, label: f.title }))}
          selectedValues={selectedForecastIds}
          onValuesChange={(values) =>
            updateFilters({
              forecastIds: values.length > 0 ? values.join(",") : undefined,
            })
          }
          placeholder="All forecasts"
          searchPlaceholder="Search forecasts..."
          emptyMessage="No forecasts found."
          showSelectAll={true}
        />
      </div>

      {/* Category Multi-Select */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Filter by Category
        </label>
        <MultiSelectCombobox
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          selectedValues={selectedCategoryIds}
          onValuesChange={(values) =>
            updateFilters({
              categoryIds: values.length > 0 ? values.join(",") : undefined,
            })
          }
          placeholder="All categories"
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found."
          showSelectAll={true}
        />
      </div>

      {/* Prediction Type Multi-Select */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Prediction Type
        </label>
        <MultiSelectCombobox
          options={FORECAST_TYPES}
          selectedValues={selectedForecastTypes}
          onValuesChange={(values) =>
            updateFilters({
              forecastTypes: values.length > 0 ? values.join(",") : undefined,
            })
          }
          placeholder="All types"
          searchPlaceholder="Search prediction types..."
          emptyMessage="No types found."
          showSelectAll={true}
        />
      </div>

      {/* Recent Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Recent</label>
        <Combobox
          options={RECENT_OPTIONS}
          value={recentCount}
          onValueChange={(value) => updateFilters({ recentCount: value })}
          placeholder="Select recent option"
          searchPlaceholder="Search recent options..."
          allowClear={true}
          clearLabel="All"
        />
      </div>

      {/* Minimum Forecasts Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Minimum Forecasts
        </label>
        <Combobox
          options={MIN_FORECASTS_OPTIONS}
          value={minForecasts}
          onValueChange={(value) => updateFilters({ minForecasts: value })}
          placeholder="Select minimum forecasts"
          searchPlaceholder="Search minimum forecast options..."
          allowClear={true}
          clearLabel="All"
        />
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Date Range</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {(dateRange?.from || dateRange?.to) && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateRangeChange(undefined)}
              className="flex-shrink-0"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex mt-4 items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {participantCount} participant(s)
        </p>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <FilterX className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
