// Forecast details for end users

import { auth } from "@/auth";
import Router from "@/constants/router";
import { getForecastById } from "@/services/forecasts";
import { getUserGroup } from "@/services/groups";
import {
  getGroupPredictionForForecast,
  getUserPredictionForForecast,
} from "@/services/predictions";
import UserForecastDetailView from "@/views/forecasts/UserForecastDetailView";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ forecastId: string }>;
};

export default async function UserForecastDetailPage({ params }: PageProps) {
  const session = await auth();
  const { forecastId } = await params;

  if (!session) {
    redirect(Router.SIGN_IN);
  }

  // Get the forecast
  const forecast = await getForecastById(forecastId);

  if (!forecast) {
    notFound();
  }

  // Verify the forecast belongs to the user's organization
  if (forecast.organizationId !== session.user.organizationId) {
    notFound();
  }

  // Get the user's individual prediction and group context in parallel
  const [existingPrediction, userGroup] = await Promise.all([
    getUserPredictionForForecast(session.user.id, forecastId),
    session.user.organizationId
      ? getUserGroup(session.user.id, session.user.organizationId)
      : Promise.resolve(null),
  ]);

  const groupPrediction =
    userGroup && (await getGroupPredictionForForecast(userGroup.id, forecastId));

  const activePrediction = existingPrediction ?? groupPrediction;
  const isGroupPrediction = Boolean(!existingPrediction && groupPrediction);

  const groupContext = userGroup
    ? {
        id: userGroup.id,
        name: userGroup.name,
        members: userGroup.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
        })),
      }
    : null;

  const canSubmitIndividual =
    !!existingPrediction || (!groupPrediction && !isGroupPrediction);
  const canSubmitGroup =
    !!userGroup && (!!groupPrediction ? isGroupPrediction : true);

  const defaultSubmissionType = isGroupPrediction
    ? "GROUP"
    : existingPrediction
    ? "INDIVIDUAL"
    : canSubmitIndividual
    ? "INDIVIDUAL"
    : "GROUP";

  return (
    <UserForecastDetailView
      forecast={forecast}
      prediction={
        activePrediction
          ? {
              ...activePrediction,
              isGroupPrediction,
              submittedBy: activePrediction.user
                ? {
                    id: activePrediction.user.id,
                    name: activePrediction.user.name,
                    email: activePrediction.user.email,
                  }
                : undefined,
            }
          : null
      }
      groupContext={groupContext}
      submissionOptions={{
        canSubmitIndividual,
        canSubmitGroup,
        defaultType: defaultSubmissionType,
        lockedType: activePrediction
          ? isGroupPrediction
            ? "GROUP"
            : "INDIVIDUAL"
          : undefined,
      }}
    />
  );
}
