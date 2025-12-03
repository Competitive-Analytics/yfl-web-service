"use server";

import Router from "@/constants/router";
import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/guards";
import {
  ActionState,
  createErrorState,
  extractFormData,
  formDataToString,
  validateFormData,
} from "@/lib/server-action-utils";
import { createForecastSchema } from "@/schemas/forecasts";
import { createForecast, validateForecastCreation } from "@/services/forecasts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ForecastFormData = {
  title: string;
  description: string | null;
  type: string;
  dataType: string | null;
  predictionType: string;
  dueDate: string;
  dataReleaseDate: string | null;
  categoryId: string | null;
  options: string[];
};

export async function createForecastAction(
  orgId: string,
  prevState: ActionState<ForecastFormData> | undefined,
  formData: FormData
): Promise<ActionState<ForecastFormData>> {
  // 1. Verify permissions (super admin or org admin)
  await requireRole([Role.SUPER_ADMIN, Role.ORG_ADMIN]);

  // 2. Extract form data
  const rawData = extractFormData(formData, [
    "title",
    "description",
    "type",
    "dataType",
    "predictionType",
    "dueDate",
    "dataReleaseDate",
    "categoryId",
    "categoryName",
    "categoryColor",
  ]);

  // Handle options array for categorical forecasts
  const optionsData = formData.getAll("options");
  const options =
    optionsData.length > 0
      ? optionsData.map((opt) => opt.toString()).filter((opt) => opt.trim())
      : undefined;

  // Handle categoryId - convert 'none' to null
  const categoryIdValue = formDataToString(rawData.categoryId);
  const categoryId =
    categoryIdValue === "none" || !categoryIdValue ? null : categoryIdValue;

  const dataToValidate = {
    ...rawData,
    organizationId: orgId,
    categoryId,
    options,
  };

  // 3. Validate schema
  const validation = validateFormData(createForecastSchema, dataToValidate);
  if (!validation.success) {
    return createErrorState(validation.errors, {
      title: formDataToString(rawData.title),
      description: formDataToString(rawData.description) || null,
      type: formDataToString(rawData.type),
      dataType: formDataToString(rawData.dataType) || null,
      predictionType: formDataToString(rawData.predictionType),
      dueDate: formDataToString(rawData.dueDate),
      dataReleaseDate: formDataToString(rawData.dataReleaseDate) || null,
      categoryId,
      options: options || [],
    });
  }

  // 4. Validate business rules
  const businessValidation = await validateForecastCreation(validation.data);
  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, {
      title: validation.data.title,
      description: validation.data.description || null,
      type: validation.data.type,
      dataType: validation.data.dataType || null,
      predictionType: validation.data.predictionType,
      dueDate: validation.data.dueDate,
      dataReleaseDate: validation.data.dataReleaseDate || null,
      categoryId: validation.data.categoryId || null,
      options: validation.data.options || [],
    });
  }

  // 5. Handle inline category creation if temp ID is detected
  let finalCategoryId = validation.data.categoryId;
  if (finalCategoryId && finalCategoryId.startsWith("temp-")) {
    const categoryName = formDataToString(rawData.categoryName);
    const categoryColor = formDataToString(rawData.categoryColor);

    if (!categoryName) {
      return createErrorState(
        {
          _form: ["Category name is required for new categories"],
        },
        {
          title: validation.data.title,
          description: validation.data.description || null,
          type: validation.data.type,
          dataType: validation.data.dataType || null,
          predictionType: validation.data.predictionType,
          dueDate: validation.data.dueDate,
          dataReleaseDate: validation.data.dataReleaseDate || null,
          categoryId: null,
          options: validation.data.options || [],
        }
      );
    }

    // Create the category
    const { createCategory } = await import("@/services/categories");
    const newCategory = await createCategory({
      name: categoryName,
      description: null,
      color: categoryColor || "#3B82F6",
      organizationId: orgId,
    });

    finalCategoryId = newCategory.id;
  }

  // 6. Perform operation with the resolved category ID
  const forecast = await createForecast({
    ...validation.data,
    categoryId: finalCategoryId,
  });

  // 7. Revalidate cache
  revalidatePath(Router.organizationForecasts(orgId));

  // 8. Redirect (throws NEXT_REDIRECT - this is normal!)
  redirect(Router.forecastDetail(orgId, forecast.id));
}
