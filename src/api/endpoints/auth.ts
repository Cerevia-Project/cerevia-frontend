/** Auth & session endpoints. */

import { api, setCsrfToken } from "@/api/client";
import type { LoginRequest, Session } from "@/api/types";

export async function login(body: LoginRequest): Promise<Session> {
  const session = await api.post<Session>("/api/v1/auth/login", body);
  setCsrfToken(session.csrfToken);
  return session;
}

export async function logout(): Promise<void> {
  await api.post<void>("/api/v1/auth/logout");
  setCsrfToken(null);
}

export async function getSession(): Promise<Session> {
  const session = await api.get<Session>("/api/v1/auth/session");
  setCsrfToken(session.csrfToken);
  return session;
}

export async function refreshCsrf(): Promise<string> {
  const { csrfToken } = await api.get<{ csrfToken: string }>("/api/v1/auth/csrf");
  setCsrfToken(csrfToken);
  return csrfToken;
}
