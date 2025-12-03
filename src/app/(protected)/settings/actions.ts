"use server";

import Router from "@/constants/router";
import { requireOrgAdmin } from "@/lib/guards";
import {
  ActionState,
  createErrorState,
  extractFormData,
  formDataToString,
  validateFormData,
} from "@/lib/server-action-utils";
import { updateOrganizationSchema } from "@/schemas/organizations";
import {
  updateAiTokenLimit,
  updateOrganization,
  updateOrganizationApiKey,
  validateOrganizationUpdate,
} from "@/services/organizations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Type definition for form data
type UpdateOrganizationFormData = {
  name: string;
  description: string | null;
};

/**
 * Update organization settings (name and description)
 */
export async function updateOrganizationAction(
  prevState: ActionState<UpdateOrganizationFormData> | undefined,
  formData: FormData
): Promise<ActionState<UpdateOrganizationFormData>> {
  // 1. Verify permissions and get org admin's organization
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  // 2. Extract form data
  const rawData = extractFormData(formData, ["name", "description"]);

  // 3. Validate schema
  const validation = validateFormData(updateOrganizationSchema, rawData);
  if (!validation.success) {
    return createErrorState(validation.errors, {
      name: formDataToString(rawData.name),
      description: formDataToString(rawData.description) || null,
    });
  }

  // 4. Validate business rules
  const businessValidation = await validateOrganizationUpdate(
    orgId,
    validation.data
  );
  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, {
      name: validation.data.name || formDataToString(rawData.name),
      description: validation.data.description || null,
    });
  }

  // 5. Perform operation
  await updateOrganization(orgId, validation.data);

  // 6. Revalidate cache
  revalidatePath(Router.SETTINGS);
  revalidatePath(Router.HOME);

  // 7. Return success state
  return {
    success: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Configuration Actions
// ─────────────────────────────────────────────────────────────────────────────

// Type definition for AI key form data
type UpdateApiKeyFormData = {
  apiKey: string;
};

const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .startsWith("sk-", "Invalid OpenAI API key format"),
});

/**
 * Update organization's OpenAI API key
 */
export async function updateApiKeyAction(
  prevState: ActionState<UpdateApiKeyFormData> | undefined,
  formData: FormData
): Promise<ActionState<UpdateApiKeyFormData>> {
  // 1. Verify permissions
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  // 2. Extract form data
  const rawData = extractFormData(formData, ["apiKey"]);

  // 3. Validate schema
  const validation = validateFormData(apiKeySchema, rawData);
  if (!validation.success) {
    return createErrorState(validation.errors, {
      apiKey: formDataToString(rawData.apiKey),
    });
  }

  // 4. Update API key (will be encrypted)
  try {
    await updateOrganizationApiKey(orgId, validation.data.apiKey);
  } catch (error) {
    return createErrorState(
      {
        _form: [
          error instanceof Error ? error.message : "Failed to update API key",
        ],
      },
      { apiKey: "" }
    );
  }

  // 5. Revalidate cache
  revalidatePath(Router.SETTINGS);

  // 6. Return success state
  return {
    success: true,
  };
}

// Type definition for token limit form data
type UpdateTokenLimitFormData = {
  tokenLimit: number;
};

const tokenLimitSchema = z.object({
  tokenLimit: z.coerce
    .number()
    .int()
    .min(1000, "Token limit must be at least 1,000")
    .max(10000000, "Token limit cannot exceed 10,000,000"),
});

/**
 * Update organization's AI token limit
 */
export async function updateTokenLimitAction(
  prevState: ActionState<UpdateTokenLimitFormData> | undefined,
  formData: FormData
): Promise<ActionState<UpdateTokenLimitFormData>> {
  // 1. Verify permissions
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  // 2. Extract form data
  const rawData = extractFormData(formData, ["tokenLimit"]);

  // 3. Validate schema
  const validation = validateFormData(tokenLimitSchema, rawData);
  if (!validation.success) {
    return createErrorState(validation.errors, {
      tokenLimit: parseInt(formDataToString(rawData.tokenLimit) || "100000"),
    });
  }

  // 4. Update token limit
  try {
    await updateAiTokenLimit(orgId, validation.data.tokenLimit);
  } catch (error) {
    return createErrorState(
      {
        _form: [
          error instanceof Error
            ? error.message
            : "Failed to update token limit",
        ],
      },
      { tokenLimit: 100000 }
    );
  }

  // 5. Revalidate cache
  revalidatePath(Router.SETTINGS);

  // 6. Return success state
  return {
    success: true,
  };
}
