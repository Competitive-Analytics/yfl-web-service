import GroupMembers from "@/components/groups/GroupMembers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Router from "@/constants/router";
import { auth } from "@/auth";
import { getUserGroup } from "@/services/groups";
import { redirect } from "next/navigation";

export default async function UserGroupPage() {
  const session = await auth();
  if (!session) {
    redirect(Router.SIGN_IN);
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are not currently assigned to an organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  const group = await getUserGroup(session.user.id, orgId);

  if (!group) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Group</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t been added to a group yet. Reach out to your
            organization admin to join one.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <p className="text-sm text-muted-foreground">
          Members in your forecasting group.
        </p>
      </div>

      <GroupMembers
        groupId={group.id}
        members={group.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt,
        }))}
        canManage={false}
      />
    </div>
  );
}

