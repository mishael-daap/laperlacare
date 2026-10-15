/**
 * The caregiver's own verification state, written on a pill that overlaps their
 * avatar.
 *
 * Colour alone would be a guess for anybody who cannot tell amber from green, so
 * the word is on it. It rides the bottom-right of the picture the way a status
 * rides a profile photo, ringed in the page background so it reads as attached
 * to the image rather than floating near it.
 *
 * Amber covers both "still filling this in" and "waiting on us". Those are the
 * same thing from the caregiver's side, and the count says which one it is.
 *
 * Only ever on `/me`. A family browsing the catalogue never sees "pending"; they
 * simply do not see the profile at all until it is approved.
 */
export function VerificationStatus({
  status,
  done,
  total,
}: {
  status: string;
  done: number;
  total: number;
}) {
  const label =
    status === "approved"
      ? "Verified"
      : status === "rejected"
        ? "Not approved"
        : done < total
          ? `${done} of ${total} complete`
          : "Pending";

  const tone =
    status === "approved"
      ? "bg-success text-success-foreground"
      : status === "rejected"
        ? "bg-destructive text-destructive-foreground"
        : "bg-warning text-warning-foreground";

  return (
    <span
      role="status"
      className={[
        "absolute -right-1 -bottom-1 rounded-full",
        "border-[3px] border-background px-2.5 py-1",
        "text-xs leading-none font-medium whitespace-nowrap",
        tone,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
