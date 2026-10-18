"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BotMessageSquare,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Square,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessLimitedNotice, InsufficientEvidence } from "@/components/feedback";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { SourcePreview } from "@/components/evidence/SourcePreview";
import { AnswerText } from "@/features/assistant/AnswerText";
import { ThreadList } from "@/features/assistant/ThreadList";
import { EvidenceGraphPanel } from "@/features/assistant/EvidenceGraphPanel";
import {
  STAGE_LABELS,
  useAssistantStream,
  useConversation,
  useCreateConversation,
  useMessageFeedback,
  useRetrievalTrace,
  type StreamedAnswer,
} from "@/features/assistant/api";
import { useCreateProposal } from "@/features/actions/api";
import { isDevTraceEnabled } from "@/lib/flags";
import { errorMessage } from "@/api/errors";
import type { Citation, Message, ProposalKind } from "@/api/types";

export interface AssistantViewProps {
  conversationId?: string;
}

/**
 * The assistant workspace: threads on the left, the conversation in the
 * middle, evidence and reasoning on the right.
 */
export function AssistantView({ conversationId }: AssistantViewProps) {
  const router = useRouter();
  const [activeId, setActiveId] = React.useState<string | null>(conversationId ?? null);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [previewCitation, setPreviewCitation] = React.useState<Citation | null>(null);
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Navigating to another thread's URL switches the active thread. This is a
  // derivation of the route, so it is adjusted during render.
  const [routeId, setRouteId] = React.useState(conversationId);
  if (conversationId !== routeId) {
    setRouteId(conversationId);
    if (conversationId) setActiveId(conversationId);
  }

  const conversation = useConversation(activeId);
  const createConversation = useCreateConversation();
  const { answer, ask, stop, reset, isBusy } = useAssistantStream();

  const openThread = (id: string) => {
    reset();
    setActiveId(id);
    router.push(`/assistant/${id}`);
  };

  const startThread = async () => {
    const created = await createConversation.mutateAsync({});
    openThread(created.id);
    return created.id;
  };

  const submit = async (text: string) => {
    const question = text.trim();
    if (!question || isBusy) return;

    setDraft("");
    let threadId = activeId;
    if (!threadId) {
      // The first question creates its own thread. The address bar is updated
      // directly rather than through the router: `/assistant` and
      // `/assistant/[id]` are different route segments, so navigating here
      // would unmount this view and discard the answer streaming into it.
      const created = await createConversation.mutateAsync({ title: question.slice(0, 60) });
      threadId = created.id;
      setActiveId(threadId);
      window.history.replaceState(null, "", `/assistant/${threadId}`);
    }
    await ask(threadId, question);
  };

  // Messages already stored, minus the assistant message currently streaming.
  const storedMessages: Message[] = (conversation.data?.messages ?? []).filter(
    (message) => message.id !== answer.messageId,
  );

  // The question is echoed locally so it appears before the server has stored
  // it. Once the stored thread contains it, the echo would be a duplicate.
  // Keep the newest content in view as the answer streams in.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [answer.text, answer.phase, answer.claims.length, conversation.data?.messages.length]);

  const questionIsStored = storedMessages.some(
    (message) => message.role === "user" && message.text === answer.question,
  );

  return (
    <div className="grid h-[calc(100vh-11rem)] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_340px]">
      <div className="hidden min-h-0 lg:block">
        <ThreadList
          activeId={activeId}
          onSelect={openThread}
          onNew={() => void startThread()}
          isCreating={createConversation.isPending}
        />
      </div>

      <section
        aria-label="Conversation"
        className="flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border p-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">
              {conversation.data?.title ?? "AI assistant"}
            </h1>
            <ScopeChip
              projectId={conversation.data?.scope?.projectId}
              onReset={() => void startThread()}
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label={panelOpen ? "Hide the evidence panel" : "Show the evidence panel"}
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {activeId && conversation.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-2/3 rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          ) : storedMessages.length === 0 && answer.phase === "idle" ? (
            <EmptyConversation onPick={(question) => void submit(question)} />
          ) : (
            storedMessages.map((message) => <StoredMessage key={message.id} message={message} />)
          )}

          {answer.phase !== "idle" && (
            <LiveAnswer
              answer={answer}
              showQuestion={!questionIsStored}
              onOpenCitation={setPreviewCitation}
              onFollowUp={(question) => void submit(question)}
            />
          )}
        </div>

        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={() => void submit(draft)}
          onStop={stop}
          isBusy={isBusy}
        />
      </section>

      <div className={panelOpen ? "min-h-0" : "hidden min-h-0 xl:block"}>
        <EvidenceGraphPanel
          claims={answer.claims}
          citations={answer.citations}
          paths={answer.paths}
          conflicts={answer.conflicts}
          relatedEntities={answer.relatedEntities}
          subgraph={answer.subgraph}
          accessLimited={answer.accessLimited}
          messageId={answer.messageId}
          onOpenCitation={setPreviewCitation}
        />
      </div>

      <SourcePreview
        citation={previewCitation}
        open={Boolean(previewCitation)}
        onOpenChange={(open) => !open && setPreviewCitation(null)}
      />
    </div>
  );
}

