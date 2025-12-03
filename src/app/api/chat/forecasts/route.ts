import { auth } from "@/auth";
import { FORECAST_AGENT_SYSTEM_PROMPT } from "@/constants/ai-prompts";
import { createOrgOpenAIClient } from "@/lib/openai-client";
import {
  ConversationMessage,
  createConversation,
  getConversation,
  updateConversationMessages,
} from "@/services/ai-conversations";
import {
  createForecastTool,
  findOrCreateCategorySchema,
  findOrCreateCategoryTool,
  validateForecastDraftSchema,
  validateForecastDraftTool,
} from "@/services/ai-forecast-tools";
import {
  checkTokenLimit,
  incrementAiTokenUsage,
} from "@/services/organizations";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

/**
 * POST /api/chat/forecasts
 *
 * Streaming chat endpoint for AI-powered forecast creation
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify organization
    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return Response.json(
        { error: "No organization associated with user" },
        { status: 403 }
      );
    }

    // 3. Check token limit (stop immediately if exceeded)
    try {
      await checkTokenLimit(organizationId);
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Monthly AI token limit exceeded",
        },
        { status: 429 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // 5. Get or create conversation
    let currentConversationId = conversationId;
    let conversation;

    if (conversationId) {
      // Load existing conversation
      conversation = await getConversation(conversationId);
      if (!conversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (conversation.userId !== session.user.id) {
        return Response.json(
          { error: "Conversation does not belong to user" },
          { status: 403 }
        );
      }

      // Check if conversation is already completed
      if (conversation.status === "COMPLETED") {
        return Response.json(
          {
            error:
              "Conversation is already completed. Start a new conversation to create another forecast.",
          },
          { status: 400 }
        );
      }
    } else {
      // Create new conversation
      const firstUserMessage = messages.find(
        (m: { role: string; content: string }) => m.role === "user"
      );
      if (!firstUserMessage) {
        return Response.json(
          { error: "First message must be from user" },
          { status: 400 }
        );
      }

      conversation = await createConversation(
        organizationId,
        session.user.id,
        firstUserMessage.content
      );
      currentConversationId = conversation.id;
    }

    // 6. Create OpenAI client
    let openai;
    try {
      openai = await createOrgOpenAIClient(organizationId);
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize AI client",
        },
        { status: 500 }
      );
    }

    // 7. Set up tools
    const tools = {
      findOrCreateCategory: {
        description:
          "Find an existing category by name (case-insensitive) or create a new one if it doesn't exist. Call this when you've inferred a category from the forecast topic.",
        inputSchema: findOrCreateCategorySchema,
        execute: async (params: z.infer<typeof findOrCreateCategorySchema>) => {
          const result = await findOrCreateCategoryTool(
            organizationId,
            params.name
          );
          return {
            id: result.id,
            name: result.name,
            message: result.wasCreated
              ? `✓ Created new category: "${result.name}"`
              : `✓ Using existing category: "${result.name}"`,
          };
        },
      },

      validateForecastDraft: {
        description:
          "Validate a forecast draft against business rules before asking for user confirmation. Call this before presenting the forecast summary to the user.",
        inputSchema: validateForecastDraftSchema,
        execute: async (
          params: z.infer<typeof validateForecastDraftSchema>
        ) => {
          const result = await validateForecastDraftTool(
            organizationId,
            params as Parameters<typeof validateForecastDraftTool>[1]
          );

          if (result.valid) {
            return {
              valid: true,
              message: "✓ Forecast validated successfully",
              categoryId: result.categoryId,
            };
          } else {
            return {
              valid: false,
              message: "⚠️ Validation errors found",
              errors: result.errors,
            };
          }
        },
      },

      createForecast: {
        description:
          "Create the forecast in the database. ONLY call this after the user has explicitly confirmed they want to create the forecast (e.g., they said 'yes', 'create it', 'go ahead', etc.).",
        inputSchema: validateForecastDraftSchema,
        execute: async (
          params: z.infer<typeof validateForecastDraftSchema>
        ) => {
          const result = await createForecastTool(
            organizationId,
            currentConversationId!,
            params as Parameters<typeof createForecastTool>[2]
          );

          if (result.success) {
            return {
              success: true,
              message: `✓ Forecast "${result.title}" created successfully!`,
              forecastId: result.forecastId,
            };
          } else {
            return {
              success: false,
              message: `⚠️ Failed to create forecast: ${result.error}`,
              errors: result.errors,
            };
          }
        },
      },
    };

    // 8. Stream response
    const result = streamText({
      model: openai.chat("gpt-4-turbo"),
      system: FORECAST_AGENT_SYSTEM_PROMPT,
      messages,
      tools,
      onFinish: async ({ usage, response }) => {
        // Update conversation with new messages and token count
        const existingMessages =
          typeof conversation!.messages === "string"
            ? (JSON.parse(conversation!.messages) as ConversationMessage[])
            : (conversation!.messages as unknown as ConversationMessage[]);

        const updatedMessages: ConversationMessage[] = [
          ...existingMessages,
          ...messages.slice(-1), // Add latest user message
          {
            role: "assistant",
            content: response.messages
              .filter((m) => m.role === "assistant")
              .map((m) => m.content)
              .join("\n"),
            timestamp: new Date().toISOString(),
          },
        ];

        await updateConversationMessages(
          currentConversationId!,
          updatedMessages,
          (conversation!.tokenCount || 0) + (usage?.totalTokens || 0)
        );

        // Increment organization token usage
        if (usage?.totalTokens) {
          await incrementAiTokenUsage(organizationId, usage.totalTokens);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Conversation-Id": currentConversationId!,
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
