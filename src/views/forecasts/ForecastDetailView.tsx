"use client";

import { deleteForecastAction as orgAdminDeleteAction } from "@/app/(protected)/(org-admin)/forecasts/[forecastId]/actions";
import { deleteForecastAction as superAdminDeleteAction } from "@/app/(protected)/(super-admin)/orgs/[orgId]/forecasts/[forecastId]/actions";
import EditForecastModal from "@/components/forecasts/EditForecastModal";
import SetActualValueDialog from "@/components/forecasts/SetActualValueDialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Router from "@/constants/router";
import { DataType, Forecast, ForecastType } from "@/generated/prisma";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ForecastWithOrg = Forecast & {
  organization: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
};

type ForecastDetailViewProps = {
  forecast: ForecastWithOrg;
  /** Whether this is for org admin context */
  isOrgAdmin?: boolean;
  /** Base path for forecast list (used for back button) */
  listPath?: string;
  /** Whether to show breadcrumbs (default: true for super admin, false for org admin) */
  showBreadcrumbs?: boolean;
  /** Available categories for the organization */
  categories?: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
};

const FORECAST_TYPE_LABELS: Record<ForecastType, string> = {
  BINARY: "Binary",
  CONTINUOUS: "Continuous",
  CATEGORICAL: "Categorical",
};

const FORECAST_TYPE_DESCRIPTIONS: Record<ForecastType, string> = {
  BINARY: "True/False outcomes",
  CONTINUOUS: "Numerical predictions",
  CATEGORICAL: "Multiple choice options",
};

const FORECAST_TYPE_COLORS: Record<
  ForecastType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  BINARY: "default",
  CONTINUOUS: "secondary",
  CATEGORICAL: "outline",
};

const DATA_TYPE_LABELS: Record<DataType, string> = {
  NUMBER: "Number",
  CURRENCY: "Currency",
  PERCENT: "Percent",
  DECIMAL: "Decimal",
  INTEGER: "Integer",
};

export default function ForecastDetailView({
  forecast,
  isOrgAdmin = false,
  listPath,
  showBreadcrumbs = true,
  categories = [],
}: ForecastDetailViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActualValueDialog, setShowActualValueDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine the list path for back button
  const effectiveListPath =
    listPath || Router.organizationForecasts(forecast.organizationId);

  const handleDelete = async () => {
    setIsDeleting(true);
    if (isOrgAdmin) {
      await orgAdminDeleteAction(forecast.id);
    } else {
      await superAdminDeleteAction(forecast.organizationId, forecast.id);
    }
    // Redirect happens in the action
  };

  const options =
    forecast.type === ForecastType.CATEGORICAL && forecast.options
      ? (forecast.options as string[])
      : [];

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb Navigation - only show for super admin */}
        {showBreadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={Router.ORGANIZATIONS}>
                  Organizations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={Router.organizationDetail(forecast.organizationId)}
                >
                  {forecast.organization.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={Router.organizationForecasts(forecast.organizationId)}
                >
                  Forecasts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{forecast.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={effectiveListPath}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {forecast.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={FORECAST_TYPE_COLORS[forecast.type]}
                  className="text-xs"
                >
                  {FORECAST_TYPE_LABELS[forecast.type]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  · {FORECAST_TYPE_DESCRIPTIONS[forecast.type]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowActualValueDialog(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {forecast.actualValue ? "Update" : "Set"} Actual Value
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Forecast
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Type
                  </dt>
                  <dd className="mt-1">
                    <Badge variant={FORECAST_TYPE_COLORS[forecast.type]}>
                      {FORECAST_TYPE_LABELS[forecast.type]}
                    </Badge>
                  </dd>
                </div>

                {forecast.type === ForecastType.CONTINUOUS &&
                  forecast.dataType && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Data Type
                      </dt>
                      <dd className="mt-1">
                        <Badge variant="outline">
                          {DATA_TYPE_LABELS[forecast.dataType]}
                        </Badge>
                      </dd>
                    </div>
                  )}

                {forecast.category && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Category
                    </dt>
                    <dd className="mt-1 flex items-center gap-2">
                      {forecast.category.color && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: forecast.category.color }}
                        />
                      )}
                      <span>{forecast.category.name}</span>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Due Date
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {format(
                      new Date(forecast.dueDate),
                      "MMMM d, yyyy 'at' h:mm a"
                    )}
                  </dd>
                </div>

                {forecast.dataReleaseDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Data Release Date
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {format(
                        new Date(forecast.dataReleaseDate),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Organization
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={Router.organizationDetail(forecast.organization.id)}
                      className="text-primary hover:underline"
                    >
                      {forecast.organization.name}
                    </Link>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm">
                    {format(
                      new Date(forecast.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm">
                    {format(
                      new Date(forecast.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </dd>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {forecast.description ? (
                  <p className="text-sm">{forecast.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Forecast Options Card */}
            {forecast.type === ForecastType.CATEGORICAL &&
              options.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      Categorical Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {forecast.type === ForecastType.BINARY && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    Binary Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">True</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium">False</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {forecast.type === ForecastType.CONTINUOUS && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    Continuous Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      📊 This forecast accepts any numerical value. Participants
                      can provide their predictions as numbers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Key Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Calendar className="h-3.5 w-3.5" />
                    Due Date
                  </div>
                  <p className="text-lg font-semibold">
                    {format(new Date(forecast.dueDate), "MMMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(forecast.dueDate), "EEEE 'at' h:mm a")}
                  </p>
                </div>

                <Separator />

                {forecast.dataReleaseDate ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      Release Date
                    </div>
                    <p className="text-lg font-semibold">
                      {format(
                        new Date(forecast.dataReleaseDate),
                        "MMMM d, yyyy"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(forecast.dataReleaseDate),
                        "EEEE 'at' h:mm a"
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      Release Date
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Not scheduled
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Building2 className="h-3.5 w-3.5" />
                    Organization
                  </div>
                  <Link
                    href={Router.organizationDetail(forecast.organization.id)}
                    className="text-sm font-medium text-primary hover:underline inline-block"
                  >
                    {forecast.organization.name}
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Clock className="h-3.5 w-3.5" />
                    Created
                  </div>
                  <p className="text-sm">
                    {format(new Date(forecast.createdAt), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    at {format(new Date(forecast.createdAt), "h:mm a")}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </div>
                  <p className="text-sm">
                    {format(new Date(forecast.updatedAt), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    at {format(new Date(forecast.updatedAt), "h:mm a")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Forecast</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{forecast.title}&quot;? This
              action cannot be undone and will remove all associated
              predictions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Forecast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Forecast Modal */}
      <EditForecastModal
        forecast={forecast}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        isOrgAdmin={isOrgAdmin}
      />

      {/* Set Actual Value Dialog */}
      <SetActualValueDialog
        forecastId={forecast.id}
        organizationId={forecast.organizationId}
        forecastType={forecast.type}
        forecastTitle={forecast.title}
        currentActualValue={forecast.actualValue}
        dueDate={forecast.dueDate}
        dataReleaseDate={forecast.dataReleaseDate}
        open={showActualValueDialog}
        onOpenChange={setShowActualValueDialog}
        isOrgAdmin={isOrgAdmin}
      />
    </>
  );
}
