import prisma from "@/lib/prisma";
import {
  type AddGroupMemberInput,
  type CreateGroupInput,
  type UpdateGroupInput,
} from "@/schemas/groups";

/**
 * Create a new group inside an organization.
 * Validates that the requesting user belongs to the same organization.
 */
export async function createGroup(data: CreateGroupInput, requesterId: string) {
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: { organizationId: true },
  });

  if (!requester?.organizationId) {
    throw new Error("Requester does not belong to an organization.");
  }

  if (requester.organizationId !== data.organizationId) {
    throw new Error("You can only create groups inside your organization.");
  }

  return prisma.group.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      organizationId: data.organizationId,
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Update group metadata.
 */
export async function updateGroup(id: string, data: UpdateGroupInput) {
  return prisma.group.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
    },
  });
}

/**
 * Delete a group. Cascades to members and predictions via FK config.
 */
export async function deleteGroup(id: string) {
  return prisma.group.delete({
    where: { id },
  });
}

/**
 * Fetch a single group with members and basic organization details.
 */
export async function getGroupById(id: string) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      members: {
        orderBy: { joinedAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          predictions: true,
        },
      },
    },
  });
}

export async function getAvailableUsersForGroups(organizationId: string) {
  return prisma.user.findMany({
    where: {
      organizationId,
      groupMemberships: {
        none: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * List all groups inside an organization with counts.
 */
export async function getOrganizationGroups(organizationId: string) {
  return prisma.group.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { members: true, predictions: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get the group (if any) the user currently belongs to within an organization.
 */
export async function getUserGroup(userId: string, organizationId: string) {
  return prisma.group.findFirst({
    where: {
      organizationId,
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });
}

/**
 * Add a user to a group after verifying org alignment.
 */
export async function addGroupMember(data: AddGroupMemberInput) {
  const [group, user] = await Promise.all([
    prisma.group.findUnique({
      where: { id: data.groupId },
      select: { id: true, organizationId: true },
    }),
    prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, organizationId: true },
    }),
  ]);

  if (!group) {
    throw new Error("Group not found.");
  }

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.organizationId || user.organizationId !== group.organizationId) {
    throw new Error("User must belong to the same organization as the group.");
  }

  const existingMembership = await prisma.groupMember.findUnique({
    where: { userId: data.userId },
  });

  if (existingMembership) {
    throw new Error("User already belongs to a group.");
  }

  return prisma.groupMember.create({
    data: {
      groupId: data.groupId,
      userId: data.userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

/**
 * Remove a user from a group.
 */
export async function removeGroupMember(groupId: string, userId: string) {
  return prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });
}

/**
 * Validate if a user can act on behalf of a group (membership check).
 */
export async function validateGroupAccess(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return Boolean(membership);
}
