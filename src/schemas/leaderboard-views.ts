import { z } from "zod";

// View type enum matching Prisma schema
export const leaderboardViewTypeSchema = z.enum([
  "USER",
  "PREDICTION",
  "CATEGORY",
  "GROUP",
]);

// Schema for leaderboard filters
export const leaderboardFiltersSchema = z.object({
  forecastIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  forecastTypes: z.array(z.string()).optional(),
  recentCount: z.string().optional(),
  minForecasts: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Schema for column visibility (key-value pairs of columnId: boolean)
export const columnVisibilitySchema = z.record(z.string(), z.boolean());

// Schema for creating a new leaderboard view
export const createLeaderboardViewSchema = z.object({
  name: z
    .string()
    .min(1, "View name is required")
    .max(50, "View name must be 50 characters or less")
    .trim(),
  viewType: leaderboardViewTypeSchema.default("USER"),
  filters: leaderboardFiltersSchema,
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  columnVisibility: columnVisibilitySchema,
});

// Schema for updating a leaderboard view
export const updateLeaderboardViewSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "View name is required")
    .max(50, "View name must be 50 characters or less")
    .trim(),
});

// Schema for deleting a leaderboard view
export const deleteLeaderboardViewSchema = z.object({
  id: z.string(),
});

// Type exports
export type LeaderboardViewType = z.infer<typeof leaderboardViewTypeSchema>;
export type LeaderboardFilters = z.infer<typeof leaderboardFiltersSchema>;
export type CreateLeaderboardViewInput = z.infer<
  typeof createLeaderboardViewSchema
>;
export type UpdateLeaderboardViewInput = z.infer<
  typeof updateLeaderboardViewSchema
>;
export type DeleteLeaderboardViewInput = z.infer<
  typeof deleteLeaderboardViewSchema
>;
