import { requireOrgAdmin } from "@/lib/guards";
import { getOrganizationById } from "@/services/organizations";
import SettingsOverviewView from "@/views/settings/SettingsOverviewView";
import { notFound } from "next/navigation";

export default async function SettingsOverviewPage() {
  // Verify user is an org admin with an organization
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!; // Safe because requireOrgAdmin checks this

  // Fetch organization details
  const organization = await getOrganizationById(orgId);

  if (!organization) {
    notFound();
  }

  return (
    <SettingsOverviewView
      organizationName={organization.name}
      organizationDescription={organization.description}
    />
  );
}
