"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import DeleteGroupDialog from "./DeleteGroupDialog";

type DeleteGroupButtonProps = {
  groupName: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
};

export default function DeleteGroupButton({
  groupName,
  onDelete,
}: DeleteGroupButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Group
      </Button>
      <DeleteGroupDialog
        open={open}
        onOpenChange={setOpen}
        groupName={groupName}
        onDelete={onDelete}
      />
    </>
  );
}

