import { ForecastType, Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import type {
  CreateForecastInput,
  SetActualValueInput,
  UpdateForecastInput,
} from "@/schemas/forecasts";
import { PredictionMetricsService } from "./prediction-metrics";

/**
 * Get a forecast by ID
 */
export async function getForecastById(id: string) {
  return await prisma.forecast.findUnique({
    where: { id },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });
}

/**
 * Get all forecasts for an organization with pagination, search, and filtering
 */
export async function getForecasts({
  organizationId,
  userId,
  page = 1,
  limit = 50,
  search,
  type,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  organizationId: string;
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
  type?: ForecastType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ForecastWhereInput = {
    organizationId,
    ...(userId && { userId }),
    ...(type && { type }),
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  // Build order by clause
  const orderBy: Prisma.ForecastOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const [forecasts, total] = await Promise.all([
    prisma.forecast.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        dataType: true,
        predictionType: true,
        dueDate: true,
        dataReleaseDate: true,
        actualValue: true,
        organizationId: true,
        categoryId: true,
        options: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    }),
    prisma.forecast.count({ where }),
  ]);

  return {
    forecasts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Create a new forecast
 */
export async function createForecast(data: CreateForecastInput) {
  const forecast = await prisma.forecast.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      dataType: data.dataType,
      predictionType: data.predictionType,
      dueDate: new Date(data.dueDate),
      dataReleaseDate: data.dataReleaseDate
        ? new Date(data.dataReleaseDate)
        : null,
      actualValue: data.actualValue,
      organizationId: data.organizationId,
      categoryId: data.categoryId,
      options: data.options || undefined,
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  // If actualValue is provided, recalculate metrics for all predictions
  if (data.actualValue) {
    await PredictionMetricsService.recalculateMetricsForForecast(forecast.id);
  }

  return forecast;
}

/**
 * Update a forecast
 */
export async function updateForecast(data: UpdateForecastInput) {
  // Get the current forecast to check if actualValue changed
  const currentForecast = await prisma.forecast.findUnique({
    where: { id: data.id },
    select: { actualValue: true },
  });

  const forecast = await prisma.forecast.update({
    where: { id: data.id },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      dataType: data.dataType,
      predictionType: data.predictionType,
      dueDate: new Date(data.dueDate),
      dataReleaseDate: data.dataReleaseDate
        ? new Date(data.dataReleaseDate)
        : null,
      actualValue: data.actualValue,
      categoryId: data.categoryId,
      options: data.options || undefined,
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  // If actualValue changed, recalculate metrics for all predictions
  if (currentForecast?.actualValue !== data.actualValue) {
    await PredictionMetricsService.recalculateMetricsForForecast(data.id);
  }

  return forecast;
}

/**
 * Set the actual value for a forecast
 * If the actual value is set before the due date or data release date,
 * both dates are automatically updated to the current time
 */
export async function setActualValue(data: SetActualValueInput) {
  const now = new Date();

  // Get the current forecast
  const currentForecast = await prisma.forecast.findUnique({
    where: { id: data.id },
    select: { dueDate: true, dataReleaseDate: true },
  });

  if (!currentForecast) {
    throw new Error("Forecast not found");
  }

  // Check if we need to update dates
  const needsDateUpdate =
    now < currentForecast.dueDate ||
    (currentForecast.dataReleaseDate && now < currentForecast.dataReleaseDate);

  const forecast = await prisma.forecast.update({
    where: { id: data.id },
    data: {
      actualValue: data.actualValue,
      // Update dates if actual value is set before due date or data release date
      ...(needsDateUpdate && {
        dueDate: now,
        dataReleaseDate: now,
      }),
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  // Recalculate metrics for all predictions
  await PredictionMetricsService.recalculateMetricsForForecast(data.id);

  return forecast;
}

/**
 * Delete a forecast
 */
export async function deleteForecast(id: string) {
  return await prisma.forecast.delete({
    where: { id },
  });
}

/**
 * Get upcoming forecasts for a user's organization
 * Returns forecasts with dueDate in the future, ordered by dueDate ascending
 */
export async function getUpcomingForecastsForUser({
  organizationId,
  userId,
  page = 1,
  limit = 50,
}: {
  organizationId: string;
  userId: string;
  page?: number;
  limit?: number;
}) {
  const now = new Date();
  const skip = (page - 1) * limit;

  const [forecasts, total] = await Promise.all([
    prisma.forecast.findMany({
      where: {
        organizationId,
        dueDate: { gte: now },
      },
      orderBy: { dueDate: "asc" },
      skip,
      take: limit,
      include: {
        organization: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
        predictions: {
          where: { userId }, // only this user's prediction
          select: { id: true, userId: true, value: true },
        },
      },
    }),
    prisma.forecast.count({
      where: {
        organizationId,
        dueDate: { gte: now },
      },
    }),
  ]);

  return {
    forecasts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get past forecasts for a user's organization
 * Returns forecasts with dueDate in the past, ordered by dueDate descending
 */
export async function getPastForecastsForUser({
  organizationId,
  userId,
  page = 1,
  limit = 10,
}: {
  organizationId: string;
  userId: string;
  page?: number;
  limit?: number;
}) {
  const now = new Date();
  const skip = (page - 1) * limit;

  const [forecasts, total] = await Promise.all([
    prisma.forecast.findMany({
      where: {
        organizationId,
        dueDate: { lt: now },
      },
      orderBy: { dueDate: "desc" },
      skip,
      take: limit,
      include: {
        organization: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
        predictions: {
          where: { userId }, // only this user's prediction
          select: { id: true, userId: true, value: true },
        },
      },
    }),
    prisma.forecast.count({
      where: {
        organizationId,
        dueDate: { lt: now },
      },
    }),
  ]);

  return {
    forecasts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get forecasts for a user with flexible filtering
 * Supports filtering by status (pending/submitted/completed/all), category, and type
 */
export async function getUserForecasts({
  organizationId,
  userId,
  status,
  categoryId,
  type,
  page = 1,
  limit = 10,
  sortBy = "dueDate",
  sortOrder = "asc",
}: {
  organizationId: string;
  userId: string;
  status?: "pending" | "submitted" | "completed" | "all";
  categoryId?: string;
  type?: ForecastType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const now = new Date();
  const skip = (page - 1) * limit;

  // Build where clause based on status
  const where: Prisma.ForecastWhereInput = {
    organizationId,
    ...(categoryId && { categoryId }),
    ...(type && { type }),
  };

  // Apply status-based filters
  switch (status) {
    case "pending":
      // Upcoming forecasts without user's prediction
      where.dueDate = { gte: now };
      where.predictions = {
        none: { userId },
      };
      break;
    case "submitted":
      // Upcoming forecasts with user's prediction submitted
      where.dueDate = { gte: now };
      where.predictions = {
        some: { userId },
      };
      break;
    case "completed":
      // Past forecasts (due date passed)
      where.dueDate = { lt: now };
      break;
    case "all":
    default:
      // No additional date filter
      break;
  }

  // Build order by clause
  const VALID_SORT_FIELDS = [
    "dueDate",
    "dataReleaseDate",
    "title",
    "createdAt",
  ] as const;

  function isValidSortBy(s: string): s is (typeof VALID_SORT_FIELDS)[number] {
    return (VALID_SORT_FIELDS as readonly string[]).includes(s);
  }

  const safeSortBy = isValidSortBy(sortBy) ? sortBy : "dueDate";
  const orderBy: Prisma.ForecastOrderByWithRelationInput = {
    [safeSortBy]: sortOrder,
  };

  const [forecasts, total] = await Promise.all([
    prisma.forecast.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        organization: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
        predictions: {
          where: { userId }, // only this user's prediction
          select: { id: true, userId: true, value: true },
        },
      },
    }),
    prisma.forecast.count({ where }),
  ]);

  return {
    forecasts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Check if a forecast title exists within an organization (case-insensitive)
 * @param title - Forecast title to check
 * @param organizationId - Organization ID
 * @param excludeId - Optional forecast ID to exclude (for updates)
 */
export async function forecastTitleExists(
  title: string,
  organizationId: string,
  excludeId?: string
) {
  const forecast = await prisma.forecast.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      organizationId,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!forecast;
}

/**
 * Validate forecast creation business rules
 */
export async function validateForecastCreation(
  data: CreateForecastInput
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  const errors: Record<string, string[]> = {};

  // Check if title already exists in organization
  const titleExists = await forecastTitleExists(
    data.title,
    data.organizationId
  );
  if (titleExists) {
    errors.title = [
      "A forecast with this title already exists in this organization",
    ];
  }

  // Validate due date is in the future
  const dueDate = new Date(data.dueDate);
  if (dueDate <= new Date()) {
    errors.dueDate = ["Due date must be in the future"];
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate forecast update business rules
 */
export async function validateForecastUpdate(
  data: UpdateForecastInput
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  const errors: Record<string, string[]> = {};

  // Get current forecast
  const currentForecast = await getForecastById(data.id);
  if (!currentForecast) {
    errors._form = ["Forecast not found"];
    return { valid: false, errors };
  }

  // Check if title already exists (excluding current forecast)
  const titleExists = await forecastTitleExists(
    data.title,
    currentForecast.organizationId,
    data.id
  );
  if (titleExists) {
    errors.title = [
      "A forecast with this title already exists in this organization",
    ];
  }

  // Validate due date is in the future
  const dueDate = new Date(data.dueDate);
  if (dueDate <= new Date()) {
    errors.dueDate = ["Due date must be in the future"];
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

// Helper function to add days to a date
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get the count of closed forecasts for a user in an organization.
 * "Closed" here means dueDate has passed.
 */
export async function getClosedForecastCountForUser(params: {
  organizationId: string;
  userId: string;
}) {
  const { organizationId, userId } = params;
  const now = new Date();

  const count = await prisma.forecast.count({
    where: {
      organizationId,
      dueDate: {
        lt: now,
      },
      predictions: {
        some: { userId },
      },
    },
  });

  return count;
}

/**
 * Get the count of forecasts due soon for an organization.
 * Optionally filter to forecasts the user has participated in.
 *
 * "Due soon" = dueDate between now and now + `days` (default 7).
 */
export async function getForecastsDueSoonCount(params: {
  organizationId: string;
  days?: number;
  userId?: string;
}) {
  const { organizationId, days = 7, userId } = params;
  const now = new Date();
  const soon = addDays(now, days);

  const where: Prisma.ForecastWhereInput = {
    organizationId,
    dueDate: {
      gte: now,
      lte: soon,
    },
  };

  if (userId) {
    where.predictions = {
      some: { userId },
    };
  }

  const count = await prisma.forecast.count({ where });
  return count;
}

/**
 * Get forecast count statistics for super admin dashboard
 *
 * @returns Object with total, active, and completed forecast counts
 *
 * @example
 * ```typescript
 * // In super admin dashboard
 * const stats = await getForecastCounts();
 * // Returns: { total: 100, active: 30, completed: 70 }
 * ```
 */
export async function getForecastCounts() {
  const now = new Date();

  const [total, active, completed] = await Promise.all([
    prisma.forecast.count(),
    prisma.forecast.count({
      where: { dueDate: { gt: now } },
    }),
    prisma.forecast.count({
      where: { dueDate: { lte: now } },
    }),
  ]);

  return {
    total,
    active,
    completed,
  };
}

/**
 * Get the count of forecasts due within the rest of the day.
 * Optionally filter to forecasts the user has participated in.
 */
export async function getForecastsDueTodayCount(params: {
  organizationId: string;
  userId?: string;
}) {
  const { organizationId, userId } = params;
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const where: Prisma.ForecastWhereInput = {
    organizationId,
    dueDate: {
      gte: now,
      lte: endOfDay,
    },
  };

  if (userId) {
    where.predictions = {
      some: { userId },
    };
  }

  const count = await prisma.forecast.count({ where });
  return count;
}
