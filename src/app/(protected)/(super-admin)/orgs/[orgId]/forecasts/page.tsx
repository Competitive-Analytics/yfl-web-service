// Forecasts for a specific organization for Super Admin

import { ForecastType } from "@/generated/prisma";
import { getCategories } from "@/services/categories";
import { getForecasts } from "@/services/forecasts";
import { getOrganizationById } from "@/services/organizations";
import ForecastListView from "@/views/forecasts/ForecastListView";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function OrgsForecastsPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const {
    page = "1",
    pageSize = "50",
    search,
    type,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = await searchParams;

  const organization = await getOrganizationById(orgId);
  if (!organization) {
    notFound();
  }

  const pageNum = parseInt(page, 10);
  const pageSizeNum = parseInt(pageSize, 10);
  const forecastType = type ? (type as ForecastType) : undefined;

  // Fetch forecasts and categories for this organization
  const [result, categoriesResult] = await Promise.all([
    getForecasts({
      organizationId: orgId,
      page: pageNum,
      limit: pageSizeNum,
      search,
      type: forecastType,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }),
    getCategories({ organizationId: orgId }),
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
      orgId={orgId}
      orgName={organization.name}
      categories={categoriesResult.categories}
    />
  );
}
