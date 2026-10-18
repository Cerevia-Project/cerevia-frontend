"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LOGIN_PATH, useSession } from "@/providers/session-provider";
import { LoadingState } from "@/components/feedback";

/**
 * Blocks an authenticated area until the session bootstrap resolves, and
 * sends unauthenticated visitors to login with their return path preserved.
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  // The return path is read from the browser rather than through
  // `usePathname`, which would opt every guarded route out of prerendering.
  React.useEffect(() => {
    if (status === "unauthenticated") {
      const current = `${window.location.pathname}${window.location.search}`;
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(current)}`);
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState
          message={status === "loading" ? "Signing you in…" : "Redirecting to sign in…"}
        />
      </div>
    );
  }

  return <>{children}</>;
}
