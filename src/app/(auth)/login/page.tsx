"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Network, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@cerevia.internal");
  const [password, setPassword] = React.useState("••••••••••••");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Signed in successfully. Redirecting to workspace...");
      router.push("/overview");
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary border border-border mb-2">
            <Network className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sign in to Cerevia
          </h1>
          <p className="text-xs text-muted-foreground">
            Enterprise Knowledge &amp; Intelligence Workspace
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <Button type="submit" className="w-full h-9 text-xs gap-1.5" disabled={isLoading}>
              <span>{isLoading ? "Signing in..." : "Continue to Workspace"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-card px-2 text-muted-foreground">Or single sign-on</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Signing in with Okta SSO...");
                router.push("/overview");
              }}
            >
              Okta Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Signing in with Google Workspace...");
                router.push("/overview");
              }}
            >
              Google SSO
            </Button>
          </div>
        </Card>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>SOC-2 Type II Certified • FalkorDB Multi-Tenant Encrypted</span>
        </div>
      </div>
    </div>
  );
}
