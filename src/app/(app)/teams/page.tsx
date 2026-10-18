import { TeamsView } from "@/features/teams";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

export default function TeamsPage() {
  return <TeamsView />;
}
