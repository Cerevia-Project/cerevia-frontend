"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EntityBadge, entityTypeConfig } from "@/components/entities/EntityBadge";
import { SampleDataBadge } from "@/components/feedback/SampleDataBadge";
import { useEntitySearch } from "@/features/graph/api";
import { entityHref } from "@/lib/entity-routes";
import { errorMessage } from "@/api/errors";

export interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEBOUNCE_MS = 250;

/**
 * Global entity search, backed by `GET /graph/search`.
 *
 * Arrow keys move the highlight and Enter opens it, so the palette is usable
 * without a pointer.
 */
export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Clearing on close and resetting the highlight on a new search are
  // derivations of props and state, not synchronization with anything
  // external, so they are adjusted during render rather than in an effect.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setDebounced("");
      setActiveIndex(0);
    }
  }

  const search = useEntitySearch(debounced);
  const results = React.useMemo(() => search.data?.items ?? [], [search.data]);

  const [highlightedFor, setHighlightedFor] = React.useState(debounced);
  if (highlightedFor !== debounced) {
    setHighlightedFor(debounced);
    setActiveIndex(0);
  }

  const openEntity = React.useCallback(
    (index: number) => {
      const entity = results[index];
      if (!entity) return;
      onOpenChange(false);
      router.push(entityHref(entity.type, entity.id));
    },
    [results, onOpenChange, router],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      openEntity(activeIndex);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-xl border border-border p-0 shadow-2xl">
        <DialogTitle className="sr-only">Search the knowledge graph</DialogTitle>
        <div className="m-3 flex items-center border-b border-border px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search people, teams, projects, decisions, documents…"
            className="m-1 h-10 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
            autoFocus
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="command-search-results"
            aria-activedescendant={results[activeIndex] ? `entity-${results[activeIndex].id}` : undefined}
          />
          {search.isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {debounced.trim().length <= 1 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Type at least two characters to search the knowledge graph.
            </p>
          ) : search.isError ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {errorMessage(search.error)}
            </p>
          ) : results.length === 0 && !search.isPending ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No entity matches &ldquo;{debounced}&rdquo;.
            </p>
          ) : (
            <ul id="command-search-results" role="listbox" className="space-y-1">
              {results.map((entity, index) => {
                const config = entityTypeConfig(entity.type);
                return (
                  <li key={entity.id} id={`entity-${entity.id}`} role="option" aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      onClick={() => openEntity(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-md p-2 text-left text-xs transition-colors ${
                        index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                      }`}
                    >
                      <span className="mr-2 flex items-center gap-2.5 truncate">
                        <EntityBadge type={entity.type} iconOnly size="sm" />
                        <span className="truncate font-medium text-foreground">{entity.label}</span>
                        {entity.isSampleData && <SampleDataBadge />}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {config.label}
                        </span>
                        <ArrowRight className="h-3 w-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2 font-mono text-[10px]">
            <span>Navigate ↑ ↓</span>
            <span>Open ↵</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
