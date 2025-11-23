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

    // 🔐 Equity constraints
    equityInvestment: z
      .coerce
      .number()
      .int("Equity investment must be a whole-dollar amount (no decimals).")
      .min(0, "Equity investment must be at least 0")
      .max(20_000_000, "Equity investment cannot exceed 20,000,000")
      .optional(),

    // 🔐 Debt constraints
    debtFinancing: z
      .coerce
      .number()
      .int("Debt financing must be a whole-dollar amount (no decimals).")
      .min(0, "Debt financing must be at least 0")
      .max(20_000_000, "Debt financing cannot exceed 20,000,000")
      .optional(),
  })
  // 💰 Combined cap: equity + debt ≤ 20M
  .refine(
    (data) => {
      const equity = data.equityInvestment ?? 0;
      const debt = data.debtFinancing ?? 0;
      return equity + debt <= 20_000_000;
    },
    {
      message:
        "Total of equity investment + debt financing cannot exceed 20,000,000.",
      path: ["equityInvestment"],
    }
  )
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

    equityInvestment: z
      .coerce
      .number()
      .int("Equity investment must be a whole-dollar amount (no decimals).")
      .min(0, "Equity investment must be at least 0")
      .max(20_000_000, "Equity investment cannot exceed 20,000,000")
      .optional(),

    debtFinancing: z
      .coerce
      .number()
      .int("Debt financing must be a whole-dollar amount (no decimals).")
      .min(0, "Debt financing must be at least 0")
      .max(20_000_000, "Debt financing cannot exceed 20,000,000")
      .optional(),
  })
  .refine(
    (data) => {
      const equity = data.equityInvestment ?? 0;
      const debt = data.debtFinancing ?? 0;
      return equity + debt <= 20_000_000;
    },
    {
      message:
        "Total of equity investment + debt financing cannot exceed 20,000,000.",
      path: ["equityInvestment"],
    }
  )
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
