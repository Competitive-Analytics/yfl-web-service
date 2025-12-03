"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Router from "@/constants/router";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  createdAt: Date;
  updatedAt: Date;
  tokenCount: number;
  forecast?: {
    id: string;
    title: string;
    type: string;
  } | null;
  organization: {
    id: string;
    name: string;
  };
}

interface ConversationHistoryViewProps {
  conversations: Conversation[];
}

export default function ConversationHistoryView({
  conversations,
}: ConversationHistoryViewProps) {
  const router = useRouter();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start your first AI-powered forecast creation by clicking the button
          below.
        </p>
        <Button
          onClick={() => router.push(Router.ORG_ADMIN_AI_CREATE_FORECAST)}
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Create Forecast with AI
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Conversations</h2>
          <p className="text-muted-foreground">
            View and resume your forecast creation conversations
          </p>
        </div>
        <Button
          onClick={() => router.push(Router.ORG_ADMIN_AI_CREATE_FORECAST)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            onOpen={() =>
              router.push(Router.ORG_ADMIN_AI_CONVERSATION(conversation.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

function ConversationCard({
  conversation,
  onOpen,
}: {
  conversation: Conversation;
  onOpen: () => void;
}) {
  const statusConfig = getStatusConfig(conversation.status);

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onOpen}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">
                {conversation.title}
              </CardTitle>
            </div>
          </div>
          <Badge
            variant={
              statusConfig.variant as
                | "default"
                | "secondary"
                | "destructive"
                | "outline"
            }
            className={statusConfig.className}
          >
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Linked Forecast */}
        {conversation.forecast && (
          <div className="p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">
              Linked Forecast
            </p>
            <p className="text-sm font-medium line-clamp-1">
              {conversation.forecast.title}
            </p>
            <Badge variant="outline" className="mt-1 text-xs">
              {conversation.forecast.type}
            </Badge>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(conversation.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>{conversation.tokenCount.toLocaleString()} tokens</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant={
            conversation.status === "IN_PROGRESS" ? "default" : "outline"
          }
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {conversation.status === "IN_PROGRESS" ? "Resume" : "View"}
        </Button>
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: Conversation["status"]) {
  switch (status) {
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        variant: "default",
        className: "bg-blue-500 hover:bg-blue-600",
        icon: <MessageSquare className="h-3 w-3" />,
      };
    case "COMPLETED":
      return {
        label: "Completed",
        variant: "secondary",
        className: "bg-green-500 hover:bg-green-600 text-white",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "ABANDONED":
      return {
        label: "Abandoned",
        variant: "outline",
        className: "bg-gray-500 hover:bg-gray-600 text-white",
        icon: <XCircle className="h-3 w-3" />,
      };
    default:
      return {
        label: status,
        variant: "outline",
        className: "",
        icon: null,
      };
  }
}
