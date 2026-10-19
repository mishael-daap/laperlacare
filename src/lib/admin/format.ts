/**
 * Display helpers for the admin screens.
 *
 * Dates are formatted in the app's operating timezone rather than the server's.
 * The server runs in UTC; a late-evening submission in California would show the
 * next day, which is the kind of wrong that makes a reviewer distrust the row.
 */

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Los_Angeles",
});

export function formatDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : null;
}

/** `09:00:00` → `09:00`, which is the form the availability board already uses. */
export function formatTime(value: string) {
  return value.slice(0, 5);
}
