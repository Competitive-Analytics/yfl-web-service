"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionState } from "@/lib/server-action-utils";
import { useActionState, useEffect, useRef } from "react";

export type GroupFormData = {
  id?: string;
  name: string;
  description?: string | null;
  organizationId: string;
};

type GroupFormProps = {
  action: (
    prevState: ActionState<GroupFormData> | undefined,
    formData: FormData
  ) => Promise<ActionState<GroupFormData>>;
  organizationId: string;
  defaultValues?: {
    id?: string;
    name?: string;
    description?: string | null;
  };
  submitLabel?: string;
  cancelLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

export default function GroupForm({
  action,
  organizationId,
  defaultValues,
  submitLabel = "Save Group",
  cancelLabel = "Cancel",
  onSuccess,
  onCancel,
  showCancel = true,
}: GroupFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) {
      if (!defaultValues?.id) {
        formRef.current?.reset();
      }
      onSuccess?.();
    }
  }, [state?.success, onSuccess, defaultValues?.id]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="organizationId" value={organizationId} />
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {state?.errors?._form && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {state.errors._form.join(" ")}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Group name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Revenue team"
          required
          maxLength={100}
          disabled={isPending}
          defaultValue={
            state?.success ? defaultValues?.name ?? "" : state?.data?.name ?? defaultValues?.name ?? ""
          }
          aria-describedby={state?.errors?.name ? "group-name-error" : undefined}
          className={state?.errors?.name ? "border-destructive" : ""}
        />
        {state?.errors?.name && (
          <p id="group-name-error" className="text-sm text-destructive">
            {state.errors.name.join(" ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Short description to help teammates understand this group."
          rows={3}
          maxLength={600}
          disabled={isPending}
          defaultValue={
            state?.success
              ? defaultValues?.description ?? ""
              : state?.data?.description ?? defaultValues?.description ?? ""
          }
          aria-describedby={
            state?.errors?.description ? "group-description-error" : undefined
          }
          className={state?.errors?.description ? "border-destructive" : ""}
        />
        {state?.errors?.description && (
          <p id="group-description-error" className="text-sm text-destructive">
            {state.errors.description.join(" ")}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

