"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EntityBadge } from "@/components/entities/EntityBadge";

export default function PeoplePage() {
  const people = [
    {
      id: "p1",
      name: "Dr. Elena Vance",
      initials: "EV",
      role: "Principal AI Architect",
      team: "Core Platform",
      decisions: 48,
      status: "online" as const,
    },
    {
      id: "p2",
      name: "Sarah Chen",
      initials: "SC",
      role: "Lead Infrastructure Engineer",
      team: "Infra Arch",
      decisions: 36,
      status: "online" as const,
    },
    {
      id: "p3",
      name: "Habib Adavize",
      initials: "HA",
      role: "Frontend Staff Engineer & Steward",
      team: "UI/UX & Platform",
      decisions: 22,
      status: "online" as const,
    },
    {
      id: "p4",
      name: "Marcus Holloway",
      initials: "MH",
      role: "Security & Compliance Officer",
      team: "InfoSec",
      decisions: 18,
      status: "away" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            People &amp; Teams
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Explore organizational knowledge contributors, domain stewards, and stakeholder clusters in the graph.
          </p>
        </div>
        <Button size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {people.map((p) => (
          <Card key={p.id} hoverable>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <Avatar size="lg" status={p.status}>
                  <AvatarFallback className="font-semibold text-primary bg-primary/10">
                    {p.initials}
                  </AvatarFallback>
                </Avatar>
                <EntityBadge type="team" name={p.team} size="sm" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">{p.decisions} Verified ADRs</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs p-1">
                  View Nodes &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
