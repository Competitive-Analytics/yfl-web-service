import DeleteGroupButton from "@/components/groups/DeleteGroupButton";
import GroupForm, { type GroupFormData } from "@/components/groups/GroupForm";
import GroupMembers from "@/components/groups/GroupMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Router from "@/constants/router";
import { requireOrgAdmin } from "@/lib/guards";
import type { ActionState } from "@/lib/server-action-utils";
import { getAvailableUsersForGroups, getGroupById } from "@/services/groups";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addGroupMemberAction,
  deleteGroupAction,
  updateGroupAction,
} from "../actions";

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

  const availableUsers = await getAvailableUsersForGroups(orgId);

  const updateGroupFormAction = async (
    prevState: ActionState<GroupFormData> | undefined,
    formData: FormData
  ): Promise<ActionState<GroupFormData>> => {
    const mapPrevState = (state: ActionState<GroupFormData> | undefined) => {
      if (!state) return undefined;
      return {
        ...state,
        data: state.data
          ? {
              id: state.data.id ?? group.id,
              name: state.data.name,
              description: state.data.description ?? null,
            }
          : undefined,
      };
    };

    const result = await updateGroupAction(
      group.id,
      mapPrevState(prevState),
      formData
    );
    const mapData = (
      data?: {
        id: string;
        name?: string;
        description?: string | null;
      } | null
    ): GroupFormData | undefined => {
      if (!data) {
        return undefined;
      }
      return {
        id: data.id,
        name: data.name ?? formData.get("name")?.toString() ?? group.name,
        description:
          data.description ??
          formData.get("description")?.toString() ??
          group.description ??
          null,
        organizationId: orgId,
      };
    };
    return {
      ...result,
      data: mapData(result.data),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Group</p>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href={Router.ORG_ADMIN_GROUPS}>Back to Groups</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
            {group.description && (
              <p className="pt-2 text-muted-foreground">{group.description}</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupForm
              action={updateGroupFormAction}
              organizationId={orgId}
              defaultValues={{
                id: group.id,
                name: group.name,
                description: group.description ?? undefined,
              }}
              submitLabel="Save Changes"
              showCancel={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danger Zone</CardTitle>
            <p className="text-sm text-muted-foreground">
              Deleting a group removes all associated group predictions.
            </p>
          </div>
          <DeleteGroupButton
            groupName={group.name}
            onDelete={deleteGroupAction.bind(null, group.id)}
          />
        </CardHeader>
      </Card>

      <GroupMembers
        groupId={group.id}
        members={group.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt,
        }))}
        availableUsers={availableUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }))}
        addMemberAction={addGroupMemberAction}
        canManage
      />
    </div>
  );
}
