import type { AvailabilityBlock } from "@/lib/caregiver/actions";

/**
 * The shape of the weekly board, in one place.
 *
 * The grid is per hour because that is what is clickable; the database stores
 * blocks because twenty-four one-hour rows per day would be silly. These two
 * conversions are the only place that difference is handled.
 */
export const DAYS = [
  { value: 1, label: "Mon", long: "Monday" },
  { value: 2, label: "Tue", long: "Tuesday" },
  { value: 3, label: "Wed", long: "Wednesday" },
  { value: 4, label: "Thu", long: "Thursday" },
  { value: 5, label: "Fri", long: "Friday" },
  { value: 6, label: "Sat", long: "Saturday" },
  { value: 7, label: "Sun", long: "Sunday" },
] as const;

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export const cellKey = (day: number, hour: number) => `${day}-${hour}`;

/** Stored blocks become the set of lit cells the board draws. */
export function blocksToCells(
  blocks: { day_of_week: number; start_time: string; end_time: string }[],
) {
  const cells = new Set<string>();

  for (const block of blocks) {
    const from = Number(block.start_time.slice(0, 2));
    const to = Number(block.end_time.slice(0, 2));

    for (let hour = from; hour < to; hour += 1) {
      cells.add(cellKey(block.day_of_week, hour));
    }
  }

  return cells;
}

/**
 * Lit cells become stored blocks again, with neighbouring hours merged.
 *
 * Clicking 2pm through 4pm is meant to say one thing, not three, so a run of
 * lit hours becomes a single block.
 */
export function cellsToBlocks(cells: Set<string>): AvailabilityBlock[] {
  const blocks: AvailabilityBlock[] = [];

  for (const day of DAYS) {
    let runStart: number | null = null;

    for (const hour of [...HOURS, null]) {
      const lit = hour !== null && cells.has(cellKey(day.value, hour));

      if (lit && runStart === null) {
        runStart = hour;
      } else if (!lit && runStart !== null) {
        blocks.push({
          day_of_week: day.value,
          start_time: `${String(runStart).padStart(2, "0")}:00:00`,
          end_time: `${String(hour ?? 24).padStart(2, "0")}:00:00`,
        });
        runStart = null;
      }
    }
  }

  return blocks;
}
