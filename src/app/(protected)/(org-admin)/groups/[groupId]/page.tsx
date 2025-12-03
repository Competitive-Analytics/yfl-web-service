import GroupMembers from "@/components/groups/GroupMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Router from "@/constants/router";
import { requireOrgAdmin } from "@/lib/guards";
import { getGroupById } from "@/services/groups";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function OrgAdminGroupDetailPage({ params }: PageProps) {
  const session = await requireOrgAdmin();
  const orgId = session.user.organizationId!;
  const { groupId } = await params;

  const group = await getGroupById(groupId);
  if (!group || group.organization?.id !== orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Group</p>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="default" asChild>
            <Link href={Router.ORG_ADMIN_GROUP_EDIT(groupId)}>Edit Group</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={Router.ORG_ADMIN_GROUPS}>Back to Groups</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{group.name}</p>
            </div>
            {group.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{group.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Members</span>
              <span className="font-semibold">{group._count.members}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Group Predictions</span>
              <span className="font-semibold">{group._count.predictions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <GroupMembers
        groupId={group.id}
        members={group.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt,
        }))}
        availableUsers={[]}
        canManage={false}
      />
    </div>
  );
}
