import { Prisma, Role } from "@/generated/prisma";
import { decryptApiKey, encryptApiKey } from "@/lib/encryption";
import {
  calculatePagination,
  getPaginationValues,
  PaginatedResult,
  validatePaginationParams,
} from "@/lib/pagination";
import prisma from "@/lib/prisma";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/schemas/organizations";

/**
 * Create a new organization
 *
 * @param data - Organization data to create
 * @returns The created organization
 *
 * @throws {Error} If database operation fails
 *
 * @example
 * ```typescript
 * // In a server action
 * const organization = await createOrganization({
 *   name: "Acme Corp",
 *   description: "A great company"
 * });
 * ```
 */
export async function createOrganization(data: CreateOrganizationInput) {
  // Create organization and predefined categories in a transaction
  const organization = await prisma.$transaction(async (tx) => {
    // Create the organization
    const org = await tx.organization.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    // Create predefined categories for the new organization
    // Note: We can't use createPredefinedCategories here since it uses prisma directly
    // Instead, we'll create them inline within the transaction
    const PREDEFINED_CATEGORIES = [
      { name: "Movies", color: "#E11D48" },
      { name: "Crypto", color: "#F59E0B" },
      { name: "Automobiles", color: "#3B82F6" },
      { name: "Stock Market", color: "#10B981" },
      { name: "Corp. Earnings", color: "#8B5CF6" },
    ];

    await Promise.all(
      PREDEFINED_CATEGORIES.map((category) =>
        tx.forecastCategory.create({
          data: {
            name: category.name,
            color: category.color,
            organizationId: org.id,
          },
        })
      )
    );

    return org;
  });

  return organization;
}

/**
 * Get all organizations with user counts
 *
 * @returns Array of all organizations with user count metadata
 *
 * @example
 * ```typescript
 * // In a page component
 * const organizations = await getOrganizations();
 * // Returns: [{ id, name, description, _count: { users: 5 }, ... }]
 * ```
 */
