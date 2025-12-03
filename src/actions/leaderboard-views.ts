"use server";

import { auth } from "@/auth";
import { ActionState, createErrorState } from "@/lib/server-action-utils";
import {
  createLeaderboardViewSchema,
  deleteLeaderboardViewSchema,
  updateLeaderboardViewSchema,
  type CreateLeaderboardViewInput,
  type UpdateLeaderboardViewInput,
} from "@/schemas/leaderboard-views";
import {
  createLeaderboardView,
  deleteLeaderboardView,
  getLeaderboardViewsForUser,
  updateLeaderboardView,
  validateViewCreation,
  validateViewUpdate,
} from "@/services/leaderboard-views";
import { revalidatePath } from "next/cache";

/**
 * Get all saved views for the current user, optionally filtered by viewType
 */
export async function getViewsAction(
  viewType?: "USER" | "PREDICTION" | "CATEGORY" | "GROUP"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return await getLeaderboardViewsForUser(session.user.id, viewType);
}

/**
 * Create a new saved view
 */
export async function createViewAction(
  data: CreateLeaderboardViewInput
): Promise<ActionState> {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorState({ _form: ["You must be logged in"] });
  }

  // 2. Validate schema
  const validation = createLeaderboardViewSchema.safeParse(data);
  if (!validation.success) {
    return createErrorState(
      validation.error.flatten().fieldErrors as Record<string, string[]>,
      data
    );
  }

  // 3. Validate business rules
  const businessValidation = await validateViewCreation(
    validation.data,
    session.user.id
  );
  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, validation.data);
  }

  // 4. Create view
  try {
    const view = await createLeaderboardView(validation.data, session.user.id);

    // 5. Revalidate
    revalidatePath("/", "layout");

    return {
      success: true,
      data: {
        ...view,
        viewType: view.viewType,
        filters: view.filters as Record<string, unknown>,
        columnVisibility: view.columnVisibility as Record<string, boolean>,
      },
    };
  } catch (error) {
    console.error("Failed to create view:", error);
    return createErrorState(
      { _form: ["Failed to create view. Please try again."] },
      validation.data
    );
  }
}

/**
 * Update (rename) a saved view
 */
export async function updateViewAction(
  data: UpdateLeaderboardViewInput
): Promise<ActionState> {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorState({ _form: ["You must be logged in"] });
  }

  // 2. Validate schema
  const validation = updateLeaderboardViewSchema.safeParse(data);
  if (!validation.success) {
    return createErrorState(
      validation.error.flatten().fieldErrors as Record<string, string[]>,
      data
    );
  }

  // 3. Validate business rules
  const businessValidation = await validateViewUpdate(
    validation.data,
    session.user.id
  );
  if (!businessValidation.valid) {
    return createErrorState(businessValidation.errors, validation.data);
  }

  // 4. Update view
  try {
    const view = await updateLeaderboardView(validation.data, session.user.id);

    // 5. Revalidate
    revalidatePath("/", "layout");

    return {
      success: true,
      data: {
        ...view,
        filters: view.filters as Record<string, unknown>,
        columnVisibility: view.columnVisibility as Record<string, boolean>,
      },
    };
  } catch (error) {
    console.error("Failed to update view:", error);
    return createErrorState(
      { _form: ["Failed to update view. Please try again."] },
      validation.data
    );
  }
}

/**
 * Delete a saved view
 */
export async function deleteViewAction(id: string): Promise<ActionState> {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorState({ _form: ["You must be logged in"] });
  }

  // 2. Validate schema
  const validation = deleteLeaderboardViewSchema.safeParse({ id });
  if (!validation.success) {
    return createErrorState(
      validation.error.flatten().fieldErrors as Record<string, string[]>,
      { id }
    );
  }

  // 3. Delete view
  try {
    await deleteLeaderboardView(id, session.user.id);

    // 4. Revalidate
    revalidatePath("/", "layout");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Failed to delete view:", error);
    return createErrorState(
      { _form: ["Failed to delete view. Please try again."] },
      { id }
    );
  }
}
