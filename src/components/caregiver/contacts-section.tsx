"use client";

import { CheckIcon, ChevronDownIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTACT_METHODS, labelFor } from "@/lib/caregiver/answers";

/**
 * Every way a family can reach this caregiver, as cards rather than a form.
 *
 * The phone number is what a parent actually wants, so it leads: full contrast,
 * larger. Email sits under it at a quieter level, and the preferred contact
 * method says which of the two to use — because a number nobody should ring is
 * worse than no number at all.
 *
 * There is no address here. The home address is a vetting fact and lives on the
 * application; a caregiver's street is not something a family needs.
 *
 * The fields only appear once a card is opened with its pencil. A screen of
 * inputs says "fill this in"; a card says "here is your contact", which is what
 * this is most of the time — people change a number once, and look at it never.
 *
 * Nothing is written until the save bar commits. Additions, edits, and removals
 * all sit in the draft, so adding a contact and changing your mind costs nothing.
 */
export function ContactsSection() {
  const { contacts, addContact, updateContact, removeContact, profileEditing } =
    useProfileDraft();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function update(index: number, patch: Parameters<typeof updateContact>[1]) {
    updateContact(index, patch);
  }

  return (
    <div className="flex flex-col gap-5">
      {contacts.length === 0 ? (
        <p className="text-muted-foreground">
          Add a phone number or an email so families can reach you.
        </p>
      ) : null}

      {contacts.map((contact, index) => {
        const open = openIndex === index;

        return (
          <Card key={contact.id ?? `new-${index}`} className="gap-0 py-4">
            {open ? (
              <div className="flex flex-col gap-4 px-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Editing {contact.label.toLowerCase()}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenIndex(null)}
                  >
                    Done
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`label-${index}`}>Label</Label>
                    <Input
                      id={`label-${index}`}
                      value={contact.label}
                      onChange={(event) => update(index, { label: event.target.value })}
                      placeholder="Mobile"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`phone-${index}`}>Phone</Label>
                    <Input
                      id={`phone-${index}`}
                      type="tel"
                      value={contact.phone}
                      onChange={(event) => update(index, { phone: event.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={contact.email}
                      onChange={(event) => update(index, { email: event.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label>Preferred contact method</Label>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between sm:w-56"
                          />
                        }
                      >
                        {labelFor(CONTACT_METHODS, contact.preferredContactMethod) ??
                          "Phone call"}
                        <ChevronDownIcon />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        {CONTACT_METHODS.map((method) => (
                          <DropdownMenuItem
                            key={method.value}
                            onClick={() =>
                              update(index, { preferredContactMethod: method.value })
                            }
                          >
                            {method.label}
                            {contact.preferredContactMethod === method.value ? (
                              <CheckIcon className="ml-auto" />
                            ) : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 px-4">
                {/* `min-w-0` and `break-words` are the fix for two things at
                    once. Without min-w-0 the text column refuses to shrink, so
                    a long email widened the row and pushed the pencil and bin
                    off screen — which is why they never appeared on a phone.
                    `break-words` stops a long address with no spaces in it from
                    overflowing instead of wrapping. */}
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-xs text-muted-foreground">{contact.label}</p>

                  <p className="font-semibold break-words">
                    {contact.phone || (
                      <span className="text-muted-foreground">No phone number</span>
                    )}
                  </p>

                  {contact.email ? (
                    <p className="text-sm break-words text-muted-foreground">
                      {contact.email}
                    </p>
                  ) : null}

                  {contact.phone || contact.email ? (
                    <p className="text-sm text-muted-foreground">
                      Prefers {(
                        labelFor(CONTACT_METHODS, contact.preferredContactMethod) ??
                        "a phone call"
                      ).toLowerCase()}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No phone number or email yet
                    </p>
                  )}
                </div>

                {profileEditing ? (
                  <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label={`Edit the ${contact.label} contact`}
                    onClick={() => setOpenIndex(index)}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <PencilIcon className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Remove the ${contact.label} contact`}
                    onClick={() => {
                      setOpenIndex(null);
                      removeContact(index);
                    }}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        );
      })}

      {profileEditing ? (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            addContact();
            // Open the new card straight away: it is empty, so there is nothing
            // to look at until it is being edited.
            setOpenIndex(contacts.length);
          }}
        >
          <PlusIcon />
          Add another contact
        </Button>
      ) : null}
    </div>
  );
}
