"use client";

import { updateOrganizationAction } from "@/app/(protected)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type SettingsOverviewViewProps = {
  organizationName: string;
  organizationDescription: string | null;
};

export default function SettingsOverviewView({
  organizationName,
  organizationDescription,
}: SettingsOverviewViewProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateOrganizationAction,
    undefined
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Show success message and refresh page on successful update
  useEffect(() => {
    if (state?.success) {
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      // Refresh to show updated data
      router.refresh();
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update your organization&apos;s name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* General form error */}
            {state?.errors?._form && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {state.errors._form.join(", ")}
              </div>
            )}

            {/* Success message */}
            {showSuccessMessage && (
              <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">
                Organization settings updated successfully
              </div>
            )}

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter organization name"
                required
                disabled={isPending}
                defaultValue={state?.data?.name || organizationName}
                aria-describedby={
                  state?.errors?.name ? "name-error" : undefined
                }
                className={state?.errors?.name ? "border-destructive" : ""}
              />
              {state?.errors?.name && (
                <p id="name-error" className="text-sm text-destructive">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>

            {/* Organization Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter organization description"
                disabled={isPending}
                defaultValue={
                  state?.data?.description || organizationDescription || ""
                }
                aria-describedby={
                  state?.errors?.description ? "description-error" : undefined
                }
                className={
                  state?.errors?.description ? "border-destructive" : ""
                }
                rows={4}
              />
              {state?.errors?.description && (
                <p id="description-error" className="text-sm text-destructive">
                  {state.errors.description.join(", ")}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Minimum 10 characters, maximum 500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
