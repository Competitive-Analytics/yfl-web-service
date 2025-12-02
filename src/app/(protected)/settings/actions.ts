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
  updateOrganization,
  validateOrganizationUpdate,
} from "@/services/organizations";
import { revalidatePath } from "next/cache";

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
