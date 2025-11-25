"use client";

import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "./ui/separator";
import ViewsManager from "./views-manager";

type ViewType = "USER" | "PREDICTION" | "CATEGORY";

type LeaderboardColumnControlsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  isOrgAdmin?: boolean;
  viewType: ViewType;
  currentFilters: Record<string, unknown>;
  onApplyView: (view: {
    filters: Record<string, unknown>;
    sortBy: string | null;
    sortOrder: string | null;
    columnVisibility: Record<string, boolean>;
  }) => void;
  filtersButton?: React.ReactNode;
};

export default function LeaderboardColumnControls({
  table,
  isOrgAdmin = false,
  viewType,
  currentFilters,
  onApplyView,
  filtersButton,
}: LeaderboardColumnControlsProps) {
  // Get filterable columns
  const columns = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.getCanHide())
      .filter((column) => isOrgAdmin || column.id !== "userEmail")
      .filter((column) => column.id !== "rank" && column.id !== "userName");
  }, [table, isOrgAdmin]);

  // Convert columns to options format
  const columnOptions = useMemo(() => {
    return columns.map((column) => ({
      value: column.id,
      label: column.id
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  }, [columns]);

  // Track visible column IDs in state
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    return columns.filter((col) => col.getIsVisible()).map((col) => col.id);
  });

  // Get column visibility state for dependency tracking
  const columnVisibility = table.getState().columnVisibility;

  // Sync state with table column visibility changes (e.g., from views)
  useEffect(() => {
    const currentVisible = columns
      .filter((col) => col.getIsVisible())
      .map((col) => col.id);
    setVisibleColumnIds(currentVisible);
  }, [columns, columnVisibility]);

  // Handle column visibility changes
  const handleColumnVisibilityChange = (selectedColumnIds: string[]) => {
    columns.forEach((column) => {
      column.toggleVisibility(selectedColumnIds.includes(column.id));
    });
    setVisibleColumnIds(selectedColumnIds);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium">Display Options</h3>
        <p className="text-xs text-muted-foreground">
          Manage column visibility and save custom views
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <ViewsManager
          currentFilters={currentFilters}
          currentSorting={[]}
          currentColumnVisibility={table
            .getAllColumns()
            .filter((col) => col.getCanHide())
            .reduce((acc, col) => {
              acc[col.id] = col.getIsVisible();
              return acc;
            }, {} as Record<string, boolean>)}
          onApplyView={onApplyView}
          viewType={viewType}
        />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-8"
        />
        {filtersButton}
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <MultiSelectCombobox
            options={columnOptions}
            selectedValues={visibleColumnIds}
            onValuesChange={handleColumnVisibilityChange}
            placeholder="Select columns"
            searchPlaceholder="Search columns..."
            emptyMessage="No columns found."
            showSelectAll={true}
            selectAllLabel="Show All"
            clearAllLabel="Hide All"
            className="w-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
