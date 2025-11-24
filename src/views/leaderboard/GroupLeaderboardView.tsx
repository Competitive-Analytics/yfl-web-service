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
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupLeaderboardEntry } from "@/services/leaderboard";

type GroupLeaderboardViewProps = {
  data: GroupLeaderboardEntry[];
  organizationName: string;
};

const formatPercent = (value: number | null) => {
  if (value === null) return "—";
  return `${(value * 100).toFixed(2)}%`;
};

const formatCurrency = (value: number | null) => {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDecimal = (value: number | null, decimals = 2) => {
  if (value === null) return "—";
  return value.toFixed(decimals);
};

const formatInteger = (value: number | null) => {
  if (value === null) return "—";
  return value.toString();
};

export default function GroupLeaderboardView({
  data,
  organizationName,
}: GroupLeaderboardViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "accuracyRate", desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
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
  });

  const columns: ColumnDef<GroupLeaderboardEntry>[] = [
    {
      id: "rank",
      header: () => <div className="text-center font-medium">Rank</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">{row.index + 1}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "groupName",
      header: ({ column }) => (
        <button
          className="flex items-center font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    {
      accessorKey: "totalInvestment",
      header: "Investment",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.getValue("totalInvestment"))}
        </div>
      ),
    },
    {
      accessorKey: "avgActualError",
      header: "Avg Actual Error",
      cell: ({ row }) => (
        <div className="text-right">
          {formatPercent(row.getValue("avgActualError"))}
        </div>
      ),
    },
    {
      accessorKey: "avgTimePerForecastMinutes",
      header: "Avg Minutes",
      cell: ({ row }) => (
        <div className="text-right">
          {formatDecimal(row.getValue("avgTimePerForecastMinutes"), 1)}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Group Leaderboard</h2>
        <p className="text-sm text-muted-foreground">
          Organization: {organizationName}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No group predictions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

