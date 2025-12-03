import { requireOrgAdmin } from "@/lib/guards";
import { listUserConversations } from "@/services/ai-conversations";
import ConversationHistoryView from "@/views/forecasts/ai/ConversationHistoryView";

export default async function AIConversationsPage() {
  const session = await requireOrgAdmin();
  const userId = session.user.id;

  const conversations = await listUserConversations(userId);

  return (
    <div className="container mx-auto py-6">
      <ConversationHistoryView conversations={conversations} />
    </div>
  );
}
