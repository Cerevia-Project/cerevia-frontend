"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setUnauthenticatedHandler } from "@/api/client";
import { authApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { LoginRequest, Session } from "@/api/types";

export const LOGIN_PATH = "/login";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  session: Session | null;
  status: SessionStatus;
  permissions: ReadonlySet<string>;
  roles: readonly string[];
  /** Server-side authority is the server's; this only hides what it would refuse. */
  can: (permission: string) => boolean;
  login: (credentials: LoginRequest) => Promise<Session>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  refresh: () => Promise<unknown>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // `null` is written on a 401 and means "resolved, and there is no session".
  // `undefined` means the bootstrap has not answered yet. Collapsing the two
  // would leave a guarded route spinning instead of redirecting to login.
  const query = useQuery<Session | null>({
    queryKey: queryKeys.session,
    queryFn: authApi.getSession,
    retry: false,
    staleTime: 5 * 60_000,
  });

  // Session expiry anywhere in the app lands on login with the return path
  // kept. The path is read from the browser at the moment it happens rather
  // than through `usePathname`, which would make every route dynamic.
  React.useEffect(() => {
    return setUnauthenticatedHandler(() => {
      queryClient.setQueryData(queryKeys.session, null);
      const current = `${window.location.pathname}${window.location.search}`;
      if (current.startsWith(LOGIN_PATH)) return;
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(current)}`);
    });
  }, [queryClient, router]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    meta: { silentError: true },
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.session, session);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace(LOGIN_PATH);
    },
  });

  const session = query.data ?? null;

  const value = React.useMemo<SessionContextValue>(() => {
    const permissions = new Set(session?.permissions ?? []);
    // Anything other than a live session, once the bootstrap has answered,
    // is unauthenticated - including a failure to reach the API at all.
    const resolved = query.data !== undefined || query.isError;

    return {
      session,
      status: session ? "authenticated" : resolved ? "unauthenticated" : "loading",
      permissions,
      roles: session?.roles ?? [],
      can: (permission: string) => permissions.has(permission),
      login: (credentials) => loginMutation.mutateAsync(credentials),
      logout: () => logoutMutation.mutateAsync(),
      isLoggingIn: loginMutation.isPending,
      refresh: () => query.refetch(),
    };
  }, [session, query, loginMutation, logoutMutation]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside <SessionProvider>.");
  }
  return context;
}

/** True when the current session carries every permission listed. */
export function usePermission(...permissions: string[]): boolean {
  const { can } = useSession();
  return permissions.every(can);
}
