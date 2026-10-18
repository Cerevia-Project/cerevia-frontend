/**
 * Where an entity lives in the UI.
 *
 * Types with a dedicated screen go there; everything else opens focused in the
 * graph explorer, which can render any entity type the backend knows.
 */

import type { EntityType } from "@/api/types";

const DEDICATED_ROUTE: Partial<Record<EntityType, (id: string) => string>> = {
  employee: (id) => `/people/${encodeURIComponent(id)}`,
  team: (id) => `/teams/${encodeURIComponent(id)}`,
  project: (id) => `/projects/${encodeURIComponent(id)}`,
  decision: (id) => `/decisions/${encodeURIComponent(id)}`,
};

export function entityHref(type: EntityType | string, id: string): string {
  const dedicated = DEDICATED_ROUTE[type as EntityType];
  return dedicated ? dedicated(id) : graphHref({ entity: id });
}

/** Deep link into the graph explorer. Filters live in the URL, so links share. */
export function graphHref(params: {
  entity?: string;
  path?: string;
  fromMessage?: string;
  depth?: number;
}): string {
  const search = new URLSearchParams();
  if (params.entity) search.set("entity", params.entity);
  if (params.path) search.set("path", params.path);
  if (params.fromMessage) search.set("fromMessage", params.fromMessage);
  if (params.depth) search.set("depth", String(params.depth));
  const query = search.toString();
  return query ? `/graph?${query}` : "/graph";
}
