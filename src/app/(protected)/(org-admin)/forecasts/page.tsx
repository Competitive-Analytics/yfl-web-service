// Forecasts for org admin's organization

import Router from "@/constants/router";
import { ForecastType, Role } from "@/generated/prisma";
import { requireRole } from "@/lib/guards";
import { getCategories } from "@/services/categories";
import { getForecasts } from "@/services/forecasts";
import { getOrganizationById } from "@/services/organizations";
import ForecastListView from "@/views/forecasts/ForecastListView";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function ForecastsPage({ searchParams }: PageProps) {
  // Verify user is an org admin
  const session = await requireRole([Role.ORG_ADMIN]);

  // Org admins must have an organizationId
  if (!session.user.organizationId) {
    redirect(Router.UNAUTHORIZED);
  }

  const {
    page = "1",
    pageSize = "50",
    search,
    type,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = await searchParams;

  // Get org admin's organization
  const organization = await getOrganizationById(session.user.organizationId);
  if (!organization) {
    notFound();
  }

  const pageNum = parseInt(page, 10);
  const pageSizeNum = parseInt(pageSize, 10);
  const forecastType = type ? (type as ForecastType) : undefined;

  // Fetch forecasts and categories for this organization
  const [result, categoriesResult] = await Promise.all([
    getForecasts({
      organizationId: session.user.organizationId,
      page: pageNum,
      limit: pageSizeNum,
      search,
      type: forecastType,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }),
    getCategories({ organizationId: session.user.organizationId }),
  ]);

  return (
    <ForecastListView
      forecasts={result.forecasts}
      pagination={{
        page: result.page,
        pageSize: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      }}
      orgId={session.user.organizationId}
      orgName={organization.name}
      basePath={Router.ORG_ADMIN_FORECASTS}
      showBreadcrumbs={false}
      isOrgAdmin={true}
      categories={categoriesResult.categories}
    />
  );
}
