/** Projects, risks, decisions, people, teams, expertise and conflicts. */

import { api } from "@/api/client";
import type {
  Conflict,
  ConflictListParams,
  ConflictStatus,
  DecisionDetail,
  DecisionListParams,
  DecisionSummary,
  DecisionTrace,
  EntityRef,
  ExpertiseMatches,
  LaunchReadiness,
  Page,
  PageParams,
  PersonProfile,
  ProjectDetail,
  ProjectSummary,
  Risk,
  Subgraph,
  TeamDetail,
} from "@/api/types";

/* ── Projects & risks ──────────────────────────────────────────────────── */

export function listProjects(params: PageParams = {}): Promise<Page<ProjectSummary>> {
  return api.get<Page<ProjectSummary>>("/api/v1/projects", { params: { ...params } });
}

export function getProject(id: string): Promise<ProjectDetail> {
  return api.get<ProjectDetail>(`/api/v1/projects/${encodeURIComponent(id)}`);
}

export function getProjectTasks(id: string): Promise<Page<EntityRef>> {
  return api.get<Page<EntityRef>>(`/api/v1/projects/${encodeURIComponent(id)}/tasks`);
}

export function getProjectDependencies(id: string): Promise<Subgraph> {
  return api.get<Subgraph>(`/api/v1/projects/${encodeURIComponent(id)}/dependencies`);
}

export function getProjectRisks(id: string): Promise<{ items: Risk[] }> {
  return api.get<{ items: Risk[] }>(`/api/v1/projects/${encodeURIComponent(id)}/risks`);
}

export function getLaunchReadiness(id: string): Promise<LaunchReadiness> {
  return api.get<LaunchReadiness>(`/api/v1/projects/${encodeURIComponent(id)}/launch-readiness`);
}

export function listRisks(window?: string): Promise<{ items: Risk[] }> {
  return api.get<{ items: Risk[] }>("/api/v1/risks", { params: { window } });
}

/* ── Decisions ─────────────────────────────────────────────────────────── */

export function listDecisions(params: DecisionListParams = {}): Promise<Page<DecisionSummary>> {
  return api.get<Page<DecisionSummary>>("/api/v1/decisions", { params: { ...params } });
}

export function getDecision(id: string): Promise<DecisionDetail> {
  return api.get<DecisionDetail>(`/api/v1/decisions/${encodeURIComponent(id)}`);
}

export function getDecisionRevisions(id: string): Promise<{ items: EntityRef[] }> {
  return api.get<{ items: EntityRef[] }>(`/api/v1/decisions/${encodeURIComponent(id)}/revisions`);
}

export function getDecisionTrace(id: string): Promise<DecisionTrace> {
  return api.get<DecisionTrace>(`/api/v1/decisions/${encodeURIComponent(id)}/trace`);
}

/* ── People & teams ────────────────────────────────────────────────────── */

export function listPeople(params: PageParams = {}): Promise<Page<EntityRef>> {
  return api.get<Page<EntityRef>>("/api/v1/people", { params: { ...params } });
}

export function getPerson(id: string): Promise<PersonProfile> {
  return api.get<PersonProfile>(`/api/v1/people/${encodeURIComponent(id)}`);
}

export function listTeams(params: PageParams = {}): Promise<Page<EntityRef>> {
  return api.get<Page<EntityRef>>("/api/v1/teams", { params: { ...params } });
}

export function getTeam(id: string): Promise<TeamDetail> {
  return api.get<TeamDetail>(`/api/v1/teams/${encodeURIComponent(id)}`);
}

export function searchExpertise(topic: string): Promise<ExpertiseMatches> {
  return api.get<ExpertiseMatches>("/api/v1/expertise/search", { params: { topic } });
}

/* ── Conflicts ─────────────────────────────────────────────────────────── */

export function listConflicts(params: ConflictListParams = {}): Promise<Page<Conflict>> {
  return api.get<Page<Conflict>>("/api/v1/conflicts", { params: { ...params } });
}

export function getConflict(id: string): Promise<Conflict> {
  return api.get<Conflict>(`/api/v1/conflicts/${encodeURIComponent(id)}`);
}

export function reviewConflict(
  id: string,
  body: { status?: ConflictStatus; note?: string },
): Promise<Conflict> {
  return api.patch<Conflict>(`/api/v1/conflicts/${encodeURIComponent(id)}`, body);
}
