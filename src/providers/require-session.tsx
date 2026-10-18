"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LOGIN_PATH, useSession } from "@/providers/session-provider";
import { LoadingState } from "@/components/feedback";

export function RequireSession({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      // Read from `window`, not `usePathname`, which would make every route dynamic.
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
