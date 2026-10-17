"use client";

import * as React from "react";
import Link from "next/link";
import { BotMessageSquare, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { EvidenceClaim } from "@/types";

const ASSISTANT_SAMPLE_CLAIM: EvidenceClaim = {
  id: "CLM-AST-104",
  claim: "Cerevia Knowledge Graph maps all engineering decisions to their backing RFCs and author teams.",
  state: "confirmed",
  confidenceScore: 96,
  rationale: "Synthesized from architecture documentation and validated against the FalkorDB schema graph.",
  citations: [
    {
      id: "cit-ast-1",
      code: "ADR-104",
      label: "FalkorDB Architecture Decision",
      documentTitle: "Architecture Decision: Graph Store Selection",
      sourceType: "confluence",
    },
  ],
  graphPath: ["Decision", "backedBy", "RFC", "authoredBy", "Team"],
};

export default function AssistantPage() {
  const [prompt, setPrompt] = React.useState("");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Knowledge Assistant
            </h1>
            <Badge variant="default" className="text-[10px]">
              Beta
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ask conversational questions across your organization&apos;s verified memory, documents, and FalkorDB knowledge graph.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/graph">Open Graph View</Link>
        </Button>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          "Why was FalkorDB chosen over relational databases for knowledge queries?",
          "Show me all active decisions made by Team Infrastructure in Q3.",
          "What contradictory evidence exists regarding project Apollo deadlines?",
          "Trace the relationship between Dr. Vance and RFC-88.",
        ].map((samplePrompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(samplePrompt)}
            className="p-3 rounded-lg border border-border bg-card hover:border-primary/40 text-left text-xs transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-primary transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {samplePrompt}
            </span>
          </button>
        ))}
      </div>

      {/* Sample Synthesized Assistant Response */}
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BotMessageSquare className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm">Cerevia Assistant</CardTitle>
              <CardDescription className="text-[11px]">
                Ground truth verified via FalkorDB graph traversal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs leading-relaxed text-foreground">
            Based on organizational records in Confluence and Architecture Decision Records,{" "}
            <strong>FalkorDB</strong> was selected as Cerevia&apos;s primary knowledge graph database. Multi-hop traversal latency remained sub-12ms across 50,000 nodes, significantly outperforming previous relational schema benchmarks.
          </p>

          <EvidencePanel claim={ASSISTANT_SAMPLE_CLAIM} />
        </CardContent>
      </Card>

      {/* Prompt Input Box */}
      <div className="p-2 rounded-xl border border-border bg-card shadow-lg flex items-center gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Cerevia a knowledge question (e.g. 'Trace decisions for Project Apollo')..."
          className="border-0 shadow-none focus-visible:ring-0 text-xs h-10"
        />
        <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
          Ask
        </Button>
      </div>
    </div>
  );
}
