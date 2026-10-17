"use client";

import * as React from "react";
import Link from "next/link";
import {
  BotMessageSquare,
  Sparkles,
  Send,
  User,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { CitationChip } from "@/components/evidence/CitationChip";
import { MOCK_EVIDENCE_CLAIMS, MOCK_CITATIONS } from "@/mocks/evidence";
import { EvidenceClaim } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  claim?: EvidenceClaim;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    text: "Why was FalkorDB chosen over relational or other graph databases for Cerevia?",
    timestamp: "10:14 AM",
  },
  {
    id: "msg-2",
    sender: "assistant",
    text: "According to RFC-204 and Architecture Decision Record ADR-042, FalkorDB was chosen for three primary architectural reasons:\n\n1. Multi-hop traversal latency: Under 12k concurrent vector hybrid lookups, FalkorDB maintained sub-15ms p99 latency using Redis GraphBLAS linear algebra.\n2. Memory Footprint: Tenant memory consumption dropped from 140GB to 38GB per replica compared to Neo4j.\n3. Direct Integration: Unified Redis in-memory key-value and graph module integration simplified our deployment cluster.",
    timestamp: "10:14 AM",
    claim: MOCK_EVIDENCE_CLAIMS[0],
  },
];

export function AssistantView({ conversationId }: { conversationId?: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = React.useState("");
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);
  const [inspectedClaim, setInspectedClaim] = React.useState<EvidenceClaim | null>(MOCK_EVIDENCE_CLAIMS[0]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSynthesizing(true);

    // Simulate verified FalkorDB traversal & synthesis
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: `Cross-referencing organizational knowledge for "${text}":\n\nThe FalkorDB graph corroborates that the security and compliance policy enforces strict PII scrubbing across all Slack and Confluence ingestion pipelines prior to vector indexing. Verified in the latest SOC-2 Type II audit.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        claim: MOCK_EVIDENCE_CLAIMS[1],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setInspectedClaim(MOCK_EVIDENCE_CLAIMS[1]);
      setIsSynthesizing(false);
    }, 900);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Knowledge Assistant
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              Ground-Truth Verified
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conversational synthesis over verified documents, decisions, and FalkorDB knowledge graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/graph">
              Graph Explorer
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Suggested Prompts Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">Prompts:</span>
        {[
          "Why was FalkorDB selected over Neo4j?",
          "How is PII handled during Slack ingestion?",
          "What is the status of Project Synapse?",
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-2.5 py-1 rounded border border-border bg-card hover:bg-secondary text-foreground text-[11px] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat & Evidence Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Feed */}
        <div className="lg:col-span-2 flex flex-col h-[580px] rounded-md border border-border bg-card">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded bg-secondary text-primary border border-border">
                    <BotMessageSquare className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-md p-3.5 space-y-2.5 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-secondary/40 border border-border text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{msg.text}</div>

                  {msg.claim && (
                    <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.claim.citations.map((c) => (
                          <CitationChip key={c.id} citation={c} size="sm" />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] font-mono text-muted-foreground hover:text-foreground"
                        onClick={() => setInspectedClaim(msg.claim || null)}
                      >
                        Inspect Evidence
                      </Button>
                    </div>
                  )}

                  <div className="text-[10px] opacity-70 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded bg-secondary text-muted-foreground border border-border">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isSynthesizing && (
              <div className="flex gap-3 items-center text-xs text-muted-foreground p-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Traversing FalkorDB knowledge graph &amp; verifying evidence claims...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-border p-3 bg-secondary/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Cerevia Assistant about architecture, decisions, or people..."
                className="h-9 text-xs bg-background"
                disabled={isSynthesizing}
              />
              <Button type="submit" size="sm" className="h-9 px-3 gap-1.5" disabled={isSynthesizing || !inputText.trim()}>
                <Send className="h-3.5 w-3.5" />
                <span>Ask</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Evidence Panel Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Ground-Truth Verification
            </h3>
            {inspectedClaim && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {inspectedClaim.id}
              </Badge>
            )}
          </div>

          {inspectedClaim ? (
            <EvidencePanel claim={inspectedClaim} />
          ) : (
            <Card className="p-6 text-center text-xs text-muted-foreground">
              Click &quot;Inspect Evidence&quot; on any assistant message to review the backing FalkorDB evidence path.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
