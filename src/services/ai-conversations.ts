import { AIConversationStatus, Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

/**
 * Message structure for conversation
 */
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

/**
 * Create a new AI conversation
 *
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param firstMessage - First user message (used to generate title)
 * @returns Created conversation
 *
 * @example
 * ```typescript
 * const conversation = await createConversation(
 *   "org_123",
 *   "user_456",
 *   "Will Apple stock reach $200 by Q1 2026?"
 * );
 * ```
 */
export async function createConversation(
  organizationId: string,
  userId: string,
  firstMessage: string
) {
  // Generate title from first message (max 60 chars with ellipsis)
  let title = firstMessage.trim();
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

  const initialMessages: ConversationMessage[] = [
    {
      role: "user",
      content: firstMessage,
      timestamp: new Date().toISOString(),
    },
  ];

  return await prisma.aIConversation.create({
    data: {
      organizationId,
      userId,
      title,
      messages: JSON.stringify(
        initialMessages
      ) as unknown as Prisma.InputJsonValue,
      status: AIConversationStatus.IN_PROGRESS,
      tokenCount: 0,
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

/**
 * Update conversation messages and token count
 *
 * @param conversationId - Conversation ID
 * @param messages - Full array of conversation messages
 * @param tokenCount - Total token count for conversation
 *
 * @example
 * ```typescript
 * await updateConversationMessages(
 *   "conv_123",
 *   [...existingMessages, newMessage],
 *   1500
 * );
 * ```
 */
export async function updateConversationMessages(
  conversationId: string,
  messages: ConversationMessage[],
  tokenCount: number
) {
  return await prisma.aIConversation.update({
    where: { id: conversationId },
    data: {
      messages: JSON.stringify(messages) as unknown as Prisma.InputJsonValue,
      tokenCount,
      updatedAt: new Date(),
    },
  });
}

/**
 * Complete a conversation by linking it to a created forecast
 *
 * @param conversationId - Conversation ID
 * @param forecastId - Created forecast ID
 *
 * @example
 * ```typescript
 * await completeConversation("conv_123", "forecast_789");
 * ```
 */
export async function completeConversation(
  conversationId: string,
  forecastId: string
) {
  return await prisma.aIConversation.update({
    where: { id: conversationId },
    data: {
      status: AIConversationStatus.COMPLETED,
      forecastId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark a conversation as abandoned
 *
 * @param conversationId - Conversation ID
 *
 * @example
 * ```typescript
 * await abandonConversation("conv_123");
 * ```
 */
export async function abandonConversation(conversationId: string) {
  return await prisma.aIConversation.update({
    where: { id: conversationId },
    data: {
      status: AIConversationStatus.ABANDONED,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get a conversation by ID with related data
 *
 * @param conversationId - Conversation ID
 * @returns Conversation with organization, user, and forecast data
 *
 * @example
 * ```typescript
 * const conversation = await getConversation("conv_123");
 * if (!conversation) {
 *   throw new Error("Conversation not found");
 * }
 * ```
 */
export async function getConversation(conversationId: string) {
  return await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      forecast: {
        select: {
          id: true,
          title: true,
          type: true,
          dueDate: true,
        },
      },
    },
  });
}

/**
 * List all conversations for a user
 *
 * @param userId - User ID
 * @returns Array of conversations ordered by creation date (newest first)
 *
 * @example
 * ```typescript
 * const conversations = await listUserConversations("user_456");
 * ```
 */
export async function listUserConversations(userId: string) {
  return await prisma.aIConversation.findMany({
    where: { userId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      forecast: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get conversation message count
 *
 * @param conversationId - Conversation ID
 * @returns Number of messages in conversation
 *
 * @example
 * ```typescript
 * const count = await getConversationMessageCount("conv_123");
 * ```
 */
export async function getConversationMessageCount(
  conversationId: string
): Promise<number> {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    select: { messages: true },
  });

  if (!conversation) {
    return 0;
  }

  const messages =
    typeof conversation.messages === "string"
      ? (JSON.parse(conversation.messages) as ConversationMessage[])
      : (conversation.messages as unknown as ConversationMessage[]);
  return messages.length;
}