/* ── Conversation pieces ───────────────────────────────────────────────── */

function ScopeChip({ projectId, onReset }: { projectId?: string; onReset: () => void }) {
  if (!projectId) return null;
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
      Scope: project <span className="font-mono text-foreground">{projectId}</span>
      <button
        type="button"
        onClick={onReset}
        className="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-accent"
        aria-label="Start an unscoped thread"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function EmptyConversation({ onPick }: { onPick: (question: string) => void }) {
  const starters = [
    "Why is our product launch delayed?",
    "Which decision is relevant to the payments work, and why was it made?",
    "Who knows most about our ingestion pipeline?",
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <BotMessageSquare className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      <div>
        <h2 className="text-sm font-semibold text-foreground">Ask about this organization</h2>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Answers are assembled from your documents and the relationships between them. Every
          statement carries the evidence behind it.
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {starters.map((starter) => (
          <li key={starter}>
            <button
              type="button"
              onClick={() => onPick(starter)}
              className="cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
            >
              {starter}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoredMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.text}</p>
      <MessageFeedback messageId={message.id} />
    </div>
  );
}

function LiveAnswer({
  answer,
  showQuestion,
  onOpenCitation,
  onFollowUp,
}: {
  answer: StreamedAnswer;
  showQuestion: boolean;
  onOpenCitation: (citation: Citation) => void;
  onFollowUp: (question: string) => void;
}) {
  const createProposal = useCreateProposal();
  const router = useRouter();

  return (
    <div className="space-y-3">
      {showQuestion && answer.question && (
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
            {answer.question}
          </p>
        </div>
      )}

      {answer.stage && (
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          {STAGE_LABELS[answer.stage] ?? "Working…"}
        </p>
      )}

      {answer.reconnectAttempt > 0 && answer.phase === "streaming" && (
        <p className="text-[11px] text-muted-foreground">
          Connection interrupted; reconnecting (attempt {answer.reconnectAttempt})…
        </p>
      )}

      {/* Streamed text is announced politely rather than on every delta. */}
      <div aria-live="polite" aria-atomic="false">
        {answer.text && (
          <AnswerText
            text={answer.text}
            citations={answer.citations}
            onOpenCitation={onOpenCitation}
          />
        )}
      </div>

      {answer.accessLimited && <AccessLimitedNotice />}

      {answer.answerStatus === "insufficient_evidence" && (
        <InsufficientEvidence
          known={answer.claims.filter((claim) => claim.kind === "confirmed").map((claim) => claim.text)}
          missing={answer.claims.filter((claim) => claim.kind === "missing").map((claim) => claim.text)}
          nextSteps={answer.followUps}
          onNextStep={onFollowUp}
        />
      )}

      {answer.answerStatus === "partial" && (
        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-amber-500" aria-hidden="true" />
          This answer is partial: not every part of the question could be evidenced.
        </p>
      )}

      {answer.claims.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {answer.claims.map((claim) => (
            <EvidenceBadge key={claim.id} kind={claim.kind} size="sm" />
          ))}
        </div>
      )}

      {answer.phase === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-[var(--destructive-border)] bg-[var(--destructive-subtle)] p-3"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-foreground">
              The assistant could not finish this answer
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {answer.error ? errorMessage(answer.error) : "Try asking again."} The rest of the
              workspace still works.
            </p>
          </div>
        </div>
      )}

      {answer.followUps.length > 0 && answer.answerStatus !== "insufficient_evidence" && (
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Follow-ups
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {answer.followUps.map((followUp) => (
              <li key={followUp}>
                <button
                  type="button"
                  onClick={() => onFollowUp(followUp)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  {followUp}
                  <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.actions.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suggested actions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {answer.actions.map((action) => (
              <Button
                key={`${action.kind}-${action.label}`}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={createProposal.isPending}
                onClick={() =>
                  createProposal.mutate(
                    {
                      kind: action.kind as ProposalKind,
                      context: { messageId: answer.messageId ?? undefined },
                    },
                    {
                      onSuccess: ({ proposalId }) => {
                        toast.success("Draft proposal created.");
                        router.push(`/actions/${proposalId}`);
                      },
                    },
                  )
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {answer.messageId && answer.phase === "complete" && (
        <div className="flex items-center gap-2">
          <MessageFeedback messageId={answer.messageId} />
          {isDevTraceEnabled() && <DevTraceDrawer messageId={answer.messageId} />}
        </div>
      )}
    </div>
  );
}

function MessageFeedback({ messageId }: { messageId: string }) {
  const feedback = useMessageFeedback(messageId);
  const [sent, setSent] = React.useState<"up" | "down" | null>(null);

  const send = (rating: "up" | "down") => {
    setSent(rating);
    feedback.mutate({ rating }, { onSuccess: () => toast.success("Thanks for the feedback.") });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="This answer was helpful"
        aria-pressed={sent === "up"}
        className={sent === "up" ? "text-success" : "text-muted-foreground"}
        onClick={() => send("up")}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="This answer was not helpful"
        aria-pressed={sent === "down"}
        className={sent === "down" ? "text-[var(--destructive)]" : "text-muted-foreground"}
        onClick={() => send("down")}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/** Retrieval trace, available in development builds only. */
function DevTraceDrawer({ messageId }: { messageId: string }) {
  const [open, setOpen] = React.useState(false);
  const trace = useRetrievalTrace(open ? messageId : null);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-[11px] text-muted-foreground"
        onClick={() => setOpen((value) => !value)}
      >
        <Wrench className="h-3 w-3" aria-hidden="true" />
        {open ? "Hide trace" : "Retrieval trace"}
      </Button>
      {open && (
        <div className="mt-1.5 rounded-md border border-border bg-muted/30 p-2.5 font-mono text-[10px] text-muted-foreground">
          {trace.isPending && "Loading trace…"}
          {trace.isError && "No trace is exposed by this deployment."}
          {trace.data && (
            <ul className="space-y-0.5">
              {trace.data.tools.map((tool) => (
                <li key={tool.name}>
                  {tool.name}: {tool.resultsCount} results, {tool.filteredCount} filtered,{" "}
                  {Math.round(tool.durationMs)}ms
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  isBusy,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
}) {
  return (
    <form
      className="border-t border-border p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Ask about projects, decisions, people or documents…"
          rows={2}
          className="min-h-[56px] resize-none text-sm"
          aria-label="Your question"
        />
        {isBusy ? (
          <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={onStop}>
            <Square className="h-3 w-3" aria-hidden="true" />
            Stop
          </Button>
        ) : (
          <Button type="submit" size="sm" className="h-9 gap-1.5 text-xs" disabled={!value.trim()}>
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            Ask
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Enter sends, Shift+Enter adds a line.
      </p>
    </form>
  );
}
