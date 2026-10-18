import { api } from "@/api/client";
import type { Overview } from "@/api/types";

export function getOverview(): Promise<Overview> {
  return api.get<Overview>("/api/v1/overview");
}
