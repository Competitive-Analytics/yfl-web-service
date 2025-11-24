import prisma from "@/lib/prisma";
import type {
  CreatePredictionInput,
  UpdatePredictionInput,
} from "@/schemas/predictions";

/**
 * Get a prediction by ID
 */
export async function getPredictionById(id: string) {
  return await prisma.prediction.findUnique({
    where: { id },
    include: {
      forecast: {
        select: { id: true, title: true, type: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Get a user's prediction for a specific forecast
 */
export async function getUserPredictionForForecast(
  userId: string,
  forecastId: string
) {
  return await prisma.prediction.findUnique({
    where: {
      forecastId_userId: {
        forecastId,
        userId,
      },
    },
    include: {
      forecast: {
        select: { id: true, title: true, type: true, dueDate: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Get a group's prediction for a specific forecast
 */
export async function getGroupPredictionForForecast(
  groupId: string,
  forecastId: string
) {
  return await prisma.prediction.findUnique({
    where: {
      forecastId_groupId: {
        forecastId,
        groupId,
      },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Get all predictions for a forecast
 */
export async function getPredictionsForForecast(forecastId: string) {
  return await prisma.prediction.findMany({
    where: { forecastId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get all predictions by a user
 */
export async function getUserPredictions(userId: string) {
  return await prisma.prediction.findMany({
    where: { userId },
    include: {
      forecast: {
        select: {
          id: true,
          title: true,
          type: true,
          dueDate: true,
          organization: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get leaderboard data for a forecast
 * Returns all predictions for a forecast with user information
 */
export async function getForecastLeaderboard(forecastId: string) {
  const predictions = await prisma.prediction.findMany({
    where: { forecastId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        confidence: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return predictions;
}

/**
 * Create a new prediction
 */
export async function createPrediction(
  data: CreatePredictionInput & { userId: string }
) {
  return await prisma.prediction.create({
    data: {
      forecastId: data.forecastId,
      userId: data.userId,
      groupId: data.groupId || null,
      value: data.value,
      confidence: data.confidence,
      reasoning: data.reasoning,
      method: data.method,
      estimatedTime: data.estimatedTime,
      equityInvestment: data.equityInvestment,
      debtFinancing: data.debtFinancing,
    },
    include: {
      forecast: {
        select: { id: true, title: true, type: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Update an existing prediction
 */
export async function updatePrediction(data: UpdatePredictionInput) {
  return await prisma.prediction.update({
    where: { id: data.id },
    data: {
      value: data.value,
      confidence: data.confidence,
      reasoning: data.reasoning,
      method: data.method,
      estimatedTime: data.estimatedTime,
      equityInvestment: data.equityInvestment,
      debtFinancing: data.debtFinancing,
    },
    include: {
      forecast: {
        select: { id: true, title: true, type: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Delete a prediction
 */
export async function deletePrediction(id: string) {
  return await prisma.prediction.delete({
    where: { id },
  });
}

/**
 * Get user's prediction metrics for charts (dashboard use)
 *
 * @param userId - User ID
 * @param organizationId - Organization ID to filter forecasts
 * @param limit - Maximum number of metrics to return (default 50)
 * @returns Array of prediction metrics with id and error percentage
 *
 * @example
 * ```typescript
 * // In a dashboard page
 * const metrics = await getUserPredictionMetrics(userId, orgId);
 * // Returns: [{ id: "...", absoluteActualErrorPct: 5.2 }, ...]
 * ```
 */
export async function getUserPredictionMetrics(
  userId: string,
  organizationId: string,
  limit = 50
) {
  return await prisma.prediction.findMany({
    where: {
      userId,
      forecast: { organizationId },
      absoluteActualErrorPct: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      absoluteActualErrorPct: true,
    },
    take: limit,
  });
}

/**
 * Validate prediction creation business rules
 */
export async function validatePredictionCreation(
  data: CreatePredictionInput & { userId: string }
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  const errors: Record<string, string[]> = {};
  const addFormError = (message: string) => {
    errors._form = [...(errors._form ?? []), message];
  };

  const [existingPrediction, userMembership] = await Promise.all([
    getUserPredictionForForecast(data.userId, data.forecastId),
    prisma.groupMember.findUnique({
      where: { userId: data.userId },
      select: { groupId: true },
    }),
  ]);

  if (existingPrediction) {
    addFormError(
      "You have already submitted an individual prediction for this forecast. Please update your existing prediction instead."
    );
  }

  // Get the forecast to validate due date
  const forecast = await prisma.forecast.findUnique({
    where: { id: data.forecastId },
  });

  if (!forecast) {
    addFormError("Forecast not found");
    return { valid: false, errors };
  }

  // Check if forecast is still open (due date hasn't passed)
  if (new Date(forecast.dueDate) <= new Date()) {
    addFormError(
      "This forecast has already closed. Predictions can no longer be submitted."
    );
  }

  if (data.groupId) {
    const group = await prisma.group.findUnique({
      where: { id: data.groupId },
      select: { id: true, organizationId: true },
    });

    if (!group) {
      addFormError("Selected group was not found.");
    } else if (group.organizationId !== forecast.organizationId) {
      addFormError(
        "This group does not belong to the forecast's organization."
      );
    }

    if (!userMembership || userMembership.groupId !== data.groupId) {
      addFormError(
        "You must belong to this group in order to submit a group prediction."
      );
    }

    if (group) {
      const existingGroupPrediction = await getGroupPredictionForForecast(
        group.id,
        data.forecastId
      );

      if (existingGroupPrediction) {
        addFormError(
          "This group has already submitted a prediction for this forecast."
        );
      }
    }
  } else if (userMembership?.groupId) {
    const existingGroupPrediction = await getGroupPredictionForForecast(
      userMembership.groupId,
      data.forecastId
    );

    if (existingGroupPrediction) {
      addFormError(
        "Your group has already submitted a prediction for this forecast. You cannot submit an individual prediction."
      );
    }
  }

  // For categorical forecasts, validate the value is one of the options
  if (
    data.forecastType === "CATEGORICAL" &&
    forecast.options &&
    Array.isArray(forecast.options)
  ) {
    const options = forecast.options as string[];
    if (!options.includes(data.value)) {
      errors.value = ["Selected option is not valid for this forecast"];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate prediction update business rules
 */
export async function validatePredictionUpdate(
  data: UpdatePredictionInput
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  const errors: Record<string, string[]> = {};

  // Get the prediction
  const prediction = await getPredictionById(data.id);
  if (!prediction) {
    errors._form = ["Prediction not found"];
    return { valid: false, errors };
  }

  // Get the forecast to validate due date
  const forecast = await prisma.forecast.findUnique({
    where: { id: prediction.forecastId },
  });

  if (!forecast) {
    errors._form = ["Forecast not found"];
    return { valid: false, errors };
  }

  // Check if forecast is still open
  if (new Date(forecast.dueDate) <= new Date()) {
    errors._form = [
      "This forecast has already closed. Predictions can no longer be updated.",
    ];
  }

  // For categorical forecasts, validate the value is one of the options
  if (
    data.forecastType === "CATEGORICAL" &&
    forecast.options &&
    Array.isArray(forecast.options)
  ) {
    const options = forecast.options as string[];
    if (!options.includes(data.value)) {
      errors.value = ["Selected option is not valid for this forecast"];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
