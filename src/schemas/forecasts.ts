import { DataType, ForecastType, PredictionType } from "@/generated/prisma";
import { z } from "zod";

/**
 * Schema for creating a forecast
 */
export const createForecastSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable(),
    type: z.nativeEnum(ForecastType, {
      message: "Invalid forecast type",
    }),
    dataType: z
      .nativeEnum(DataType, {
        message: "Invalid data type",
      })
      .optional()
      .nullable(),
    predictionType: z
      .nativeEnum(PredictionType, {
        message: "Invalid prediction type",
      })
      .default(PredictionType.INDIVIDUAL),
    dueDate: z.string().min(1, "Due date is required"),
    dataReleaseDate: z.string().min(1, "Release date is required"),
    actualValue: z.string().optional().nullable(),
    organizationId: z.string().cuid("Invalid organization ID"),
    categoryId: z.string().min(1, "Category is required"),
    // For categorical forecasts only
    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "Categorical forecasts require at least 2 options")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // If type is CATEGORICAL, options must be provided
      if (data.type === ForecastType.CATEGORICAL) {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    {
      message: "Categorical forecasts require at least 2 options",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      // If type is not CATEGORICAL, options should not be provided
      if (data.type !== ForecastType.CATEGORICAL) {
        return !data.options || data.options.length === 0;
      }
      return true;
    },
    {
      message: "Options are only allowed for categorical forecasts",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      // If type is CONTINUOUS, dataType must be provided
      if (data.type === ForecastType.CONTINUOUS) {
        return !!data.dataType;
      }
      return true;
    },
    {
      message: "Data type is required for continuous forecasts",
      path: ["dataType"],
    }
  )
  .refine(
    (data) => {
      // If type is not CONTINUOUS, dataType should not be provided
      if (data.type !== ForecastType.CONTINUOUS) {
        return !data.dataType;
      }
      return true;
    },
    {
      message: "Data type is only allowed for continuous forecasts",
      path: ["dataType"],
    }
  )
  .refine(
    (data) => {
      // If dataReleaseDate is provided, it should be after dueDate
      if (data.dataReleaseDate && data.dueDate) {
        const dueDate = new Date(data.dueDate);
        const releaseDate = new Date(data.dataReleaseDate);
        return releaseDate >= dueDate;
      }
      return true;
    },
    {
      message: "Data release date must be on or after the due date",
      path: ["dataReleaseDate"],
    }
  );

/**
 * Schema for updating a forecast
 */
export const updateForecastSchema = z
  .object({
    id: z.string().cuid("Invalid forecast ID"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable(),
    type: z.nativeEnum(ForecastType, {
      message: "Invalid forecast type",
    }),
    dataType: z
      .nativeEnum(DataType, {
        message: "Invalid data type",
      })
      .optional()
      .nullable(),
    predictionType: z
      .nativeEnum(PredictionType, {
        message: "Invalid prediction type",
      })
      .default(PredictionType.INDIVIDUAL),
    dueDate: z.string().min(1, "Due date is required"),
    dataReleaseDate: z.string().min(1, "Release date is required"),
    actualValue: z.string().optional().nullable(),
    categoryId: z.string().min(1, "Category is required"),
    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "Categorical forecasts require at least 2 options")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.type === ForecastType.CATEGORICAL) {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    {
      message: "Categorical forecasts require at least 2 options",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      if (data.type !== ForecastType.CATEGORICAL) {
        return !data.options || data.options.length === 0;
      }
      return true;
    },
    {
      message: "Options are only allowed for categorical forecasts",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      // If type is CONTINUOUS, dataType must be provided
      if (data.type === ForecastType.CONTINUOUS) {
        return !!data.dataType;
      }
      return true;
    },
    {
      message: "Data type is required for continuous forecasts",
      path: ["dataType"],
    }
  )
  .refine(
    (data) => {
      // If type is not CONTINUOUS, dataType should not be provided
      if (data.type !== ForecastType.CONTINUOUS) {
        return !data.dataType;
      }
      return true;
    },
    {
      message: "Data type is only allowed for continuous forecasts",
      path: ["dataType"],
    }
  )
  .refine(
    (data) => {
      // If dataReleaseDate is provided, it should be after dueDate
      if (data.dataReleaseDate && data.dueDate) {
        const dueDate = new Date(data.dueDate);
        const releaseDate = new Date(data.dataReleaseDate);
        return releaseDate >= dueDate;
      }
      return true;
    },
    {
      message: "Data release date must be on or after the due date",
      path: ["dataReleaseDate"],
    }
  );

/**
 * Schema for forecast list filtering
 */
export const forecastFilterSchema = z.object({
  type: z.nativeEnum(ForecastType).optional(),
  search: z.string().optional(),
});

/**
 * Schema for setting actual value
 */
export const setActualValueSchema = z
  .object({
    id: z.string().cuid("Invalid forecast ID"),
    actualValue: z.string().min(1, "Actual value is required"),
    type: z.nativeEnum(ForecastType, {
      message: "Invalid forecast type",
    }),
  })
  .refine(
    (data) => {
      // For BINARY forecasts, actualValue must be "true" or "false"
      if (data.type === ForecastType.BINARY) {
        return data.actualValue === "true" || data.actualValue === "false";
      }
      return true;
    },
    {
      message: "Binary forecast actual value must be 'true' or 'false'",
      path: ["actualValue"],
    }
  )
  .refine(
    (data) => {
      // For CONTINUOUS forecasts, actualValue must be a valid number
      if (data.type === ForecastType.CONTINUOUS) {
        const num = parseFloat(data.actualValue);
        return !isNaN(num) && isFinite(num);
      }
      return true;
    },
    {
      message: "Continuous forecast actual value must be a valid number",
      path: ["actualValue"],
    }
  );

export type CreateForecastInput = z.infer<typeof createForecastSchema>;
export type UpdateForecastInput = z.infer<typeof updateForecastSchema>;
export type ForecastFilterInput = z.infer<typeof forecastFilterSchema>;
export type SetActualValueInput = z.infer<typeof setActualValueSchema>;
