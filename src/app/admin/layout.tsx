import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RequireSession } from "@/providers/require-session";

// Everything here waits on the session, so there is no prerenderable shell to validate.
export const instant = false;

export default function AdminLayout({
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
