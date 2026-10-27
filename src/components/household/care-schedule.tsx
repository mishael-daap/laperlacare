"use client";

import { CheckIcon, ChevronDownIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAYS } from "@/lib/caregiver/availability";
import { addCareWindowAction, removeCareWindowAction } from "@/lib/household/actions";
import type { HouseholdWindow } from "@/lib/household/get-household-profile";

function dayLabel(dayOfWeek: number) {
  return DAYS.find((day) => day.value === dayOfWeek)?.long ?? "Day";
}

/** `time` comes back from Postgres as HH:MM:SS. The input and the list want HH:MM. */
function shortTime(value: string) {
  return value.slice(0, 5);
}

function rangeLabel(window: HouseholdWindow) {
  return `${dayLabel(window.day_of_week)}, ${shortTime(window.start_time)} to ${shortTime(window.end_time)}`;
}

/**
 * The days and times the household needs a caregiver.
 *
 * Each window is added and removed on its own. There is no week to save as a
 * whole, because the parent is describing a list, not painting a grid.
 */
export function CareSchedule({ windows }: { windows: HouseholdWindow[] }) {
  const [adding, setAdding] = useState(false);
  const [day, setDay] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedDay = DAYS.find((value) => value.value === day) ?? DAYS[0];

  function add() {
    setError(null);

    startTransition(async () => {
      const result = await addCareWindowAction({
        dayOfWeek: day,
        startTime,
        endTime,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setAdding(false);
    });
  }

  function remove(windowId: string) {
    setError(null);
    setRemoving(windowId);

    startTransition(async () => {
      const result = await removeCareWindowAction(windowId);

      if (result.error) {
        setError(result.error);
      }

      setRemoving(null);
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">
          When you need care
        </h2>
        <p className="text-muted-foreground">
          Add the days and times you need a caregiver. You can add as many as you
          need.
        </p>
      </div>

      {windows.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {windows.map((window) => (
            <li
              key={window.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-semibold">{dayLabel(window.day_of_week)}</span>
                <span className="text-sm text-muted-foreground">
                  {shortTime(window.start_time)} to {shortTime(window.end_time)}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${rangeLabel(window)}`}
                onClick={() => remove(window.id)}
                disabled={removing === window.id}
              >
                <TrashIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {adding ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label>Day</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button type="button" variant="outline" className="w-full justify-between" />}
                >
                  {selectedDay.long}
                  <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {DAYS.map((value) => (
                    <DropdownMenuItem
                      key={value.value}
                      onClick={() => setDay(value.value)}
                    >
                      {value.long}
                      {day === value.value ? <CheckIcon className="ml-auto" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="window-start">From</Label>
              <Input
                id="window-start"
                type="time"
                step="900"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="window-end">To</Label>
              <Input
                id="window-end"
                type="time"
                step="900"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="contrast"
              onClick={add}
              disabled={pending}
            >
              {pending ? "Adding…" : "Add day"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            setError(null);
            setAdding(true);
          }}
        >
          <PlusIcon />
          Add day
        </Button>
      )}

      {!adding && windows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No days added yet. Add the days and times you need a caregiver.
        </p>
      ) : null}

      {!adding && error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
