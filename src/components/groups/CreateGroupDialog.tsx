"use client";

import { createGroupAction } from "@/app/(protected)/(org-admin)/groups/actions";
import GroupForm, { type GroupFormData } from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionState } from "@/lib/server-action-utils";
import { useCallback, useState } from "react";

type CreateGroupDialogProps = {
  organizationId: string;
};

export default function CreateGroupDialog({
  organizationId,
}: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const wrappedAction = useCallback(
    async (
      prevState: ActionState<GroupFormData> | undefined,
      formData: FormData
    ) => {
      formData.set("organizationId", organizationId);
      const result = await createGroupAction(prevState, formData);
      return {
        ...result,
        data: result.data
          ? {
              ...result.data,
              organizationId,
            }
          : undefined,
      };
    },
    [organizationId]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Group forecasts under a shared team. All members can submit and edit
            the group prediction.
          </DialogDescription>
        </DialogHeader>
        <GroupForm
          action={wrappedAction}
          organizationId={organizationId}
          submitLabel="Create Group"
          showCancel={false}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
