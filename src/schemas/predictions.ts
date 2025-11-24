import { ForecastType } from "@/generated/prisma";
import { z } from "zod";

/**
 * Schema for creating a prediction
 */
export const createPredictionSchema = z
  .object({
    forecastId: z.string().min(1, "Forecast ID is required"),
    forecastType: z.nativeEnum(ForecastType),
    value: z.string().min(1, "Prediction value is required"),
    confidence: z.coerce
      .number()
      .int()
      .min(0, "Confidence must be at least 0")
      .max(100, "Confidence must be at most 100")
      .optional(),
    reasoning: z
      .string()
      .max(1000, "Reasoning must be 1000 characters or less")
      .optional(),
    method: z
      .string()
      .max(500, "Method must be 500 characters or less")
      .optional(),
    estimatedTime: z.coerce
      .number()
      .int()
      .min(0, "Estimated time must be at least 0")
      .optional(),
    groupId: z
      .string()
      .min(1, "Group ID is required")
      .optional()
      .nullable(),

    // 🔐 Equity constraints: non-negative, integer, max 20M, optional
    equityInvestment: z
      .coerce
      .number()
      .int("Equity investment must be a whole-dollar amount (no decimals).")
      .min(0, "Equity investment must be at least 0")
      .max(20_000_000, "Equity investment cannot exceed 20,000,000")
      .optional(),

    debtFinancing: z.coerce
      .number()
      .min(0, "Debt financing must be at least 0")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.forecastType === ForecastType.BINARY) {
        return data.value === "true" || data.value === "false";
      }
      return true;
    },
    {
      message: "Binary prediction must be 'true' or 'false'",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.forecastType === ForecastType.CONTINUOUS) {
        const num = parseFloat(data.value);
        return !isNaN(num) && isFinite(num);
      }
      return true;
    },
    {
      message: "Continuous prediction must be a valid number",
      path: ["value"],
    }
  );

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;

/**
 * Schema for updating a prediction
 */
export const updatePredictionSchema = z
  .object({
    id: z.string().min(1, "Prediction ID is required"),
    forecastType: z.nativeEnum(ForecastType),
    value: z.string().min(1, "Prediction value is required"),
    confidence: z.coerce
      .number()
      .int()
      .min(0, "Confidence must be at least 0")
      .max(100, "Confidence must be at most 100")
      .optional(),
    reasoning: z
      .string()
      .max(1000, "Reasoning must be 1000 characters or less")
      .optional(),
    method: z
      .string()
      .max(500, "Method must be 500 characters or less")
      .optional(),
    estimatedTime: z.coerce
      .number()
      .int()
      .min(0, "Estimated time must be at least 0")
      .optional(),
    groupId: z
      .string()
      .min(1, "Group ID is required")
      .optional()
      .nullable(),

    // 🔐 Same equity rules for updates
    equityInvestment: z
      .coerce
      .number()
      .int("Equity investment must be a whole-dollar amount (no decimals).")
      .min(0, "Equity investment must be at least 0")
      .max(20_000_000, "Equity investment cannot exceed 20,000,000")
      .optional(),

    debtFinancing: z.coerce
      .number()
      .min(0, "Debt financing must be at least 0")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.forecastType === ForecastType.BINARY) {
        return data.value === "true" || data.value === "false";
      }
      return true;
    },
    {
      message: "Binary prediction must be 'true' or 'false'",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.forecastType === ForecastType.CONTINUOUS) {
        const num = parseFloat(data.value);
        return !isNaN(num) && isFinite(num);
      }
      return true;
    },
    {
      message: "Continuous prediction must be a valid number",
      path: ["value"],
    }
  );

export type UpdatePredictionInput = z.infer<typeof updatePredictionSchema>;
