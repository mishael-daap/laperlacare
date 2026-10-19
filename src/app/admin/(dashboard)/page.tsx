import { redirect } from "next/navigation";

/**
 * `/admin` on its own has nothing to show. The list is the admin area's front
 * page, so this sends people there rather than inventing a dashboard that would
 * only be a menu.
 */
export default function AdminIndexPage() {
  redirect("/admin/caregiver");
}
