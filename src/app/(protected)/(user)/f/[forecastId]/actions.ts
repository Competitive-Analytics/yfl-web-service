"use server";

import { auth } from "@/auth";
import Router from "@/constants/router";
import { ForecastType } from "@/generated/prisma";
import {
  ActionState,
  createErrorState,
  extractFormData,
  formDataToString,
  validateFormData,
} from "@/lib/server-action-utils";
import {
  createPredictionSchema,
  updatePredictionSchema,
  type CreatePredictionInput,
  type UpdatePredictionInput,
} from "@/schemas/predictions";
import {
  createPrediction,
  updatePrediction,
  validatePredictionCreation,
  validatePredictionUpdate,
} from "@/services/predictions";
import { revalidatePath } from "next/cache";

type PredictionFormData = {
  value: string;
  confidence: string;
  reasoning: string | null;
  method: string | null;
  estimatedTime: string;
  equityInvestment: string;
  debtFinancing: string;
};

export async function createPredictionAction(
  forecastId: string,
  forecastType: ForecastType,
  prevState: ActionState<PredictionFormData> | undefined,
  formData: FormData
): Promise<ActionState<PredictionFormData>> {
  // 1. Verify authentication
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorState({
      _form: ["You must be logged in to submit a prediction"],
    });
  }

  // 2. Extract form data
  const rawData = extractFormData(formData, [
    "value",
    "confidence",
    "reasoning",
    "method",
    "estimatedTime",
    "equityInvestment",
    "debtFinancing",
  ]);

  // 3. Validate schema
  const validation = validateFormData(createPredictionSchema, {
    forecastId,
    forecastType,
    value: formDataToString(rawData.value),
    confidence: rawData.confidence
      ? formDataToString(rawData.confidence)
      : undefined,
    reasoning: rawData.reasoning
      ? formDataToString(rawData.reasoning)
      : undefined,
    method: rawData.method ? formDataToString(rawData.method) : undefined,
    estimatedTime: rawData.estimatedTime
      ? formDataToString(rawData.estimatedTime)
      : undefined,
    equityInvestment: rawData.equityInvestment
      ? formDataToString(rawData.equityInvestment)
      : undefined,
    debtFinancing: rawData.debtFinancing
      ? formDataToString(rawData.debtFinancing)
      : undefined,
  });

  if (!validation.success) {
    return createErrorState(validation.errors, {
      value: formDataToString(rawData.value),
      confidence: formDataToString(rawData.confidence) || "",
      reasoning: formDataToString(rawData.reasoning) || null,
      method: formDataToString(rawData.method) || null,
      estimatedTime: formDataToString(rawData.estimatedTime) || "",
      equityInvestment: formDataToString(rawData.equityInvestment) || "",
      debtFinancing: formDataToString(rawData.debtFinancing) || "",
    });
  }

  // ✅ Tell TS what this is
  const parsed = validation.data as CreatePredictionInput;

  // 4. Validate business rules
  const businessValidation = await validatePredictionCreation({
    ...parsed,
    userId: session.user.id,
  });

  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, {
      value: parsed.value,
      confidence: parsed.confidence?.toString() || "",
      reasoning: parsed.reasoning || null,
      method: parsed.method || null,
      estimatedTime: parsed.estimatedTime?.toString() || "",
      equityInvestment: parsed.equityInvestment?.toString() || "",
      debtFinancing: parsed.debtFinancing?.toString() || "",
    });
  }

  // 5. Create prediction
  await createPrediction({
    ...parsed,
    userId: session.user.id,
  });

  // 6. Revalidate cache
  revalidatePath(Router.USER_FORECAST_DETAIL(forecastId));

  return { success: true };
}

export async function updatePredictionAction(
  predictionId: string,
  forecastId: string,
  forecastType: ForecastType,
  prevState: ActionState<PredictionFormData> | undefined,
  formData: FormData
): Promise<ActionState<PredictionFormData>> {
  // 1. Verify authentication
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorState({
      _form: ["You must be logged in to update a prediction"],
    });
  }

  // 2. Extract form data
  const rawData = extractFormData(formData, [
    "value",
    "confidence",
    "reasoning",
    "method",
    "estimatedTime",
    "equityInvestment",
    "debtFinancing",
  ]);

  // 3. Validate schema
  const validation = validateFormData(updatePredictionSchema, {
    id: predictionId,
    forecastType,
    value: formDataToString(rawData.value),
    confidence: rawData.confidence
      ? formDataToString(rawData.confidence)
      : undefined,
    reasoning: rawData.reasoning
      ? formDataToString(rawData.reasoning)
      : undefined,
    method: rawData.method ? formDataToString(rawData.method) : undefined,
    estimatedTime: rawData.estimatedTime
      ? formDataToString(rawData.estimatedTime)
      : undefined,
    equityInvestment: rawData.equityInvestment
      ? formDataToString(rawData.equityInvestment)
      : undefined,
    debtFinancing: rawData.debtFinancing
      ? formDataToString(rawData.debtFinancing)
      : undefined,
  });

  if (!validation.success) {
    return createErrorState(validation.errors, {
      value: formDataToString(rawData.value),
      confidence: formDataToString(rawData.confidence) || "",
      reasoning: formDataToString(rawData.reasoning) || null,
      method: formDataToString(rawData.method) || null,
      estimatedTime: formDataToString(rawData.estimatedTime) || "",
      equityInvestment: formDataToString(rawData.equityInvestment) || "",
      debtFinancing: formDataToString(rawData.debtFinancing) || "",
    });
  }

  // ✅ Tell TS what this is
  const parsed = validation.data as UpdatePredictionInput;

  // 4. Validate business rules
  const businessValidation = await validatePredictionUpdate(parsed);

  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, {
      value: parsed.value,
      confidence: parsed.confidence?.toString() || "",
      reasoning: parsed.reasoning || null,
      method: parsed.method || null,
      estimatedTime: parsed.estimatedTime?.toString() || "",
      equityInvestment: parsed.equityInvestment?.toString() || "",
      debtFinancing: parsed.debtFinancing?.toString() || "",
    });
  }

  // 5. Update prediction
  await updatePrediction(parsed);

  // 6. Revalidate cache
  revalidatePath(Router.USER_FORECAST_DETAIL(forecastId));

  return { success: true };
}
