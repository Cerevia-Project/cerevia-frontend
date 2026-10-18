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

  // `null` means resolved with no session (written on 401); `undefined` means still loading.
  const query = useQuery<Session | null>({
    queryKey: queryKeys.session,
    queryFn: authApi.getSession,
    retry: false,
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    return setUnauthenticatedHandler(() => {
      queryClient.setQueryData(queryKeys.session, null);
      // Read from `window`, not `usePathname`, which would make every route dynamic.
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

export function usePermission(...permissions: string[]): boolean {
  const { can } = useSession();
  return permissions.every(can);
}
