import { redirect } from "next/navigation";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

export default function AdminPage() {
  redirect("/admin/access");
}
