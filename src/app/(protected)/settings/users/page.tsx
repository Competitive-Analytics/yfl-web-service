import { requireOrgAdmin } from "@/lib/guards";
import {
  getOrganizationById,
  getOrganizationUsers,
} from "@/services/organizations";
import OrgAdminUsersView from "@/views/organizations/OrgAdminUsersView";
import { notFound } from "next/navigation";

export interface SettingsUsersSearchParams {
  page?: string;
  pageSize?: string;
  query?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
  create?: string;
  bulkUpload?: string;
}

export interface SettingsUsersPageProps {
  searchParams: Promise<SettingsUsersSearchParams>;
}

export default async function SettingsUsersPage({
  searchParams,
}: SettingsUsersPageProps) {
  // Verify user is an org admin with an organization
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!; // Safe because requireOrgAdmin checks this

  const resolvedSearchParams = await searchParams;

  // Fetch organization details
  const organization = await getOrganizationById(orgId);

  if (!organization) {
    notFound();
  }

  // Fetch users with pagination
  const users = await getOrganizationUsers(orgId, {
    page: resolvedSearchParams.page
      ? parseInt(resolvedSearchParams.page)
      : undefined,
    pageSize: resolvedSearchParams.pageSize
      ? parseInt(resolvedSearchParams.pageSize)
      : undefined,
    query: resolvedSearchParams.query,
    role: resolvedSearchParams.role,
    sortBy: resolvedSearchParams.sortBy as
      | "name"
      | "email"
      | "createdAt"
      | "role"
      | undefined,
    sortOrder: resolvedSearchParams.sortOrder as "asc" | "desc" | undefined,
  });

  return (
    <OrgAdminUsersView
      organizationId={organization.id}
      organizationName={organization.name}
      initialUsers={users}
      searchParams={resolvedSearchParams}
    />
  );
}
