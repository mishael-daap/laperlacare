/**
 * Age is derived from the date of birth every time it is shown. It is never a
 * column, so it cannot go stale.
 *
 * Shared by children and caregivers: both store a calendar date and show an age,
 * and neither should grow its own copy of this rule.
 *
 * The date is a calendar date, not an instant. Parsing it with the local `Date`
 * constructor would put a birthday a day early or late depending on the
 * viewer's timezone, so the comparison happens in UTC.
 */
export function ageFromDateOfBirth(dateOfBirth: string, today = new Date()) {
  const [year, month, day] = dateOfBirth.split("-").map(Number);

  let age = today.getUTCFullYear() - year;

  const todayMonth = today.getUTCMonth() + 1;
  const todayDay = today.getUTCDate();

  if (todayMonth < month || (todayMonth === month && todayDay < day)) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function formatAge(dateOfBirth: string | null, today = new Date()) {
  if (!dateOfBirth) return "Age not set";

  const age = ageFromDateOfBirth(dateOfBirth, today);

  if (age < 1) return "Under 1 year old";

  return `${age} year${age === 1 ? "" : "s"} old`;
}
