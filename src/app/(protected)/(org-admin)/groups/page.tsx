import CreateGroupDialog from "@/components/groups/CreateGroupDialog";
import GroupList from "@/components/groups/GroupList";
import Router from "@/constants/router";
import { requireOrgAdmin } from "@/lib/guards";
import { getOrganizationGroups } from "@/services/groups";
import { getOrganizationById } from "@/services/organizations";
import { notFound } from "next/navigation";

export default async function OrgAdminGroupsPage() {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;

  const organization = await getOrganizationById(orgId);
  if (!organization) {
    notFound();
  }

  const groups = await getOrganizationGroups(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{organization.name} Groups</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage forecasting groups for your organization.
          </p>
        </div>
        <CreateGroupDialog organizationId={organization.id} />
      </div>

      <GroupList
        groups={groups.map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: group._count.members,
          predictionCount: group._count.predictions,
          updatedAt: group.updatedAt,
          manageHref: Router.ORG_ADMIN_GROUP_DETAIL(group.id),
          editHref: Router.ORG_ADMIN_GROUP_DETAIL(group.id),
        }))}
      />
    </div>
  );
}
