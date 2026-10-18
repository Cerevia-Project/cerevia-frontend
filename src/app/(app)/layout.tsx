import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RequireSession } from "@/providers/require-session";

/**
 * Everything under this layout is behind the session guard, which renders a
 * loading state until `GET /auth/session` resolves. There is no prerenderable
 * shell below it, so instant-navigation validation does not apply.
 */
export const instant = false;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireSession>
      <AppShell>{children}</AppShell>
    </RequireSession>
  );
}