export async function getOrganizations() {
  return await prisma.organization.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Search and filter options for organizations
 */
export interface OrganizationSearchParams {
  query?: string; // Search by name or ID
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt" | "userCount";
  sortOrder?: "asc" | "desc";
}

/**
 * Get paginated organizations with search and filtering
 *
 * @param params - Search and pagination parameters
 * @returns Paginated organization results
 *
 * @example
 * ```typescript
 * // Search by name or ID with pagination
 * const result = await getOrganizationsPaginated({
 *   query: "Acme",
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: "name",
 *   sortOrder: "asc"
 * });
 * // Returns: { data: [...], pagination: { page, pageSize, totalItems, ... } }
 * ```
 */
export async function getOrganizationsPaginated(
  params: OrganizationSearchParams = {}
): Promise<PaginatedResult<OrganizationListItem>> {
  // Validate and normalize pagination params
  const { page, pageSize } = validatePaginationParams(params, {
    page: 1,
    pageSize: 10,
  });

  const { sortBy = "createdAt", sortOrder = "desc", query } = params;

  // Build where clause for search
  const where: Prisma.OrganizationWhereInput = query
    ? {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            id: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  // Get total count for pagination
  const totalItems = await prisma.organization.count({ where });

  // Calculate pagination values
  const { skip, take } = getPaginationValues(page, pageSize);

  // Build orderBy clause
  let orderBy: Prisma.OrganizationOrderByWithRelationInput;
  if (sortBy === "userCount") {
    orderBy = {
      users: {
        _count: sortOrder,
      },
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  // Fetch paginated data
  const organizations = await prisma.organization.findMany({
    where,
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy,
    skip,
    take,
  });

  // Calculate pagination metadata
  const pagination = calculatePagination(totalItems, page, pageSize);

  return {
    data: organizations,
    pagination,
  };
}

/**
 * Organization list item type (with user count)
 */
export type OrganizationListItem = Prisma.OrganizationGetPayload<{
  include: {
    _count: {
      select: { users: true };
    };
  };
}>;

/**
 * Get organization by ID with full user details
 *
 * @param id - Organization ID
 * @returns Organization with users or null if not found
 *
 * @example
 * ```typescript
 * // In a detail page
 * const organization = await getOrganizationById(params.orgId);
 * if (!organization) {
 *   notFound();
 * }
 * // Use organization.users to display members
 * ```
 */
export async function getOrganizationById(id: string) {
  return await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get organization by ID with minimal data (name only)
 *
 * @param id - Organization ID
 * @returns Organization with name only or null
 *
 * @example
 * ```typescript
 * // In a leaderboard page
 * const organization = await getOrganizationByIdMinimal(orgId);
 * const orgName = organization?.name || "Unknown";
 * ```
 */
export async function getOrganizationByIdMinimal(id: string) {
  return await prisma.organization.findUnique({
    where: { id },
    select: { name: true },
  });
}

/**
 * Check if organization name already exists (case-insensitive)
 *
 * @param name - Organization name to check
 * @param excludeId - Optional organization ID to exclude from check (for updates)
 * @returns True if name exists, false otherwise
 *
 * @example
 * ```typescript
 * // Before creating a new organization
 * const exists = await organizationNameExists("Acme Corp");
 * if (exists) {
 *   return createErrorState({ name: ["Name already exists"] });
 * }
 *
 * // When updating an organization (exclude current ID)
 * const exists = await organizationNameExists("New Name", currentOrgId);
 * ```
 */
export async function organizationNameExists(name: string, excludeId?: string) {
  const org = await prisma.organization.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!org;
}

/**
 * Validate organization creation business rules
 *
 * Checks:
 * - Organization name uniqueness
 *
 * @param data - Organization data to validate
 * @returns Validation result with field errors if any
 *
 * @example
 * ```typescript
 * // In a server action after schema validation
 * const businessValidation = await validateOrganizationCreation(data);
 * if (!businessValidation.valid) {
 *   return createErrorState(businessValidation.errors, data);
 * }
 * ```
 */
export async function validateOrganizationCreation(
  data: CreateOrganizationInput
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  const nameExists = await organizationNameExists(data.name);

  if (nameExists) {
    return {
      valid: false,
      errors: {
        name: ["An organization with this name already exists"],
      },
    };
  }

  return { valid: true };
}

/**
 * Update an existing organization
 *
 * @param id - Organization ID to update
 * @param data - Organization data to update
 * @returns The updated organization
 *
 * @throws {Error} If database operation fails
 *
 * @example
 * ```typescript
 * // In a server action
 * const organization = await updateOrganization(orgId, {
 *   name: "Updated Name",
 *   description: "Updated description"
 * });
 * ```
 */
export async function updateOrganization(
  id: string,
  data: UpdateOrganizationInput
) {
  return await prisma.organization.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

/**
 * Validate organization update business rules
 *
 * Checks:
 * - Organization name uniqueness (if name is being changed)
 *
 * @param id - Organization ID being updated
 * @param data - Organization data to validate
 * @returns Validation result with field errors if any
 *
 * @example
 * ```typescript
 * // In a server action after schema validation
 * const businessValidation = await validateOrganizationUpdate(orgId, data);
 * if (!businessValidation.valid) {
 *   return createErrorState(businessValidation.errors, data);
 * }
 * ```
 */
export async function validateOrganizationUpdate(
  id: string,
  data: UpdateOrganizationInput
): Promise<
  { valid: true } | { valid: false; errors: Record<string, string[]> }
> {
  // Only check name uniqueness if name is being updated
  if (data.name) {
    const nameExists = await organizationNameExists(data.name, id);

    if (nameExists) {
      return {
        valid: false,
        errors: {
          name: ["An organization with this name already exists"],
        },
      };
    }
  }

  return { valid: true };
}

/**
 * Get organization users with pagination, search, and filtering
 *
 * @param orgId - Organization ID
 * @param params - Search and pagination parameters
 * @returns Paginated user results
 *
 * @example
 * ```typescript
 * // Get users with search and filter
 * const result = await getOrganizationUsers(orgId, {
 *   query: "john",
 *   role: "USER",
 *   page: 1,
 *   pageSize: 10
 * });
 * ```
 */
export interface OrganizationUserSearchParams {
  query?: string; // Search by name, email, or ID
  role?: string; // Filter by role
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "email" | "createdAt" | "role";
  sortOrder?: "asc" | "desc";
}

export async function getOrganizationUsers(
  orgId: string,
  params: OrganizationUserSearchParams = {}
): Promise<PaginatedResult<OrganizationUser>> {
  // Validate and normalize pagination params
  const { page, pageSize } = validatePaginationParams(params, {
    page: 1,
    pageSize: 10,
  });

  const { sortBy = "role", sortOrder = "desc", query, role } = params;

  // Build where clause for search and filter
  const where: Prisma.UserWhereInput = {
    organizationId: orgId,
    ...(query && {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          id: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    }),
    ...(role && { role: role as Role }),
  };

  // Get total count for pagination
  const totalItems = await prisma.user.count({ where });

  // Calculate pagination values
  const { skip, take } = getPaginationValues(page, pageSize);

  // Build orderBy clause - support multiple sorting
  let orderBy:
    | Prisma.UserOrderByWithRelationInput
    | Prisma.UserOrderByWithRelationInput[];

  if (sortBy === "role") {
    // When sorting by role, also sort by name as secondary
    orderBy = [{ role: sortOrder }, { name: "asc" }];
  } else {
    // Single field sort
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  // Fetch paginated data
  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Calculate pagination metadata
  const pagination = calculatePagination(totalItems, page, pageSize);

  return {
    data: users,
    pagination,
  };
}

/**
 * Organization user type
 */
export type OrganizationUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Configuration Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update organization's OpenAI API key
 *
 * @param organizationId - Organization ID
 * @param apiKey - OpenAI API key (will be encrypted before storage)
 * @returns Updated organization
 *
 * @throws {Error} If organization not found or encryption fails
 *
 * @example
 * ```typescript
 * await updateOrganizationApiKey("org_123", "sk-1234567890abcdef");
 * ```
 */
export async function updateOrganizationApiKey(
  organizationId: string,
  apiKey: string
) {
  const encrypted = encryptApiKey(apiKey);

  return await prisma.organization.update({
    where: { id: organizationId },
    data: { openaiApiKey: encrypted },
  });
}

/**
 * Get decrypted OpenAI API key for organization
 *
 * @param organizationId - Organization ID
 * @returns Decrypted API key or null if not set
 *
 * @throws {Error} If decryption fails
 *
 * @example
 * ```typescript
 * const apiKey = await getDecryptedApiKey("org_123");
 * if (!apiKey) {
 *   throw new Error("OpenAI API key not configured");
 * }
 * ```
 */
export async function getDecryptedApiKey(
  organizationId: string
): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { openaiApiKey: true },
  });

  if (!org || !org.openaiApiKey) {
    return null;
  }

  return decryptApiKey(org.openaiApiKey);
}

/**
 * Check if organization has exceeded its AI token limit
 *
 * @param organizationId - Organization ID
 * @throws {Error} If token limit exceeded
 *
 * @example
 * ```typescript
 * try {
 *   await checkTokenLimit("org_123");
 *   // Proceed with AI request
 * } catch (error) {
 *   // Show error to user
 * }
 * ```
 */
export async function checkTokenLimit(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      aiTokensUsedThisMonth: true,
      aiTokenLimit: true,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  if (org.aiTokensUsedThisMonth >= org.aiTokenLimit) {
    throw new Error(
      "Monthly AI token limit exceeded. Contact admin to increase limit."
    );
  }
}

/**
 * Increment organization's AI token usage
 *
 * @param organizationId - Organization ID
 * @param tokens - Number of tokens to add
 *
 * @example
 * ```typescript
 * await incrementAiTokenUsage("org_123", 1500);
 * ```
 */
export async function incrementAiTokenUsage(
  organizationId: string,
  tokens: number
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      aiTokensUsedThisMonth: {
        increment: tokens,
      },
    },
  });
}

/**
 * Reset organization's monthly AI token usage
 *
 * @param organizationId - Organization ID
 *
 * @example
 * ```typescript
 * // Call monthly via cron job
 * await resetMonthlyTokens("org_123");
 * ```
 */
export async function resetMonthlyTokens(
  organizationId: string
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      aiTokensUsedThisMonth: 0,
      aiTokensResetAt: new Date(),
    },
  });
}

/**
 * Update organization's AI token limit
 *
 * @param organizationId - Organization ID
 * @param limit - New token limit
 *
 * @example
 * ```typescript
 * await updateAiTokenLimit("org_123", 200000);
 * ```
 */
export async function updateAiTokenLimit(
  organizationId: string,
  limit: number
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { aiTokenLimit: limit },
  });
}
