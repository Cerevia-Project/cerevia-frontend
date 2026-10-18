"use client";

import * as React from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SampleDataBadge } from "@/components/feedback/SampleDataBadge";
import { formatRelativeTime } from "@/lib/formatters";
import { errorMessage } from "@/api/errors";
import { useConversations, useDeleteConversation } from "@/features/assistant/api";

export interface ThreadListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isCreating?: boolean;
}

export function ThreadList({ activeId, onSelect, onNew, isCreating }: ThreadListProps) {
  const conversations = useConversations();
  const remove = useDeleteConversation();

  return (
    <aside aria-label="Conversation threads" className="flex h-full flex-col rounded-md border border-border bg-card">
      <div className="border-b border-border p-2">
        <Button size="sm" className="h-8 w-full gap-1.5 text-xs" onClick={onNew} disabled={isCreating}>
          <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
          {isCreating ? "Creating…" : "New thread"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : conversations.isError ? (
          <p className="p-2 text-[11px] text-muted-foreground">
            {errorMessage(conversations.error)}
          </p>
        ) : conversations.data.items.length === 0 ? (
          <p className="p-2 text-[11px] text-muted-foreground">
            No threads yet. Ask a question to start one.
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.data.items.map((conversation) => (
              <li key={conversation.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={conversation.id === activeId ? "true" : undefined}
                  className={`w-full cursor-pointer rounded-md p-2 pr-8 text-left transition-colors ${
                    conversation.id === activeId
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium">{conversation.title}</span>
                    {conversation.isSampleData && <SampleDataBadge />}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                    {formatRelativeTime(conversation.createdAt)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete thread ${conversation.title}`}
                  className="absolute right-1 top-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => remove.mutate(conversation.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
