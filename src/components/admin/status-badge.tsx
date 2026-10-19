import { Badge } from "@/components/ui/badge";

/**
 * A verification status as a badge.
 *
 * Onboarding and Pending are both `verification_status = 'pending'`; what
 * separates them is whether a background check has been submitted. The admin
 * list already has `submitted_at` in hand, so the badge takes it rather than
 * asking the database for a fifth status that does not exist.
 */
export function StatusBadge({
  status,
  submitted = true,
}: {
  status: string;
  submitted?: boolean;
}) {
  if (status === "approved") {
    return <Badge variant="success">Approved</Badge>;
  }

  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }

  if (!submitted) {
    return <Badge variant="outline">Onboarding</Badge>;
  }

  return <Badge variant="warning">Pending</Badge>;
}
