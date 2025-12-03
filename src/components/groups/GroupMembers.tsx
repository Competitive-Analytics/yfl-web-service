"use client";

import { removeGroupMemberAction } from "@/app/(protected)/(org-admin)/groups/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionState } from "@/lib/server-action-utils";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronsUpDown, Loader2, UserMinus } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

export type GroupMemberSummary = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
  joinedAt?: Date | string | null;
};

export type GroupMemberCandidate = {
  id: string;
  name: string | null;
  email: string;
};

type AddMemberFormData = {
  groupId: string;
  userId: string;
};

type GroupMembersProps = {
  groupId: string;
  members: GroupMemberSummary[];
  availableUsers?: GroupMemberCandidate[];
  addMemberAction?: (
    prevState: ActionState<AddMemberFormData> | undefined,
    formData: FormData
  ) => Promise<ActionState<AddMemberFormData>>;
  canManage?: boolean;
};

const noopAddMemberAction = async (
  prevState: ActionState<AddMemberFormData> | undefined
): Promise<ActionState<AddMemberFormData>> => prevState ?? { success: false };

export default function GroupMembers({
  groupId,
  members,
  availableUsers = [],
  addMemberAction,
  canManage = false,
}: GroupMembersProps) {
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isRemoving, startRemoveTransition] = useTransition();

  const [state, addMemberFormAction, isAdding] = useActionState(
    addMemberAction ?? noopAddMemberAction,
    undefined
  );
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success && addMemberAction) {
      const form = document.getElementById(
        `add-member-form-${groupId}`
      ) as HTMLFormElement | null;
      form?.reset();
      setSelectedUserId(null);
      setUserSearch("");
      setIsUserPopoverOpen(false);
    }
  }, [state?.success, addMemberAction, groupId]);

  const selectableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.id));
    return availableUsers.filter((candidate) => !memberIds.has(candidate.id));
  }, [availableUsers, members]);
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) {
      return selectableUsers;
    }
    const search = userSearch.toLowerCase();
    return selectableUsers.filter((candidate) =>
      `${candidate.name ?? ""} ${candidate.email}`
        .toLowerCase()
        .includes(search)
    );
  }, [selectableUsers, userSearch]);
  const selectedUser = selectableUsers.find(
    (candidate) => candidate.id === selectedUserId
  );

  const handleRemoveMember = (userId: string) => {
    if (!canManage) {
      return;
    }

    startRemoveTransition(async () => {
      setRemoveError(null);
      setRemovingId(userId);
      const result = await removeGroupMemberAction(groupId, userId);
      if (!result?.success) {
        setRemoveError(result?.error || "Failed to remove member.");
      }
      setRemovingId(null);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>
              {canManage
                ? "Add or remove members from this group."
                : "Members currently assigned to this group."}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {canManage && addMemberAction && (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`userId-${groupId}`}>Add member</Label>
              <p className="text-sm text-muted-foreground">
                Select a user from your organization who is not already in a
                group.
              </p>
            </div>
            <form
              id={`add-member-form-${groupId}`}
              action={addMemberFormAction}
              className="flex flex-col gap-3 md:flex-row md:items-end"
            >
              <input type="hidden" name="groupId" value={groupId} />
              <input
                type="hidden"
                name="userId"
                value={selectedUserId ?? ""}
              />
              <div className="w-full space-y-2 md:w-[360px] lg:w-[420px]">
                <Popover
                  open={isUserPopoverOpen}
                  onOpenChange={setIsUserPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={isUserPopoverOpen}
                      className={cn(
                        "w-full justify-between",
                        state?.errors?.userId && "border-destructive"
                      )}
                      disabled={isAdding || selectableUsers.length === 0}
                    >
                      {selectedUser ? (
                        <span className="truncate text-left">
                          {selectedUser.name || selectedUser.email} ·{" "}
                          {selectedUser.email}
                        </span>
                      ) : selectableUsers.length === 0 ? (
                        <span className="text-muted-foreground">
                          No available users
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Search users...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[320px] max-w-[420px] w-[360px] p-0"
                    align="start"
                  >
                    <div className="p-2">
                      <Input
                        placeholder="Search by name or email"
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                          {userSearch
                            ? "No users match your search."
                            : "No users available to add."}
                        </p>
                      ) : (
                        filteredUsers.map((user) => (
                          <Button
                            key={user.id}
                            variant="ghost"
                            className="w-full justify-start text-sm font-normal"
                            type="button"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setUserSearch(user.name || user.email);
                              setIsUserPopoverOpen(false);
                            }}
                          >
                            <span>
                              {user.name || user.email} · {user.email}
                            </span>
                            {selectedUserId === user.id && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </Button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {state?.errors?.userId && (
                  <p className="text-sm text-destructive">
                    {state.errors.userId.join(" ")}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={
                  isAdding || selectableUsers.length === 0 || !selectedUserId
                }
                className="md:w-auto"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            </form>
            {state?.errors?._form && (
              <div className="text-sm text-destructive">
                {state.errors._form.join(" ")}
              </div>
            )}
          </div>
        )}

        <Separator />

        {removeError && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
            {removeError}
          </div>
        )}

        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This group has no members yet.
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                    <AvatarFallback>
                      {member.name?.[0]?.toUpperCase() ||
                        member.email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.name || "Unnamed user"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {member.joinedAt && (
                    <span>
                      Joined{" "}
                      {formatDistanceToNow(new Date(member.joinedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isRemoving && removingId === member.id}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      {isRemoving && removingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

