import { requireOrgAdmin } from "@/lib/guards";
import { getOrganizationById } from "@/services/organizations";
import AIChatView from "@/views/forecasts/ai/AIChatView";

export default async function AICreateForecastPage() {
  const session = await requireOrgAdmin();
  const organizationId = session.user.organizationId!;

  // Get token usage for display
  const organization = await getOrganizationById(organizationId);

  return (
    <div className="container mx-auto py-6">
      <AIChatView
        conversationId={null}
        tokenUsage={{
          used: organization?.aiTokensUsedThisMonth || 0,
          limit: organization?.aiTokenLimit || 100000,
        }}
      />
    </div>
  );
}
