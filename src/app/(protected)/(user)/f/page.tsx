// Upcoming forecasts page for users

import { auth } from "@/auth";
import Router from "@/constants/router";
import { getUpcomingForecastsForUser } from "@/services/forecasts";
import UpcomingForecastsTableView from "@/views/forecasts/UpcomingForecastsTableView";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function UserForecastsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect(Router.SIGN_IN);
  }

  // Verify user has an organization
  if (!session.user.organizationId) {
    redirect(Router.UNAUTHORIZED);
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "50", 10);

  // Get upcoming forecasts for the user's organization
  const result = await getUpcomingForecastsForUser({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    page,
    limit: pageSize,
  });

  return (
    <UpcomingForecastsTableView
      forecasts={result.forecasts}
      pagination={{
        page: result.page,
        pageSize: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      }}
    />
  );
}
