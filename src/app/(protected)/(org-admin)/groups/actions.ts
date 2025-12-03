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
import {
  addGroupMemberSchema,
  createGroupSchema,
  updateGroupSchema,
  type AddGroupMemberInput,
  type CreateGroupInput,
  type UpdateGroupInput,
} from "@/schemas/groups";
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  getGroupById,
  removeGroupMember,
  updateGroup,
} from "@/services/groups";
import { revalidatePath } from "next/cache";

type GroupFormState = ActionState<
  Pick<CreateGroupInput, "name" | "description">
>;

type UpdateGroupFormState = ActionState<UpdateGroupInput>;

type AddMemberFormState = ActionState<AddGroupMemberInput>;

const GROUPS_PATH = Router.ORG_ADMIN_GROUPS;

function sanitizeGroupForm(
  rawData: Record<string, FormDataEntryValue | null>,
  organizationId: string
) {
  return {
    name: formDataToString(rawData.name),
    description: formDataToString(rawData.description) || null,
    organizationId,
  };
}

export async function createGroupAction(
  prevState: GroupFormState | undefined,
  formData: FormData
): Promise<GroupFormState> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const rawData = extractFormData(formData, ["name", "description"]);
  const dataToValidate = sanitizeGroupForm(rawData, orgId);

  const validation = validateFormData(createGroupSchema, dataToValidate);
  if (!validation.success) {
    return createErrorState(validation.errors, dataToValidate);
  }

  await createGroup(validation.data, session.user.id);

  revalidatePath(GROUPS_PATH);
  return { success: true, errors: {}, data: validation.data };
}

export async function updateGroupAction(
  groupId: string,
  prevState: UpdateGroupFormState | undefined,
  formData: FormData
): Promise<UpdateGroupFormState> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    return createErrorState(
      { _form: ["You are not authorized to update this group."] },
      { id: groupId }
    );
  }

  const rawData = extractFormData(formData, ["name", "description"]);
  const dataToValidate = {
    id: groupId,
    name: formDataToString(rawData.name) || undefined,
    description: formDataToString(rawData.description) || undefined,
  };

  const validation = validateFormData(updateGroupSchema, dataToValidate);
  if (!validation.success) {
    return createErrorState(validation.errors, dataToValidate);
  }

  await updateGroup(groupId, validation.data);

  revalidatePath(GROUPS_PATH);
  revalidatePath(`${GROUPS_PATH}/${groupId}`);
  return { success: true, errors: {}, data: validation.data };
}

export async function deleteGroupAction(groupId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    return {
      success: false,
      error: "You are not authorized to delete this group.",
    };
  }

  await deleteGroup(groupId);
  revalidatePath(GROUPS_PATH);
  return { success: true };
}

export async function addGroupMemberAction(
  prevState: AddMemberFormState | undefined,
  formData: FormData
): Promise<AddMemberFormState> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const rawData = extractFormData(formData, ["groupId", "userId"]);
  const groupId = formDataToString(rawData.groupId);
  const userId = formDataToString(rawData.userId);

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    return createErrorState(
      { _form: ["You are not authorized to modify this group."] },
      { groupId, userId }
    );
  }

  const validation = validateFormData(addGroupMemberSchema, {
    groupId,
    userId,
  });
  if (!validation.success) {
    return createErrorState(validation.errors, { groupId, userId });
  }

  await addGroupMember(validation.data);

  revalidatePath(GROUPS_PATH);
  revalidatePath(`${GROUPS_PATH}/${groupId}`);

  return { success: true, errors: {}, data: validation.data };
}

export async function removeGroupMemberAction(
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    return {
      success: false,
      error: "You are not authorized to modify this group.",
    };
  }

  await removeGroupMember(groupId, userId);

  revalidatePath(GROUPS_PATH);
  revalidatePath(`${GROUPS_PATH}/${groupId}`);

  return { success: true };
}

type GroupFormData = {
  id?: string;
  name: string;
  description?: string | null;
  organizationId: string;
};

export async function updateGroupFormAction(
  groupId: string,
  prevState: ActionState<GroupFormData> | undefined,
  formData: FormData
): Promise<ActionState<GroupFormData>> {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    return createErrorState(
      { _form: ["You are not authorized to update this group."] },
      {
        id: groupId,
        name: formDataToString(formData.get("name")),
        description: formDataToString(formData.get("description")) || null,
        organizationId: orgId,
      }
    );
  }

  const rawData = extractFormData(formData, ["name", "description"]);
  const dataToValidate = {
    id: groupId,
    name: formDataToString(rawData.name) || undefined,
    description: formDataToString(rawData.description) || undefined,
  };

  const validation = validateFormData(updateGroupSchema, dataToValidate);
  if (!validation.success) {
    return createErrorState(validation.errors, {
      id: groupId,
      name: formDataToString(rawData.name),
      description: formDataToString(rawData.description) || null,
      organizationId: orgId,
    });
  }

  await updateGroup(groupId, validation.data);

  revalidatePath(GROUPS_PATH);
  revalidatePath(`${GROUPS_PATH}/${groupId}`);

  return {
    success: true,
    errors: {},
    data: {
      id: groupId,
      name: validation.data.name ?? group.name,
      description: validation.data.description ?? group.description ?? null,
      organizationId: orgId,
    },
  };
}
