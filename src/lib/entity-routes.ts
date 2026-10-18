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
