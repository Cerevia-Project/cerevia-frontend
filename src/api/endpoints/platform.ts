import { api } from "@/api/client";

export function getHealth(): Promise<{ status: "ok" }> {
  return api.get<{ status: "ok" }>("/health");
}

export function getVersion(): Promise<{ version: string }> {
  return api.get<{ version: string }>("/version");
}
