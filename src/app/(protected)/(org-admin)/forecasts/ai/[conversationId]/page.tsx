import { requireOrgAdmin } from "@/lib/guards";
import { getConversation } from "@/services/ai-conversations";
import { getOrganizationById } from "@/services/organizations";
import AIChatView from "@/views/forecasts/ai/AIChatView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const session = await requireOrgAdmin();
  const { conversationId } = await params;

  // Get conversation
  const conversation = await getConversation(conversationId);

  if (!conversation) {
    notFound();
  }

  // Verify ownership
  if (conversation.userId !== session.user.id) {
    notFound();
  }

  // Get token usage for display
  const organization = await getOrganizationById(conversation.organizationId);

  return (
    <div className="container mx-auto py-6">
      <AIChatView
        conversationId={conversationId}
        readonly={conversation.status === "COMPLETED"}
        tokenUsage={{
          used: organization?.aiTokensUsedThisMonth || 0,
          limit: organization?.aiTokenLimit || 100000,
        }}
      />
    </div>
  );
}
