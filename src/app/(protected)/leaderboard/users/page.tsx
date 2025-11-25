import { auth } from "@/auth";
import { getCategories } from "@/services/categories";
import { getForecasts } from "@/services/forecasts";
import { getOrganizationLeaderboardWithSort } from "@/services/leaderboard";
import { getOrganizationByIdMinimal } from "@/services/organizations";
import UnifiedLeaderboardView from "@/views/leaderboard/UnifiedLeaderboardView";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function UsersLeaderboardPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/unauthorized");
  }

  if (!session.user.organizationId) {
    redirect("/settings");
  }

  const params = await searchParams;

  const leaderboardData = await getOrganizationLeaderboardWithSort({
    organizationId: session.user.organizationId,
    sortBy: (params.sortBy as string) || "accuracyRate",
    sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    forecastIds: params.forecastIds as string | undefined,
    categoryIds: params.categoryIds as string | undefined,
    forecastTypes: params.forecastTypes as string | undefined,
    recentCount: params.recentCount ? Number(params.recentCount) : undefined,
    minForecasts: params.minForecasts ? Number(params.minForecasts) : undefined,
    dateFrom: params.dateFrom as string | undefined,
    dateTo: params.dateTo as string | undefined,
  });

  const [forecasts, categories, organization] = await Promise.all([
    getForecasts({ organizationId: session.user.organizationId }),
    getCategories({ organizationId: session.user.organizationId }),
    getOrganizationByIdMinimal(session.user.organizationId),
  ]);

  return (
    <UnifiedLeaderboardView
      viewType="USER"
      data={leaderboardData}
      organizationName={organization?.name || "Your Organization"}
      isOrgAdmin={true}
      currentUserId={session.user.id}
      forecasts={forecasts.forecasts.map(
        (f: { id: string; title: string }) => ({ id: f.id, title: f.title })
      )}
      categories={categories.categories.map(
        (c: { id: string; name: string }) => ({ id: c.id, name: c.name })
      )}
    />
  );
}
