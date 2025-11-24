import { auth } from "@/auth";
import { getGroupLeaderboardWithSort } from "@/services/leaderboard";
import { getOrganizationByIdMinimal } from "@/services/organizations";
import GroupLeaderboardView from "@/views/leaderboard/GroupLeaderboardView";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function GroupLeaderboardPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/settings");
  }

  const params = await searchParams;

  const [entries, organization] = await Promise.all([
    getGroupLeaderboardWithSort({
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
    }),
    getOrganizationByIdMinimal(session.user.organizationId),
  ]);

  return (
    <GroupLeaderboardView
      data={entries}
      organizationName={organization?.name || "Your Organization"}
    />
  );
}

