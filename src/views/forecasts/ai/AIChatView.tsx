"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Router from "@/constants/router";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface AIChatViewProps {
  conversationId: string | null;
  readonly?: boolean;
  tokenUsage?: {
    used: number;
    limit: number;
  };
}

interface ForecastPreview {
  title: string;
  type: string;
  dataType?: string;
  dueDate: string;
  dataReleaseDate: string;
  category: string;
  description?: string;
}

interface ToolInvocation {
  state: "call" | "result" | "error";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: {
    message?: string;
    forecastId?: string;
    valid?: boolean;
    [key: string]: unknown;
  };
}

export default function AIChatView({
  conversationId,
  readonly = false,
  tokenUsage,
}: AIChatViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [forecastCreated, setForecastCreated] = useState(false);
  const [createdForecastId, setCreatedForecastId] = useState<string | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // Extract forecast preview from messages
  const forecastPreview = extractForecastPreview(messages);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        toolInvocations: [],
      };

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text-delta") {
                assistantMessage.content += data.textDelta;
              } else if (data.type === "tool-call") {
                assistantMessage.toolInvocations?.push({
                  state: "call",
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.args,
                });
              } else if (data.type === "tool-result") {
                const toolCall = assistantMessage.toolInvocations?.find(
                  (t) => t.toolCallId === data.toolCallId
                );
                if (toolCall) {
                  toolCall.state = "result";
                  toolCall.result = data.result;
                }
              }
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg?.role === "assistant") {
                  updated[updated.length - 1] = { ...assistantMessage };
                } else {
                  updated.push({ ...assistantMessage });
                }
                return updated;
              });
            } catch (e) {
              console.error("Failed to parse chunk:", e);
            }
          }
        }
      }

      // Check for forecast creation
      if (
        assistantMessage.content.includes("✓ Forecast") &&
        assistantMessage.content.includes("created successfully")
      ) {
        setForecastCreated(true);
        const createTool = assistantMessage.toolInvocations?.find(
          (t) => t.toolName === "createForecast" && t.state === "result"
        );
        if (createTool?.result?.forecastId) {
          setCreatedForecastId(createTool.result.forecastId as string);
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg?.role === "assistant") {
          updated[updated.length - 1] = assistantMessage;
        } else {
          updated.push(assistantMessage);
        }
        return updated;
      });
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">AI Forecast Assistant</h2>
        </div>
        {tokenUsage && (
          <Badge variant="outline" className="gap-2">
            <span className="text-xs">
              {tokenUsage.used.toLocaleString()} /{" "}
              {tokenUsage.limit.toLocaleString()} tokens
            </span>
          </Badge>
        )}
      </div>

      {/* Messages Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 text-primary/50" />
              <p className="text-lg font-medium mb-2">
                Start a conversation to create a forecast
              </p>
              <p className="text-sm max-w-md">
                Describe what you want to forecast, and I&apos;ll guide you
                through the process. I can create yes/no (binary) or numeric
                (continuous) forecasts.
              </p>
            </div>
          )}

          {messages.map((message: ChatMessage, index: number) => (
            <div key={index}>
              {message.role === "user" ? (
                <UserMessage content={message.content} />
              ) : (
                <AssistantMessage
                  content={message.content}
                  toolInvocations={message.toolInvocations}
                />
              )}
            </div>
          ))}

          {/* Forecast Preview Card */}
          {forecastPreview && !forecastCreated && (
            <ForecastPreviewCard preview={forecastPreview} />
          )}

          {/* Success Message */}
          {forecastCreated && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900 dark:text-green-100">
                    Forecast Created Successfully!
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your forecast has been created and is now available for
                  predictions.
                </p>
                <div className="flex gap-2">
                  {createdForecastId && (
                    <Button
                      onClick={() =>
                        router.push(
                          Router.orgAdminForecastDetail(createdForecastId)
                        )
                      }
                      size="sm"
                    >
                      View Forecast
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      router.push(Router.ORG_ADMIN_AI_CREATE_FORECAST)
                    }
                    variant="outline"
                    size="sm"
                  >
                    Start New Forecast
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        {!readonly && !forecastCreated && (
          <div className="border-t p-4">
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80">{error.message}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the forecast you want to create..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}

// Helper Components
function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  toolInvocations,
}: {
  content: string;
  toolInvocations?: ToolInvocation[];
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2">
        {/* Tool Invocations */}
        {toolInvocations?.map((tool, index) => (
          <ToolInvocationDisplay key={index} tool={tool} />
        ))}

        {/* Message Content */}
        {content && (
          <div className="bg-muted rounded-lg px-4 py-2">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolInvocationDisplay({ tool }: { tool: ToolInvocation }) {
  if (tool.state === "call") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-1.5">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>
          🔧 {tool.toolName === "findOrCreateCategory" && "Finding category..."}
          {tool.toolName === "validateForecastDraft" &&
            "Validating forecast..."}
          {tool.toolName === "createForecast" && "Creating forecast..."}
        </span>
      </div>
    );
  }

  if (tool.state === "result") {
    const result = tool.result;
    if (!result) return null;

    return (
      <div className="flex items-center gap-2 text-xs bg-muted/50 rounded px-3 py-1.5">
        {result.message && (
          <span className="text-muted-foreground">{result.message}</span>
        )}
      </div>
    );
  }

  return null;
}

function ForecastPreviewCard({ preview }: { preview: ForecastPreview }) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Forecast Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <p className="text-sm font-medium">{preview.title}</p>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Type
            </label>
            <div className="mt-1">
              <Badge variant="outline">{preview.type}</Badge>
            </div>
          </div>
          {preview.dataType && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Data Type
              </label>
              <div className="mt-1">
                <Badge variant="secondary">{preview.dataType}</Badge>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Due Date
            </label>
            <p className="text-sm">{formatDate(preview.dueDate)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Data Release Date
            </label>
            <p className="text-sm">{formatDate(preview.dataReleaseDate)}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Category
          </label>
          <div className="mt-1">
            <Badge>{preview.category}</Badge>
          </div>
        </div>

        {preview.description && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <p className="text-sm text-muted-foreground">
              {preview.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Functions
function extractForecastPreview(
  messages: ChatMessage[]
): ForecastPreview | null {
  // Look for validation tool calls in recent messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "assistant" && message.toolInvocations) {
      const validateCall = message.toolInvocations.find(
        (call) =>
          call.toolName === "validateForecastDraft" &&
          call.state === "result" &&
          call.result?.valid
      );

      if (validateCall) {
        const args = validateCall.args;
        return {
          title: args.title as string,
          type: args.type as string,
          dataType: args.dataType as string | undefined,
          dueDate: args.dueDate as string,
          dataReleaseDate: args.dataReleaseDate as string,
          category: args.categoryName as string,
          description: args.description as string | undefined,
        };
      }
    }
  }

  return null;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
