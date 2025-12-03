import { z } from "zod";

const groupNameSchema = z
  .string()
  .min(2, "Group name must be at least 2 characters long")
  .max(100, "Group name cannot exceed 100 characters");

const groupDescriptionSchema = z
  .string()
  .max(600, "Description cannot exceed 600 characters")
  .optional()
  .or(z.literal(""))
  .nullable();

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema,
  organizationId: z.string().min(1, "Organization is required"),
});

export const updateGroupSchema = z.object({
  id: z.string().min(1, "Group ID is required"),
  name: groupNameSchema.optional(),
  description: groupDescriptionSchema,
});

export const addGroupMemberSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const removeGroupMemberSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
export type RemoveGroupMemberInput = z.infer<typeof removeGroupMemberSchema>;

