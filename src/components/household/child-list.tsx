import { ChildCard } from "@/components/household/child-card";
import { ChildDialog } from "@/components/household/child-dialog";
import type { HouseholdChild, HouseholdList } from "@/lib/household/get-household-profile";

type ChildListProps = {
  childProfiles: HouseholdChild[];
  needs: HouseholdList;
  supports: HouseholdList;
};

export function ChildList({ childProfiles, needs, supports }: ChildListProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl tracking-tight">
            Your children
          </h2>
          <p className="text-muted-foreground">
            Add each child so caregivers know who they will be caring for.
          </p>
        </div>

        <ChildDialog mode="add" needs={needs} supports={supports} />
      </div>

      {childProfiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No children added yet. Add your first child so caregivers know who
            they will be caring for.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {childProfiles.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              needs={needs}
              supports={supports}
            />
          ))}
        </div>
      )}
    </section>
  );
}
