"use client";

import {
  updateApiKeyAction,
  updateOrganizationAction,
  updateTokenLimitAction,
} from "@/app/(protected)/settings/actions";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type SettingsOverviewViewProps = {
  organizationName: string;
  organizationDescription: string | null;
  aiTokensUsed: number;
  aiTokenLimit: number;
  hasApiKey: boolean;
};

export default function SettingsOverviewView({
  organizationName,
  organizationDescription,
  aiTokensUsed,
  aiTokenLimit,
  hasApiKey,
}: SettingsOverviewViewProps) {
  const router = useRouter();

  // Organization update state
  const [state, formAction, isPending] = useActionState(
    updateOrganizationAction,
    undefined
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // API key update state
  const [apiKeyState, apiKeyFormAction, apiKeyPending] = useActionState(
    updateApiKeyAction,
    undefined
  );
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);

  // Token limit update state
  const [tokenLimitState, tokenLimitFormAction, tokenLimitPending] =
    useActionState(updateTokenLimitAction, undefined);
  const [showTokenLimitSuccess, setShowTokenLimitSuccess] = useState(false);

  // Show success message and refresh page on successful update
  useEffect(() => {
    if (state?.success) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      router.refresh();
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (apiKeyState?.success) {
      setShowApiKeySuccess(true);
      const timer = setTimeout(() => setShowApiKeySuccess(false), 3000);
      router.refresh();
      return () => clearTimeout(timer);
    }
  }, [apiKeyState?.success, router]);

  useEffect(() => {
    if (tokenLimitState?.success) {
      setShowTokenLimitSuccess(true);
      const timer = setTimeout(() => setShowTokenLimitSuccess(false), 3000);
      router.refresh();
      return () => clearTimeout(timer);
    }
  }, [tokenLimitState?.success, router]);

  const tokenUsagePercent = (aiTokensUsed / aiTokenLimit) * 100;

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

      {/* AI Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Forecast Assistant</CardTitle>
          </div>
          <CardDescription>
            Configure OpenAI API key and token limits for AI-powered forecast
            creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Key Status</span>
            </div>
            {hasApiKey ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                ✓ Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600">
                ⚠️ Not Configured
              </Badge>
            )}
          </div>

          {/* Token Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Token Usage This Month</span>
              </div>
              <span className="text-muted-foreground">
                {aiTokensUsed.toLocaleString()} /{" "}
                {aiTokenLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={tokenUsagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {tokenUsagePercent.toFixed(1)}% of monthly limit used
            </p>
          </div>

          {/* API Key Form */}
          <form action={apiKeyFormAction} className="space-y-4">
            {apiKeyState?.errors?._form && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {apiKeyState.errors._form.join(", ")}
              </div>
            )}

            {showApiKeySuccess && (
              <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">
                OpenAI API key updated successfully
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="apiKey">
                OpenAI API Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder={hasApiKey ? "••••••••" : "sk-..."}
                disabled={apiKeyPending}
                className={
                  apiKeyState?.errors?.apiKey ? "border-destructive" : ""
                }
              />
              {apiKeyState?.errors?.apiKey && (
                <p className="text-sm text-destructive">
                  {apiKeyState.errors.apiKey.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your API key will be encrypted before storage. Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <Button type="submit" disabled={apiKeyPending}>
              {apiKeyPending
                ? "Updating..."
                : hasApiKey
                ? "Update API Key"
                : "Set API Key"}
            </Button>
          </form>

          {/* Token Limit Form */}
          <form action={tokenLimitFormAction} className="space-y-4">
            {tokenLimitState?.errors?._form && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {tokenLimitState.errors._form.join(", ")}
              </div>
            )}

            {showTokenLimitSuccess && (
              <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">
                Token limit updated successfully
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tokenLimit">Monthly Token Limit</Label>
              <Input
                id="tokenLimit"
                name="tokenLimit"
                type="number"
                min="1000"
                max="10000000"
                step="1000"
                disabled={tokenLimitPending}
                defaultValue={tokenLimitState?.data?.tokenLimit || aiTokenLimit}
                className={
                  tokenLimitState?.errors?.tokenLimit
                    ? "border-destructive"
                    : ""
                }
              />
              {tokenLimitState?.errors?.tokenLimit && (
                <p className="text-sm text-destructive">
                  {tokenLimitState.errors.tokenLimit.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Set the maximum number of AI tokens your organization can use
                per month
              </p>
            </div>

            <Button
              type="submit"
              disabled={tokenLimitPending}
              variant="outline"
            >
              {tokenLimitPending ? "Updating..." : "Update Token Limit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
