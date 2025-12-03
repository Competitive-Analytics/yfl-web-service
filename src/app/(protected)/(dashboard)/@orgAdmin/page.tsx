// src/app/(protected)/(org-admin)/dashboard/page.tsx
import Router from "@/constants/router";
import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/guards";
import { getCategories } from "@/services/categories";
import { getForecasts } from "@/services/forecasts";
import { getOrganizationLeaderboardWithSort } from "@/services/leaderboard";
import { getOrganizationById } from "@/services/organizations";
import OrgAdminDashboardView from "@/views/home/OrgAdminDashboardView";
import UnifiedLeaderboardView from "@/views/leaderboard/UnifiedLeaderboardView";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function OrgAdminDashboardPage({
  searchParams,
}: PageProps) {
  const session = await requireRole([Role.ORG_ADMIN]);

  if (!session.user.organizationId) {
    redirect(Router.UNAUTHORIZED);
  }

  const { sortBy = "accuracyRate", sortOrder = "desc" } = await searchParams;

  const organization = await getOrganizationById(session.user.organizationId);
  if (!organization) {
    redirect(Router.UNAUTHORIZED);
  }

  const leaderboardData = await getOrganizationLeaderboardWithSort({
    organizationId: session.user.organizationId,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const [forecastsResult, categoriesResult] = await Promise.all([
    getForecasts({
      organizationId: session.user.organizationId,
      limit: 100,
    }),
    getCategories({
      organizationId: session.user.organizationId,
      limit: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <OrgAdminDashboardView />
      <UnifiedLeaderboardView
        viewType="USER"
        data={leaderboardData}
        organizationName={organization.name}
        isOrgAdmin={true}
        forecasts={forecastsResult.forecasts.map((f) => ({
          id: f.id,
          title: f.title,
        }))}
        categories={categoriesResult.categories.map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </div>
  );
}
