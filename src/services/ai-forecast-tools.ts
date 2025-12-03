import { DataType, ForecastType } from "@/generated/prisma";
import { z } from "zod";
import { completeConversation } from "./ai-conversations";
import { createCategory, getCategoryByNameForOrg } from "./categories";
import { createForecast, validateForecastCreation } from "./forecasts";

// ─────────────────────────────────────────────────────────────────────────────
// Tool Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for finding or creating a category
 */
export const findOrCreateCategorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Category name (e.g., 'Equities', 'Movies', 'Crypto')"),
});

/**
 * Schema for validating a forecast draft
 */
export const validateForecastDraftSchema = z.object({
  title: z.string().min(1).max(200).describe("Forecast title"),
  description: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .describe("Optional description"),
  type: z.nativeEnum(ForecastType).describe("BINARY or CONTINUOUS only"),
  dataType: z
    .nativeEnum(DataType)
    .optional()
    .nullable()
    .describe("For CONTINUOUS: CURRENCY, PERCENT, INTEGER, NUMBER, or DECIMAL"),
  dueDate: z
    .string()
    .describe("ISO date string when predictions are due (must be future)"),
  dataReleaseDate: z
    .string()
    .describe(
      "ISO date string when actual data will be known (must be >= dueDate)"
    ),
  categoryName: z
    .string()
    .min(1)
    .describe("Category name (will be looked up or created)"),
  options: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("For CATEGORICAL only (not supported)"),
});

/**
 * Schema for creating a forecast (after validation and confirmation)
 */
export const createForecastToolSchema = validateForecastDraftSchema;

// ─────────────────────────────────────────────────────────────────────────────
// Tool Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find or create a category for an organization
 *
 * @param organizationId - Organization ID
 * @param name - Category name
 * @returns Category ID, name, and whether it was newly created
 */
export async function findOrCreateCategoryTool(
  organizationId: string,
  name: string
): Promise<{ id: string; name: string; wasCreated: boolean }> {
  // Try to find existing category (case-insensitive)
  const existing = await getCategoryByNameForOrg(name, organizationId);

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      wasCreated: false,
    };
  }

  // Create new category
  const newCategory = await createCategory({
    name,
    description: null,
    color: null, // Will use default gray in UI
    organizationId,
  });

  return {
    id: newCategory.id,
    name: newCategory.name,
    wasCreated: true,
  };
}

/**
 * Validate a forecast draft without creating it
 *
 * @param organizationId - Organization ID
 * @param draftData - Forecast draft data
 * @returns Validation result with errors if any
 */
export async function validateForecastDraftTool(
  organizationId: string,
  draftData: z.infer<typeof validateForecastDraftSchema>
): Promise<
  | { valid: true; categoryId: string }
  | { valid: false; errors: Record<string, string[]> }
> {
  const errors: Record<string, string[]> = {};

  // Check if type is CATEGORICAL (not supported)
  if (draftData.type === ForecastType.CATEGORICAL) {
    errors.type = [
      "CATEGORICAL forecasts are not supported by the AI agent. Please create a BINARY or CONTINUOUS forecast.",
    ];
    return { valid: false, errors };
  }

  // Check if CONTINUOUS has dataType
  if (draftData.type === ForecastType.CONTINUOUS && !draftData.dataType) {
    errors.dataType = [
      "CONTINUOUS forecasts require a dataType (CURRENCY, PERCENT, INTEGER, NUMBER, or DECIMAL)",
    ];
    return { valid: false, errors };
  }

  // Check if BINARY doesn't have dataType
  if (draftData.type === ForecastType.BINARY && draftData.dataType) {
    errors.dataType = ["BINARY forecasts should not have a dataType"];
    return { valid: false, errors };
  }

  // Find or create category
  let categoryId: string;
  try {
    const categoryResult = await findOrCreateCategoryTool(
      organizationId,
      draftData.categoryName
    );
    categoryId = categoryResult.id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    errors.category = ["Failed to find or create category"];
    return { valid: false, errors };
  }

  // Validate dates
  const dueDate = new Date(draftData.dueDate);
  const dataReleaseDate = new Date(draftData.dataReleaseDate);
  const now = new Date();

  if (dueDate <= now) {
    errors.dueDate = ["Due date must be in the future"];
  }

  if (dataReleaseDate < dueDate) {
    errors.dataReleaseDate = [
      "Data release date must be on or after the due date",
    ];
  }

  // Use existing validation for business rules
  const forecastInput = {
    title: draftData.title,
    description: draftData.description,
    type: draftData.type,
    dataType: draftData.dataType,
    dueDate: draftData.dueDate,
    dataReleaseDate: draftData.dataReleaseDate,
    actualValue: null,
    organizationId,
    categoryId,
    options: draftData.options,
  };

  const businessValidation = await validateForecastCreation(forecastInput);

  if (!businessValidation.valid) {
    Object.assign(errors, businessValidation.errors);
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, categoryId };
}

/**
 * Create a forecast after user confirmation
 *
 * @param organizationId - Organization ID
 * @param conversationId - Conversation ID to link
 * @param data - Validated forecast data
 * @returns Created forecast or error
 */
export async function createForecastTool(
  organizationId: string,
  conversationId: string,
  data: z.infer<typeof createForecastToolSchema>
): Promise<
  | { success: true; forecastId: string; title: string }
  | { success: false; error: string; errors?: Record<string, string[]> }
> {
  try {
    // Validate first
    const validation = await validateForecastDraftTool(organizationId, data);

    if (!validation.valid) {
      return {
        success: false,
        error: "Validation failed. Please correct the errors and try again.",
        errors: validation.errors,
      };
    }

    // Create forecast
    const forecast = await createForecast({
      title: data.title,
      description: data.description,
      type: data.type,
      dataType: data.dataType,
      dueDate: data.dueDate,
      dataReleaseDate: data.dataReleaseDate,
      actualValue: null,
      organizationId,
      categoryId: validation.categoryId,
      options: data.options,
    });

    // Mark conversation as completed and link forecast
    await completeConversation(conversationId, forecast.id);

    return {
      success: true,
      forecastId: forecast.id,
      title: forecast.title,
    };
  } catch (error) {
    console.error("Error creating forecast:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the forecast",
    };
  }
}
