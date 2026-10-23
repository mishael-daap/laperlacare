"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

import { useProfileDraft } from "./profile-draft";

/**
 * One checklist, used twice.
 *
 * The needs list is what a parent ticks per child, shown here under "I can
 * support children who…" so the rows read from the caregiver's side rather than
 * describing them. The supports list is what they can actually do. Both come
 * from the database and neither is required.
 *
 * Ticking does not save. It moves the draft, and the save bar commits it with
 * everything else — the same way a name or an hour does.
 */
export function CapabilityChecklist({
  items,
  title,
  description,
  kind,
}: {
  items: { slug: string; label: string }[];
  title: string;
  description: string;
  kind: "needs" | "supports";
}) {
  const { needSlugs, toggleNeed, supportSlugs, toggleSupport } = useProfileDraft();

  const selected = kind === "needs" ? needSlugs : supportSlugs;
  const toggle = kind === "needs" ? toggleNeed : toggleSupport;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <FieldSet>
        <FieldLegend variant="label" className="sr-only">
          {title}
        </FieldLegend>

        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <Checkbox
                id={`${kind}-${item.slug}`}
                className="mt-0.5"
                checked={selected.has(item.slug)}
                onCheckedChange={() => toggle(item.slug)}
              />
              <Label htmlFor={`${kind}-${item.slug}`} className="font-normal leading-snug">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </FieldSet>
    </section>
  );
}
