"use client";

import { PencilIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { VerificationStatus } from "@/components/caregiver/verification-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * The top of the profile: the cloud photograph, the avatar overlapping its
 * lower edge, then the name and bio.
 *
 * Nothing here is editable until the Edit profile button is pressed. The page
 * is read-mostly — a caregiver looks at their own profile far more often than
 * they change it — and pencils on every field all the time make a finished
 * profile look like a form waiting to be filled in.
 *
 * The chosen photo is held as a File until Save rather than uploaded on pick, so
 * that "save" means the same thing for every field on the page.
 *
 * The cover reuses the hero's landscape crop rather than a second asset, so the
 * profile reads as the same place as the landing page.
 */
export function ProfileHeader({
  avatarSrc,
  status,
  done,
  total,
}: {
  avatarSrc: string | null;
  status: string;
  done: number;
  total: number;
}) {
  const { name, setName, bio, setBio, preview, setPhoto, profileEditing, setProfileEditing } =
    useProfileDraft();

  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<"name" | "bio" | null>(null);

  function pickPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPhoto(file);
  }

  const shownAvatar = preview ?? avatarSrc;

  return (
    <header>
      {/* 24dvh on a phone, fixed heights above that.
          
          The viewport unit is wanted on mobile, where the browser chrome comes
          and goes and a percentage of what is actually visible beats a fixed
          number. On a desktop window it is the opposite — the unit grows with
          the monitor, so the cover kept swelling and pushing the name and bio
          down. The photograph is the frame; the profile is what is being looked
          at. */}
      <div className="relative h-[24dvh] overflow-hidden sm:h-52 md:h-60">
        <Image
          src="/hero/lpc-horizontal-2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* On the photograph, so it needs its own surface — a transparent or
            outline-only button disappears against a bright sky. */}
        <Button
          type="button"
          variant={profileEditing ? "contrast" : "outline"}
          className="absolute top-5 right-5 shadow-sm"
          onClick={() => {
            setEditing(null);
            setProfileEditing(!profileEditing);
          }}
        >
          {profileEditing ? "Editing profile" : "Edit profile"}
        </Button>
      </div>

      {/* `relative` matters: a static element cannot paint above the positioned
          cover, so the overlap would not show without it. */}
      <div className="relative -mt-14 ml-7 size-28 md:-mt-16 md:ml-10 md:size-33">
        <div className="size-full overflow-hidden rounded-full border-[3px] border-background bg-muted">
          {shownAvatar ? (
            <Image
              src={shownAvatar}
              alt=""
              width={132}
              height={132}
              unoptimized={preview !== null}
              className="size-full object-cover"
            />
          ) : null}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={pickPhoto}
        />

        {/* Top right, so it cannot sit on the status dot in the corner below. */}
        {profileEditing ? (
          <button
            type="button"
            aria-label="Change your photo"
            onClick={() => fileInput.current?.click()}
            className="absolute top-0 right-0 grid size-8 place-items-center rounded-full bg-foreground text-background shadow-sm transition-opacity hover:opacity-85"
          >
            <PencilIcon className="size-3.5" />
          </button>
        ) : null}

        <VerificationStatus status={status} done={done} total={total} />
      </div>

      <div className="px-7 pt-3.5 pb-8 md:px-10 md:pt-4">
        <div className="min-w-0">
            {editing === "name" ? (
              <Input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setEditing(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") setEditing(null);
                }}
                placeholder="Your name"
                className="h-auto max-w-sm rounded-none border-0 bg-transparent px-0 py-0 font-heading text-xl font-semibold tracking-tight shadow-none outline-none focus-visible:border-0 focus-visible:ring-0 md:text-2xl"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
                  {name || "Add your name"}
                </h1>
                {profileEditing ? (
                  <PencilButton
                    label="Edit your name"
                    onClick={() =>
                      setEditing((current) => (current === "name" ? null : "name"))
                    }
                  />
                ) : null}
              </div>
            )}

            <div className="mt-2 max-w-[560px]">
              {/* The pencil sits INSIDE the paragraph, in the text flow, so it
                  follows the last word of the bio.

                  As a sibling it came after the paragraph's box, and a wrapped
                  paragraph is always as wide as its longest line — so a short
                  last line left a lake of empty space between the text and its
                  own edit button. Inline is the only way it can hug the text it
                  belongs to. The gap that remains sits between the pencil and
                  the badge, which is where it belongs. */}
              {editing === "bio" ? (
                <Textarea
                  autoFocus
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  onBlur={() => setEditing(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setEditing(null);
                  }}
                  placeholder="What you are good at, who you have looked after, and how you like to work."
                  className="min-h-0 resize-none rounded-none border-0 bg-transparent px-0 py-0 text-sm leading-[1.7] text-muted-foreground shadow-none outline-none focus-visible:border-0 focus-visible:ring-0 md:text-[15px]"
                />
              ) : (
                <p className="flex items-center text-sm leading-[1.7] text-muted-foreground md:text-[15px]">
                  <span className="min-w-0">
                    {bio || "Add a short bio so families know who you are."}
                  </span>
                  {profileEditing ? (
                    <PencilButton
                      label="Edit your bio"
                      onClick={() =>
                        setEditing((current) => (current === "bio" ? null : "bio"))
                      }
                    />
                  ) : null}
                </p>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}

function PencilButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        // inline-grid rather than grid: inside a paragraph it has to sit in the
        // text flow, and align-middle keeps it off the baseline.
        "inline-grid size-6 place-items-center rounded-full align-middle",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        /* The gap between the text and its pencil. */
        "ml-1.5",
        className ?? "",
      ].join(" ")}
    >
      <PencilIcon className="size-3.5" />
    </button>
  );
}
