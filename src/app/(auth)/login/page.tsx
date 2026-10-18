"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Network, ArrowRight, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, errorMessage, fieldErrorMap } from "@/api/errors";
import { useSession } from "@/providers/session-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, status } = useSession();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<unknown>(null);

  // Where the session expired, so the user lands back where they left off.
  const returnPath = searchParams.get("next") ?? "/overview";

  // False during server rendering and until hydration completes. The submit
  // button stays disabled until then, so a click can never fall through to a
  // native form submission - which would put the password in the URL.
  const isInteractive = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  React.useEffect(() => {
    if (status === "authenticated") router.replace(returnPath);
  }, [status, returnPath, router]);

  const fieldErrors = fieldErrorMap(error);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      router.replace(returnPath);
    } catch (cause) {
      setError(cause);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary border border-border mb-2">
            <Network className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Sign in to Cerevia</h1>
          <p className="text-xs text-muted-foreground">
            Enterprise Knowledge &amp; Intelligence Workspace
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Work Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className="h-9 text-xs"
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-[11px] text-[var(--destructive)]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className="h-9 text-xs"
              />
              {fieldErrors.password && (
                <p id="password-error" className="text-[11px] text-[var(--destructive)]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error != null && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-[var(--destructive-border)] bg-[var(--destructive-subtle)] p-2.5"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--destructive)]" />
                <div className="space-y-0.5">
                  <p className="text-[11px] text-foreground">{errorMessage(error)}</p>
                  {error instanceof ApiError && error.status >= 500 && error.requestId && (
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Reference {error.requestId}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 text-xs gap-1.5"
              disabled={isLoggingIn || !isInteractive}
            >
              <span>{isLoggingIn ? "Signing in…" : "Continue to Workspace"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
