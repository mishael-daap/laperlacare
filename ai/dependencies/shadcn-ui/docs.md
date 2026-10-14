# shadcn/ui — docs snapshot

Fetched: 2026-10-14
Versions: shadcn@4.21.4, Tailwind CSS v4

Sources:
- https://ui.shadcn.com/docs/installation/next
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/docs/components/button
- https://ui.shadcn.com/docs/components/field

Snapshot for offline reference. Confirm against the live docs when exact behaviour matters.


---

<!-- source: https://ui.shadcn.com/docs/installation/next -->

---
title: Next.js
description: Install and configure shadcn/ui for Next.js.
---

Choose the setup that matches your starting point.

<div className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
  <LinkedCard
    href="#scaffold-with-create"
    className="items-start gap-1 p-6 text-sm md:p-6"
  >
    <div className="font-medium">Use shadcn/create</div>
    <div className="leading-relaxed text-muted-foreground">
      Build your preset and generate a Next.js project command.
    </div>
  </LinkedCard>
  <LinkedCard
    href="#scaffold-with-cli"
    className="items-start gap-1 p-6 text-sm md:p-6"
  >
    <div className="font-medium">Use the CLI</div>
    <div className="leading-relaxed text-muted-foreground">
      Scaffold a new Next.js project directly from the terminal.
    </div>
  </LinkedCard>
  <LinkedCard
    href="#existing-next-project"
    className="items-start gap-1 p-6 text-sm md:p-6"
  >
    <div className="font-medium">Existing Project</div>
    <div className="leading-relaxed text-muted-foreground">
      Configure shadcn/ui manually in an existing Next.js project.
    </div>
  </LinkedCard>
</div>

<div id="scaffold-with-create" className="scroll-mt-24" />
## Use shadcn/create

<Steps>

### Build Your Preset

Open [shadcn/create](/create?template=next) and build your preset visually. Choose your style, colors, fonts, icons, and more.

<Button asChild size="sm">
  <Link
    href="/create?template=next"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-6 no-underline!"
  >
    Open shadcn/create
  </Link>
</Button>

### Create Project

Click `Create Project`, choose your package manager, and copy the generated command.

The generated command will look similar to this:

```bash
npx shadcn@latest init --preset [CODE] --template next
```

The exact command will include your selected options such as `--base`, `--monorepo`, or `--rtl`.

### Add Components

Add the `Card` component to your project:

```bash
npx shadcn@latest add card
```

If you created a monorepo, run the command from `apps/web` or specify the workspace from the repo root:

```bash
npx shadcn@latest add card -c apps/web
```

The command above will add the `Card` component to your project. You can then import it like this:

```tsx showLineNumbers title="app/page.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
        <CardDescription>
          Track progress and recent activity for your Next.js app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        Your design system is ready. Start building your next component.
      </CardContent>
    </Card>
  )
}
```

If you created a monorepo, update `apps/web/app/page.tsx` and import from `@workspace/ui/components/card` instead.

</Steps>

<div id="scaffold-with-cli" className="scroll-mt-24" />
## Use the CLI

<Steps>

### Create Project

Run the `init` command to scaffold a new Next.js project. Follow the prompts to configure your project: base, preset, monorepo, and more.

```bash
npx shadcn@latest init -t next
```

**For a monorepo project, use `--monorepo` flag:**

```bash
npx shadcn@latest init -t next --monorepo
```

### Add Components

Add the `Card` component to your project:

```bash
npx shadcn@latest add card
```

If you created a monorepo, run the command from `apps/web` or specify the workspace from the repo root:

```bash
npx shadcn@latest add card -c apps/web
```

The command above will add the `Card` component to your project. You can then import it like this:

```tsx showLineNumbers title="app/page.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
        <CardDescription>
          Track progress and recent activity for your Next.js app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        Your design system is ready. Start building your next component.
      </CardContent>
    </Card>
  )
}
```

If you created a monorepo, update `apps/web/app/page.tsx` and import from `@workspace/ui/components/card` instead.

</Steps>

<div id="existing-next-project" className="scroll-mt-24" />
## Existing Project

<Steps>

### Create Project

If you need a new Next.js project, create one with `create-next-app`. Otherwise, skip this step.

```bash
npx create-next-app@latest
```

Choose the recommended defaults so Tailwind CSS, the App Router, and the default `@/*` import alias are configured for you.

If you prefer a `src/` directory, use `--src-dir` or choose `Yes` when prompted:

```bash
npx create-next-app@latest --src-dir
```

With `--src-dir`, Next.js places your app in `src/app` and configures the `@/*` alias to point to `./src/*`.

### Configure Tailwind CSS and Import Aliases

If you created your project with the recommended `create-next-app` defaults, you can skip this step.

If you're adding shadcn/ui to an older or custom Next.js app, make sure Tailwind CSS is installed first. You can follow the official [Next.js installation guide](https://nextjs.org/docs/app/getting-started).

Then make sure your `tsconfig.json` includes the `@/*` import alias:

```json title="tsconfig.json" showLineNumbers
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

If you used `--src-dir`, point the alias to `./src/*` instead.

### Run the CLI

Run the `shadcn` init command to set up shadcn/ui in your project.

```bash
npx shadcn@latest init
```

### Add Components

You can now start adding components to your project.

```bash
npx shadcn@latest add button
```

The command above will add the `Button` component to your project. You can then import it like this:

```tsx showLineNumbers title="app/page.tsx"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Button>Click me</Button>
    </div>
  )
}
```

If you used `--src-dir`, add the component to `src/app/page.tsx` instead.

</Steps>

---

<!-- source: https://ui.shadcn.com/docs/cli -->

---
title: shadcn
description: Use the shadcn CLI to add components to your project.
---

import { TriangleAlertIcon } from "lucide-react"

## init

Use the `init` command to initialize configuration and dependencies for an existing project, or create a new project with `--name`.

The `init` command installs dependencies, adds the `cn` util and configures CSS variables for the project.

```bash
npx shadcn@latest init
```

**Options**

```bash
Usage: shadcn init [options] [components...]

initialize your project and install dependencies

Arguments:
  components                 names, url or local path to component

Options:
  -t, --template <template>  the template to use. (next, vite, start, react-router, laravel, astro)
  -b, --base <base>          the component library to use. (base, radix, aria)
  -p, --preset [name]        use a preset configuration
  -y, --yes                  skip confirmation prompt. (default: true)
  -d, --defaults             use default configuration: --template=next --preset=nova (default: false)
  -f, --force                force overwrite of existing configuration. (default: false)
  -c, --cwd <cwd>            the working directory. defaults to the current directory.
  -n, --name <name>          the name for the new project.
  -s, --silent               mute output. (default: false)
  --css-variables            use css variables for theming. (default: true)
  --no-css-variables         do not use css variables for theming.
  --monorepo                 scaffold a monorepo project.
  --no-monorepo              skip the monorepo prompt.
  --rtl                      enable RTL support.
  --no-rtl                   disable RTL support.
  --pointer                  enable pointer cursor for buttons.
  --no-pointer               disable pointer cursor for buttons.
  --reinstall                re-install existing UI components.
  --no-reinstall             do not re-install existing UI components.
  -h, --help                 display help for command
```

The `create` command is an alias for `init`:

```bash
npx shadcn@latest create
```

---

## add

Use the `add` command to add components and dependencies to your project.

```bash
npx shadcn@latest add [component]
```

**Options**

```bash
Usage: shadcn add [options] [components...]

add a component to your project

Arguments:
  components           name, url or local path to component

Options:
  -y, --yes            skip confirmation prompt. (default: false)
  -o, --overwrite      overwrite existing files. (default: false)
  -c, --cwd <cwd>      the working directory. defaults to the current directory.
  -a, --all            add all available components (default: false)
  -p, --path <path>    the path to add the component to.
  -s, --silent         mute output. (default: false)
  --dry-run            preview changes without writing files. (default: false)
  --diff [path]        show diff for a file.
  --view [path]        show file contents.
  -h, --help           display help for command
```

---

## apply

Use the `apply` command to apply a preset to an existing project.

```bash
npx shadcn@latest apply a2r6bw
```

You can apply only the theme or fonts from a preset without reinstalling UI components:

```bash
npx shadcn@latest apply a2r6bw --only theme
```

Supported values for `--only` are `theme` and `font`.

**Options**

```bash
Usage: shadcn apply [options] [preset]

apply a preset to an existing project

Arguments:
  preset             the preset to apply

Options:
  --preset <preset>  preset configuration to apply
  --only [parts]     apply only parts of a preset: theme, font
  -y, --yes          skip confirmation prompt. (default: false)
  -c, --cwd <cwd>    the working directory. defaults to the current directory.
  -s, --silent       mute output. (default: false)
  -h, --help         display help for command
```

---

## preset

Use the `preset` command to inspect preset codes and resolve the preset for an existing project.

```bash
npx shadcn@latest preset decode a2r6bw
```

### preset decode

Use `preset decode` to decode a preset code.

```bash
npx shadcn@latest preset decode a2r6bw
```

**Options**

```bash
Usage: shadcn preset decode [options] <code>

decode a preset code

Arguments:
  code        the preset code to decode

Options:
  --json      output as JSON. (default: false)
  -h, --help  display help for command
```

### preset resolve

Use `preset resolve` to resolve the preset from the current project.

```bash
npx shadcn@latest preset resolve
```

The `preset info` command is an alias for `preset resolve`:

```bash
npx shadcn@latest preset info
```

**Options**

```bash
Usage: shadcn preset resolve|info [options]

resolve a preset from your project

Options:
  -c, --cwd <cwd>  the working directory. defaults to the current directory.
  --json            output as JSON. (default: false)
  -h, --help        display help for command
```

### preset url

Use `preset url` to print the create URL for a preset code.

```bash
npx shadcn@latest preset url a2r6bw
```

**Options**

```bash
Usage: shadcn preset url [options] <code>

get the create URL for a preset code

Arguments:
  code        the preset code

Options:
  -h, --help  display help for command
```

### preset open

Use `preset open` to open a preset code in the browser.

```bash
npx shadcn@latest preset open a2r6bw
```

**Options**

```bash
Usage: shadcn preset open [options] <code>

open a preset code in the browser

Arguments:
  code        the preset code

Options:
  -h, --help  display help for command
```

---

## view

Use the `view` command to view items from the registry before installing them.

```bash
npx shadcn@latest view [item]
```

You can view multiple items at once:

```bash
npx shadcn@latest view button card dialog
```

Or view items from namespaced registries:

```bash
npx shadcn@latest view @acme/auth @v0/dashboard
```

**Options**

```bash
Usage: shadcn view [options] <items...>

view items from the registry

Arguments:
  items            the item names or URLs to view

Options:
  -c, --cwd <cwd>  the working directory. defaults to the current directory.
  -h, --help       display help for command
```

---

## search

Use the `search` command to search for items from registries.

```bash
npx shadcn@latest search [registry]
```

You can search with a query:

```bash
npx shadcn@latest search @shadcn -q "button"
```

Or search multiple registries at once:

```bash
npx shadcn@latest search @shadcn @v0 @acme
```

The `list` command is an alias for `search`:

```bash
npx shadcn@latest list @acme
```

**Options**

```bash
Usage: shadcn search|list [options] <registries...>

search items from registries

Arguments:
  registries             the registry names or urls to search items from. Names
                         must be prefixed with @.

Options:
  -c, --cwd <cwd>        the working directory. defaults to the current directory.
  -q, --query <query>    query string
  -l, --limit <number>   maximum number of items to display per registry (default: "100")
  -o, --offset <number>  number of items to skip (default: "0")
  -h, --help             display help for command
```

---

## build

Use the `build` command to generate the registry JSON files.

```bash
npx shadcn@latest build
```

This command reads the `registry.json` file and generates the registry JSON files in the `public/r` directory.

**Options**

```bash
Usage: shadcn build [options] [registry]

build components for a shadcn registry

Arguments:
  registry             path to registry.json file (default: "./registry.json")

Options:
  -o, --output <path>  destination directory for json files (default: "./public/r")
  -c, --cwd <cwd>      the working directory. defaults to the current directory.
  -h, --help           display help for command
```

To customize the output directory, use the `--output` option.

```bash
npx shadcn@latest build --output ./public/registry
```

---

## docs

Use the `docs` command to fetch documentation and API references for components.

```bash
npx shadcn@latest docs [component]
```

**Options**

```bash
Usage: shadcn docs [options] [component]

fetch documentation and API references for components

Arguments:
  component          the component to get docs for

Options:
  -c, --cwd <cwd>    the working directory. defaults to the current directory.
  -b, --base <base>  the base to use: base, radix, or aria. defaults to project base.
  --json             output as JSON. (default: false)
  -h, --help         display help for command
```

---

## info

Use the `info` command to get information about your project.

```bash
npx shadcn@latest info
```

**Options**

```bash
Usage: shadcn info [options]

get information about your project

Options:
  -c, --cwd <cwd>  the working directory. defaults to the current directory.
  --json            output as JSON. (default: false)
  -h, --help        display help for command
```

---

## migrate

Use the `migrate` command to run migrations on your project.

```bash
npx shadcn@latest migrate [migration]
```

**Available Migrations**

| Migration    | Description                                             |
| ------------ | ------------------------------------------------------- |
| `cn`         | Migrate `clsx` and `tailwind-merge` to `cn`.            |
| `icons`      | Migrate your UI components to a different icon library. |
| `base-color` | Migrate your theme to a different base color.           |
| `radix`      | Migrate to radix-ui.                                    |
| `rtl`        | Migrate your components to support RTL (right-to-left). |

**Options**

```bash
Usage: shadcn migrate [options] [migration] [path]

run a migration.

Arguments:
  migration          the migration to run.
  path               optional path or glob pattern to migrate.

Options:
  -c, --cwd <cwd>    the working directory. defaults to the current directory.
  -l, --list         list all migrations. (default: false)
  -y, --yes          skip confirmation prompt. (default: false)
  -f, --from <name>  the base color or icon library to migrate from.
  -t, --to <name>    the base color or icon library to migrate to.
  -h, --help         display help for command
```

---

### migrate cn

The `cn` migration replaces `clsx`, `tailwind-merge` and `cnfast` with [`cn`](https://github.com/shadcn-ui/cn).

```bash
npx shadcn@latest migrate cn
```

Unlike the other migrations, `migrate cn` does not require a `components.json` file. You can run it in any JavaScript or TypeScript package project using Tailwind CSS v4.

This will:

1. Rewrite imports from `clsx`, `clsx/lite`, `tailwind-merge` and `cnfast`.
2. Replace `twMerge(clsx(...))` compositions with direct `cn(...)` calls.
3. Replace the standard shadcn utility with a direct re-export.
4. Install `cn` and remove the old packages when no references remain.

**Before**

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**After**

```tsx
export { cn } from "cn"
```

The migration also preserves separate APIs when they are used independently:

```diff
- import { clsx } from "clsx"
- import { twMerge } from "tailwind-merge"
+ import { clsx, twMerge } from "cn"
```

Because `cnfast` has the same root API, its module specifiers are replaced directly:

```diff
- import { cn } from "cnfast"
+ import { cn } from "cn"
```

Custom configuration APIs are moved to `cn/config`. Existing local names are preserved when an export was renamed:

```diff
- import { createTailwindMerge, getDefaultConfig } from "tailwind-merge"
+ import {
+   createTwMerge as createTailwindMerge,
+   defaultConfig as getDefaultConfig,
+ } from "cn/config"
```

<Callout icon={<TriangleAlertIcon />}>
  The `cn` merge engine supports Tailwind CSS v4, like `tailwind-merge` v3.
  Projects using Tailwind CSS v3 should continue using `tailwind-merge` v2. A
  `clsx`-only migration is safe in a Tailwind CSS v3 project.
</Callout>

**Migrate specific files**

You can migrate a file, directory or glob pattern:

```bash
# Migrate a specific file.
npx shadcn@latest migrate cn src/lib/utils.ts

# Migrate files matching a glob pattern.
npx shadcn@latest migrate cn "src/**/*.{ts,tsx}"
```

Scoped migrations install `cn` but keep `clsx`, `tailwind-merge` and `cnfast` in `package.json`, because files outside the selected path may still use them.

The command leaves unsupported imports unchanged and reports them for manual review. This includes `experimentalParseClassName`, namespace imports, dynamic import shapes, direct calls to `validators` and variadic `createTailwindMerge` calls that cannot be migrated safely. An old dependency is retained whenever one of its references remains.

---

### migrate icons

The `icons` migration moves your components from one icon library to another.

```bash
npx shadcn@latest migrate icons
```

This will prompt you for the source and target libraries, rewrite icon imports and JSX usage in your `ui` directory, install the target library and update `iconLibrary` in your `components.json` so future `npx shadcn add` installs use the new library.

The following libraries are supported: `lucide`, `tabler`, `hugeicons`, `phosphor`, `remixicon` and `radix` (legacy).

**Non-interactive**

Use `--from` and `--to` to skip the prompts:

```bash
npx shadcn@latest migrate icons --from lucide --to phosphor --yes
```

**Migrate specific files**

You can migrate specific files or use glob patterns. Scoped runs do not update `components.json`.

```bash
# Migrate a specific file.
npx shadcn@latest migrate icons src/components/ui/button.tsx --from lucide --to tabler

# Migrate files matching a glob pattern.
npx shadcn@latest migrate icons "src/components/**" --from lucide --to tabler
```

Icons without an equivalent in the target library are left untouched and reported at the end of the migration.

---

### migrate base-color

The `base-color` migration switches your theme from one base color to another.

```bash
npx shadcn@latest migrate base-color
```

This will prompt you for the source and target base colors, rewrite the theme CSS variables (the CSS file configured by `tailwind.css` in your `components.json`) and update `baseColor` so future `npx shadcn add` installs use the new base color.

The following base colors are supported: `neutral`, `zinc`, `stone`, `mauve`, `olive`, `mist` and `taupe`.

**Non-interactive**

Use `--to` to migrate from the current `baseColor` in your `components.json`, or pass both `--from` and `--to` explicitly.

```bash
npx shadcn@latest migrate base-color --to zinc --yes
```

Theme tokens that no longer match the source base color are left untouched and reported at the end of the migration.

---

### migrate rtl

The `rtl` migration transforms your components to support RTL (right-to-left) languages.

```bash
npx shadcn@latest migrate rtl
```

This will:

1. Update `components.json` to set `rtl: true`
2. Transform physical CSS properties to logical equivalents (e.g., `ml-4` → `ms-4`, `text-left` → `text-start`)
3. Add `rtl:` variants where needed (e.g., `space-x-4` → `space-x-4 rtl:space-x-reverse`)

**Migrate specific files**

You can migrate specific files or use glob patterns:

```bash
# Migrate a specific file
npx shadcn@latest migrate rtl src/components/ui/button.tsx

# Migrate files matching a glob pattern
npx shadcn@latest migrate rtl "src/components/ui/**"
```

If no path is provided, the migration will transform all files in your `ui` directory (from `components.json`).

---

### migrate radix

The `radix` migration updates your imports from individual `@radix-ui/react-*` packages to the unified `radix-ui` package.

```bash
npx shadcn@latest migrate radix
```

This will:

1. Transform imports from `@radix-ui/react-*` to `radix-ui`
2. Add the `radix-ui` package to your `package.json`

**Before**

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as SelectPrimitive from "@radix-ui/react-select"
```

**After**

```tsx
import { Dialog as DialogPrimitive, Select as SelectPrimitive } from "radix-ui"
```

**Migrate specific files**

You can migrate specific files or use glob patterns:

```bash
# Migrate a specific file.
npx shadcn@latest migrate radix src/components/ui/dialog.tsx

# Migrate files matching a glob pattern.
npx shadcn@latest migrate radix "src/components/ui/**"
```

If no path is provided, the migration will transform all files in your `ui` directory (from `components.json`).

Once complete, you can remove any unused `@radix-ui/react-*` packages from your `package.json`.

---

## eject

When you run `init`, shadcn adds `@import "shadcn/tailwind.css"` to your global CSS file. This import provides shared Tailwind v4 utilities such as custom variants (`data-open:`, `data-closed:`, etc.) and accordion animations.

Use the `eject` command to inline `shadcn/tailwind.css` into your global CSS file and remove the `shadcn` dependency from your project.

<Callout icon={<TriangleAlertIcon />}>
  **Note: This action is irreversible.** After ejecting, future shadcn CLI
  updates to `shadcn/tailwind.css` will not apply automatically.
</Callout>

```bash
npx shadcn@latest eject
```

**Before**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

**After**

```css
@import "tailwindcss";
@import "tw-animate-css";
/* ejected from shadcn@4.8.3 */
@theme inline {
  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(
        --radix-accordion-content-height,
        var(--accordion-panel-height, auto)
      );
    }
  }
}

@custom-variant data-open {
  &:where([data-state="open"]),
  &:where([data-open]:not([data-open="false"])) {
    @slot;
  }
}

@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
```

**Monorepo**

In a monorepo, run the command from the workspace that contains your `components.json` and global CSS file:

```bash
npx shadcn@latest eject -c packages/ui
```

**Options**

```bash
Usage: shadcn eject [options]

inline shadcn/tailwind.css and remove the shadcn dependency

Options:
  -c, --cwd <cwd>  the working directory. defaults to the current directory.
  -y, --yes        skip confirmation prompt. (default: false)
  -s, --silent     mute output. (default: false)
  -h, --help       display help for command
```

---

<!-- source: https://ui.shadcn.com/docs/components/button -->

---
title: Button
description: Displays a button or a component that looks like a button.
featured: true
base: base
component: true
---

```tsx
import { ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  )
}

```

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add button
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install @base-ui/react
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="button"
  title="components/ui/button.tsx"
  styleName="base-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Button } from "@/components/ui/button"
```

```tsx
<Button variant="outline">Button</Button>
```

## Cursor

Tailwind v4 [switched](https://tailwindcss.com/docs/upgrade-guide#buttons-use-the-default-cursor) from `cursor: pointer` to `cursor: default` for the button component.

If you want to keep the `cursor: pointer` behavior, add the following code to your CSS file:

You can also enable this during project setup with `npx shadcn@latest init --pointer`.

```css showLineNumbers title="globals.css"
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

## Size

Use the `size` prop to change the size of the button.

```tsx
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonSize() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <Button size="xs" variant="outline">
          Extra Small
        </Button>
        <Button size="icon-xs" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="icon-sm" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button size="icon" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="lg">
          Large
        </Button>
        <Button size="icon-lg" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
    </div>
  )
}

```

## Default

```tsx
import { Button } from "@/components/ui/button"

export function ButtonDefault() {
  return <Button>Button</Button>
}

```

## Outline

```tsx
import { Button } from "@/components/ui/button"

export function ButtonOutline() {
  return <Button variant="outline">Outline</Button>
}

```

## Secondary

```tsx
import { Button } from "@/components/ui/button"

export function ButtonSecondary() {
  return <Button variant="secondary">Secondary</Button>
}

```

## Ghost

```tsx
import { Button } from "@/components/ui/button"

export function ButtonGhost() {
  return <Button variant="ghost">Ghost</Button>
}

```

## Destructive

```tsx
import { Button } from "@/components/ui/button"

export function ButtonDestructive() {
  return <Button variant="destructive">Destructive</Button>
}

```

## Link

```tsx
import { Button } from "@/components/ui/button"

export function ButtonLink() {
  return <Button variant="link">Link</Button>
}

```

## Icon

```tsx
import { CircleFadingArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonIcon() {
  return (
    <Button variant="outline" size="icon">
      <CircleFadingArrowUpIcon />
    </Button>
  )
}

```

## With Icon

Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the icon for the correct spacing.

```tsx
import { IconGitBranch, IconGitFork } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export function ButtonWithIcon() {
  return (
    <div className="flex gap-2">
      <Button variant="outline">
        <IconGitBranch data-icon="inline-start" /> New Branch
      </Button>
      <Button variant="outline">
        Fork
        <IconGitFork data-icon="inline-end" />
      </Button>
    </div>
  )
}

```

## Rounded

Use the `rounded-full` class to make the button rounded.

```tsx
import { ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonRounded() {
  return (
    <div className="flex gap-2">
      <Button className="rounded-full">Get Started</Button>
      <Button variant="outline" size="icon" className="rounded-full">
        <ArrowUpIcon />
      </Button>
    </div>
  )
}

```

## Spinner

Render a `<Spinner />` component inside the button to show a loading state. Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the spinner for the correct spacing.

```tsx
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function ButtonLoading() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled>
        <Spinner data-icon="inline-start" />
        Generating
      </Button>
      <Button variant="secondary" disabled>
        Downloading
        <Spinner data-icon="inline-start" />
      </Button>
    </div>
  )
}

```

## Button Group

To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/base/button-group) documentation for more details.

```tsx
"use client"

import * as React from "react"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ButtonGroupDemo() {
  const [label, setLabel] = React.useState("personal")

  return (
    <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back">
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" aria-label="More Options" />
            }
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <MailCheckIcon />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArchiveIcon />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ClockIcon />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarPlusIcon />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListFilterIcon />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <TagIcon />
                  Label As...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={label}
                    onValueChange={setLabel}
                  >
                    <DropdownMenuRadioItem value="personal">
                      Personal
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">
                      Work
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">
                      Other
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}

```

## As Link

You can use the `buttonVariants` helper to make a link look like a button.

**Do not use `<Button render={<a />} nativeButton={false} />` for links.** The Base UI `Button` component always applies `role="button"`, which overrides the semantic link role on `<a>` elements. Use `buttonVariants` with a plain `<a>` tag instead.

```tsx
import { buttonVariants } from "@/components/ui/button"

export function ButtonRender() {
  return (
    <a
      href="#"
      className={buttonVariants({ variant: "secondary", size: "sm" })}
    >
      Login
    </a>
  )
}

```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

```tsx
"use client"

import { ArrowRightIcon, PlusIcon } from "lucide-react"

import {
  useTranslation,
  type Translations,
} from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const translations: Translations = {
  en: {
    dir: "ltr",
    values: {
      button: "Button",
      submit: "Submit",
      delete: "Delete",
      loading: "Loading",
    },
  },
  ar: {
    dir: "rtl",
    values: {
      button: "زر",
      submit: "إرسال",
      delete: "حذف",
      loading: "جاري التحميل",
    },
  },
  he: {
    dir: "rtl",
    values: {
      button: "כפתור",
      submit: "שלח",
      delete: "מחק",
      loading: "טוען",
    },
  },
}

export function ButtonRtl() {
  const { dir, t } = useTranslation(translations, "ar")

  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row" dir={dir}>
      <Button variant="outline">{t.button}</Button>
      <Button variant="destructive">{t.delete}</Button>
      <Button variant="outline">
        {t.submit}{" "}
        <ArrowRightIcon className="rtl:rotate-180" data-icon="inline-end" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button variant="secondary" disabled>
        <Spinner data-icon="inline-start" /> {t.loading}
      </Button>
    </div>
  )
}

```

## API Reference

### Button

The `Button` component is a wrapper around the `button` element that adds a variety of styles and functionality.

| Prop      | Type                                                                                 | Default     |
| --------- | ------------------------------------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "outline" \| "ghost" \| "destructive" \| "secondary" \| "link"`        | `"default"` |
| `size`    | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` |

---

<!-- source: https://ui.shadcn.com/docs/components/field -->

---
title: Field
description: Combine labels, controls, and help text to compose accessible form fields and grouped inputs.
base: base
component: true
---

```tsx
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const months = [
  { label: "MM", value: null },
  { label: "01", value: "01" },
  { label: "02", value: "02" },
  { label: "03", value: "03" },
  { label: "04", value: "04" },
  { label: "05", value: "05" },
  { label: "06", value: "06" },
  { label: "07", value: "07" },
  { label: "08", value: "08" },
  { label: "09", value: "09" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
]

const years = [
  { label: "YYYY", value: null },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
]

export function FieldDemo() {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  Name on Card
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  Card Number
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6">
                    Month
                  </FieldLabel>
                  <Select items={months}>
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {months.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                    Year
                  </FieldLabel>
                  <Select items={years}>
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {years.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="checkout-7j9-same-as-shipping-wgm"
                  className="font-normal"
                >
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

```

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add field
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="field"
  title="components/ui/field.tsx"
  styleName="base-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
```

```tsx showLineNumbers
<FieldSet>
  <FieldLegend>Profile</FieldLegend>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Full name</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid />
      <FieldError>Choose another username.</FieldError>
    </Field>
    <Field orientation="horizontal">
      <Switch id="newsletter" />
      <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

## Composition

### Field

A single control with label, helper text, and validation.

```text
Field
├── FieldLabel
├── Input / Textarea / Switch / Select
├── FieldDescription
└── FieldError
```

### FieldGroup

Related fields in one group. Use `FieldSeparator` between sections when needed.

```text
FieldGroup
├── Field
│   ├── FieldLabel
│   ├── Input / Textarea / Switch / Select
│   ├── FieldDescription
│   └── FieldError
├── FieldSeparator
└── Field
    ├── FieldLabel
    └── Input / Textarea / Switch / Select
```

### FieldSet

Semantic grouping with a legend and description, usually containing a `FieldGroup`.

```text
FieldSet
├── FieldLegend
├── FieldDescription
└── FieldGroup
    ├── Field
    │   ├── FieldLabel
    │   ├── Input / Textarea / Switch / Select
    │   ├── FieldDescription
    │   └── FieldError
    └── Field
        ├── FieldLabel
        └── Input / Textarea / Switch / Select
```

## Anatomy

The `Field` family is designed for composing accessible forms. A typical field is structured as follows:

```tsx showLineNumbers
<Field>
  <FieldLabel htmlFor="input-id">Label</FieldLabel>
  {/* Input, Select, Switch, etc. */}
  <FieldDescription>Optional helper text.</FieldDescription>
  <FieldError>Validation message.</FieldError>
</Field>
```

- `Field` is the core wrapper for a single field.
- `FieldContent` is a flex column that groups label and description. Not required if you have no description.
- Wrap related fields with `FieldGroup`, and use `FieldSet` with `FieldLegend` for semantic grouping.

## Form

See the [Form](/docs/forms) documentation for building forms with the `Field` component and [React Hook Form](/docs/forms/react-hook-form), [Tanstack Form](/docs/forms/tanstack-form), or [Formisch](/docs/forms/formisch).

## Input

```tsx
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FieldInput() {
  return (
    <FieldSet className="w-full max-w-xs">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" type="text" placeholder="Max Leiter" />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          <Input id="password" type="password" placeholder="••••••••" />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

```

## Textarea

```tsx
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function FieldTextarea() {
  return (
    <FieldSet className="w-full max-w-xs">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
          <Textarea
            id="feedback"
            placeholder="Your feedback helps us improve..."
            rows={4}
          />
          <FieldDescription>
            Share your thoughts about our service.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

```

## Select

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const items = [
  { label: "Choose department", value: null },
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Customer Support", value: "support" },
  { label: "Human Resources", value: "hr" },
  { label: "Finance", value: "finance" },
  { label: "Operations", value: "operations" },
]

export function FieldSelect() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Department</FieldLabel>
      <Select items={items}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>
        Select your department or area of work.
      </FieldDescription>
    </Field>
  )
}

```

## Slider

```tsx
"use client"

import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"

export function FieldSlider() {
  const [value, setValue] = React.useState([200, 800])

  return (
    <Field className="w-full max-w-xs">
      <FieldTitle>Price Range</FieldTitle>
      <FieldDescription>
        Set your budget range ($
        <span className="font-medium tabular-nums">{value[0]}</span> -{" "}
        <span className="font-medium tabular-nums">{value[1]}</span>).
      </FieldDescription>
      <Slider
        value={value}
        onValueChange={(value) => setValue(value as [number, number])}
        max={1000}
        min={0}
        step={10}
        className="mt-2 w-full"
        aria-label="Price Range"
      />
    </Field>
  )
}

```

## Fieldset

```tsx
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FieldFieldset() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street Address</FieldLabel>
          <Input id="street" type="text" placeholder="123 Main St" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" type="text" placeholder="New York" />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
            <Input id="zip" type="text" placeholder="90502" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

```

## Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

export function FieldCheckbox() {
  return (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLegend variant="label">
          Show these items on the desktop
        </FieldLegend>
        <FieldDescription>
          Select the items you want to show on the desktop.
        </FieldDescription>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-hard-disks-ljj" />
            <FieldLabel
              htmlFor="finder-pref-9k2-hard-disks-ljj"
              className="font-normal"
              defaultChecked
            >
              Hard disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-external-disks-1yg" />
            <FieldLabel
              htmlFor="finder-pref-9k2-external-disks-1yg"
              className="font-normal"
            >
              External disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
            <FieldLabel
              htmlFor="finder-pref-9k2-cds-dvds-fzt"
              className="font-normal"
            >
              CDs, DVDs, and iPods
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
            <FieldLabel
              htmlFor="finder-pref-9k2-connected-servers-6l2"
              className="font-normal"
            >
              Connected servers
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox id="finder-pref-9k2-sync-folders-nep" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="finder-pref-9k2-sync-folders-nep">
            Sync Desktop & Documents folders
          </FieldLabel>
          <FieldDescription>
            Your Desktop & Documents folders are being synced with iCloud Drive.
            You can access them from other devices.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}

```

## Radio

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function FieldRadio() {
  return (
    <FieldSet className="w-full max-w-xs">
      <FieldLegend variant="label">Subscription Plan</FieldLegend>
      <FieldDescription>
        Yearly and lifetime plans offer significant savings.
      </FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem value="monthly" id="plan-monthly" />
          <FieldLabel htmlFor="plan-monthly" className="font-normal">
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="yearly" id="plan-yearly" />
          <FieldLabel htmlFor="plan-yearly" className="font-normal">
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="lifetime" id="plan-lifetime" />
          <FieldLabel htmlFor="plan-lifetime" className="font-normal">
            Lifetime ($299.99)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  )
}

```

## Switch

```tsx
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export function FieldSwitch() {
  return (
    <Field orientation="horizontal" className="w-fit">
      <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
      <Switch id="2fa" />
    </Field>
  )
}

```

## Choice Card

Wrap `Field` components inside `FieldLabel` to create selectable field groups. This works with `RadioItem`, `Checkbox` and `Switch` components.

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function FieldChoiceCard() {
  return (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLegend variant="label">Compute Environment</FieldLegend>
        <FieldDescription>
          Select the compute environment for your cluster.
        </FieldDescription>
        <RadioGroup defaultValue="kubernetes">
          <FieldLabel htmlFor="kubernetes-r2h">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Kubernetes</FieldTitle>
                <FieldDescription>
                  Run GPU workloads on a K8s cluster.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="kubernetes" id="kubernetes-r2h" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="vm-z4k">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Virtual Machine</FieldTitle>
                <FieldDescription>
                  Access a cluster to run GPU workloads.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="vm" id="vm-z4k" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  )
}

```

## Field Group

Stack `Field` components with `FieldGroup`. Add `FieldSeparator` to divide them.

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

export function FieldGroupExample() {
  return (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLabel>Responses</FieldLabel>
        <FieldDescription>
          Get notified when ChatGPT responds to requests that take time, like
          research or image generation.
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal">
            <Checkbox id="push" defaultChecked disabled />
            <FieldLabel htmlFor="push" className="font-normal">
              Push notifications
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldLabel>Tasks</FieldLabel>
        <FieldDescription>
          Get notified when tasks you&apos;ve created have updates.{" "}
          <a href="#">Manage tasks</a>
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal">
            <Checkbox id="push-tasks" />
            <FieldLabel htmlFor="push-tasks" className="font-normal">
              Push notifications
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="email-tasks" />
            <FieldLabel htmlFor="email-tasks" className="font-normal">
              Email notifications
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  )
}

```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

```tsx
"use client"

import * as React from "react"

import {
  useTranslation,
  type Translations,
} from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const months = [
  { label: "MM", value: null },
  { label: "01", value: "01" },
  { label: "02", value: "02" },
  { label: "03", value: "03" },
  { label: "04", value: "04" },
  { label: "05", value: "05" },
  { label: "06", value: "06" },
  { label: "07", value: "07" },
  { label: "08", value: "08" },
  { label: "09", value: "09" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
]

const years = [
  { label: "YYYY", value: null },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
]

const translations: Translations = {
  en: {
    dir: "ltr",
    values: {
      paymentMethod: "Payment Method",
      secureTransactions: "All transactions are secure and encrypted",
      nameOnCard: "Name on Card",
      cardNumber: "Card Number",
      cardNumberDescription: "Enter your 16-digit card number",
      month: "Month",
      year: "Year",
      cvv: "CVV",
      monthPlaceholder: "MM",
      month01: "01",
      month02: "02",
      month03: "03",
      month04: "04",
      month05: "05",
      month06: "06",
      month07: "07",
      month08: "08",
      month09: "09",
      month10: "10",
      month11: "11",
      month12: "12",
      billingAddress: "Billing Address",
      billingAddressDescription:
        "The billing address associated with your payment method",
      sameAsShipping: "Same as shipping address",
      comments: "Comments",
      commentsPlaceholder: "Add any additional comments",
      submit: "Submit",
      cancel: "Cancel",
    },
  },
  ar: {
    dir: "rtl",
    values: {
      paymentMethod: "طريقة الدفع",
      secureTransactions: "جميع المعاملات آمنة ومشفرة",
      nameOnCard: "الاسم على البطاقة",
      cardNumber: "رقم البطاقة",
      cardNumberDescription: "أدخل رقم البطاقة المكون من 16 رقمًا",
      month: "الشهر",
      year: "السنة",
      cvv: "CVV",
      monthPlaceholder: "ش.ش",
      month01: "٠١",
      month02: "٠٢",
      month03: "٠٣",
      month04: "٠٤",
      month05: "٠٥",
      month06: "٠٦",
      month07: "٠٧",
      month08: "٠٨",
      month09: "٠٩",
      month10: "١٠",
      month11: "١١",
      month12: "١٢",
      billingAddress: "عنوان الفوترة",
      billingAddressDescription: "عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك",
      sameAsShipping: "نفس عنوان الشحن",
      comments: "تعليقات",
      commentsPlaceholder: "أضف أي تعليقات إضافية",
      submit: "إرسال",
      cancel: "إلغاء",
    },
  },
  he: {
    dir: "rtl",
    values: {
      paymentMethod: "אמצעי תשלום",
      secureTransactions: "כל העסקאות מאובטחות ומוצפנות",
      nameOnCard: "שם על הכרטיס",
      cardNumber: "מספר כרטיס",
      cardNumberDescription: "הזן את מספר הכרטיס בן 16 הספרות שלך",
      month: "חודש",
      year: "שנה",
      cvv: "CVV",
      monthPlaceholder: "MM",
      month01: "01",
      month02: "02",
      month03: "03",
      month04: "04",
      month05: "05",
      month06: "06",
      month07: "07",
      month08: "08",
      month09: "09",
      month10: "10",
      month11: "11",
      month12: "12",
      billingAddress: "כתובת חיוב",
      billingAddressDescription: "כתובת החיוב המשויכת לאמצעי התשלום שלך",
      sameAsShipping: "זהה לכתובת המשלוח",
      comments: "הערות",
      commentsPlaceholder: "הוסף הערות נוספות",
      submit: "שלח",
      cancel: "בטל",
    },
  },
}

export function FieldRtl() {
  const { dir, t } = useTranslation(translations, "ar")

  const getMonthLabel = (value: string | null): string => {
    if (value === null) return t.monthPlaceholder
    const monthKey = `month${value}` as keyof typeof t
    return t[monthKey] || value
  }

  return (
    <div className="w-full max-w-md py-6" dir={dir}>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>{t.paymentMethod}</FieldLegend>
            <FieldDescription>{t.secureTransactions}</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j-rtl">
                  {t.nameOnCard}
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j-rtl"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1-rtl">
                  {t.cardNumber}
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1-rtl"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>{t.cardNumberDescription}</FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6-rtl">
                    {t.month}
                  </FieldLabel>
                  <Select items={months}>
                    <SelectTrigger id="checkout-exp-month-ts6-rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectGroup>
                        {months.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {getMonthLabel(item.value)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59-rtl">
                    {t.year}
                  </FieldLabel>
                  <Select items={years}>
                    <SelectTrigger id="checkout-7j9-exp-year-f59-rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectGroup>
                        {years.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv-rtl">
                    {t.cvv}
                  </FieldLabel>
                  <Input id="checkout-7j9-cvv-rtl" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>{t.billingAddress}</FieldLegend>
            <FieldDescription>{t.billingAddressDescription}</FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm-rtl"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="checkout-7j9-same-as-shipping-wgm-rtl"
                  className="font-normal"
                >
                  {t.sameAsShipping}
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments-rtl">
                  {t.comments}
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments-rtl"
                  placeholder={t.commentsPlaceholder}
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">{t.submit}</Button>
            <Button variant="outline" type="button">
              {t.cancel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

```

## Responsive Layout

- **Vertical fields:** Default orientation stacks label, control, and helper text—ideal for mobile-first layouts.
- **Horizontal fields:** Set `orientation="horizontal"` on `Field` to align the label and control side-by-side. Pair with `FieldContent` to keep descriptions aligned.
- **Responsive fields:** Set `orientation="responsive"` for automatic column layouts inside container-aware parents. Apply `@container/field-group` classes on `FieldGroup` to switch orientations at specific breakpoints.

```tsx
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FieldResponsive() {
  return (
    <div className="w-full max-w-lg">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>
                  Provide your full name for identification
                </FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}

```

## Validation and Errors

- Add `data-invalid` to `Field` to switch the entire block into an error state.
- Add `aria-invalid` on the input itself for assistive technologies.
- Render `FieldError` immediately after the control or inside `FieldContent` to keep error messages aligned with the field.

```tsx showLineNumbers /data-invalid/ /aria-invalid/
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" aria-invalid />
  <FieldError>Enter a valid email address.</FieldError>
</Field>
```

## Accessibility

- `FieldSet` and `FieldLegend` keep related controls grouped for keyboard and assistive tech users.
- `Field` outputs `role="group"` so nested controls inherit labeling from `FieldLabel` and `FieldLegend` when combined.
- Apply `FieldSeparator` sparingly to ensure screen readers encounter clear section boundaries.

## API Reference

### FieldSet

Container that renders a semantic `fieldset` with spacing presets.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldSet>
  <FieldLegend>Delivery</FieldLegend>
  <FieldGroup>{/* Fields */}</FieldGroup>
</FieldSet>
```

### FieldLegend

Legend element for a `FieldSet`. Switch to the `label` variant to align with label sizing.

| Prop        | Type                  | Default    |
| ----------- | --------------------- | ---------- |
| `variant`   | `"legend" \| "label"` | `"legend"` |
| `className` | `string`              |            |

```tsx
<FieldLegend variant="label">Notification Preferences</FieldLegend>
```

The `FieldLegend` has two variants: `legend` and `label`. The `label` variant applies label sizing and alignment. Handy if you have nested `FieldSet`.

### FieldGroup

Layout wrapper that stacks `Field` components and enables container queries for responsive orientations.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldGroup className="@container/field-group flex flex-col gap-6">
  <Field>{/* ... */}</Field>
  <Field>{/* ... */}</Field>
</FieldGroup>
```

### Field

The core wrapper for a single field. Provides orientation control, invalid state styling, and spacing.

| Prop           | Type                                         | Default      |
| -------------- | -------------------------------------------- | ------------ |
| `orientation`  | `"vertical" \| "horizontal" \| "responsive"` | `"vertical"` |
| `className`    | `string`                                     |              |
| `data-invalid` | `boolean`                                    |              |

```tsx
<Field orientation="horizontal">
  <FieldLabel htmlFor="remember">Remember me</FieldLabel>
  <Switch id="remember" />
</Field>
```

### FieldContent

Flex column that groups control and descriptions when the label sits beside the control. Not required if you have no description.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<Field>
  <Checkbox id="notifications" />
  <FieldContent>
    <FieldLabel htmlFor="notifications">Notifications</FieldLabel>
    <FieldDescription>Email, SMS, and push options.</FieldDescription>
  </FieldContent>
</Field>
```

### FieldLabel

Label styled for both direct inputs and nested `Field` children.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldLabel htmlFor="email">Email</FieldLabel>
```

### FieldTitle

Renders a title with label styling inside `FieldContent`.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldContent>
  <FieldTitle>Enable Touch ID</FieldTitle>
  <FieldDescription>Unlock your device faster.</FieldDescription>
</FieldContent>
```

### FieldDescription

Helper text slot that automatically balances long lines in horizontal layouts.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldDescription>We never share your email with anyone.</FieldDescription>
```

### FieldSeparator

Visual divider to separate sections inside a `FieldGroup`. Accepts optional inline content.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldSeparator>Or continue with</FieldSeparator>
```

### FieldError

Accessible error container that accepts children or an `errors` array (e.g., from `react-hook-form`).

| Prop        | Type                                       | Default |
| ----------- | ------------------------------------------ | ------- |
| `errors`    | `Array<{ message?: string } \| undefined>` |         |
| `className` | `string`                                   |         |

```tsx
<FieldError errors={errors.username} />
```

When the `errors` array contains multiple messages, the component renders a list automatically.

`FieldError` also accepts issues produced by any validator that implements [Standard Schema](https://standardschema.dev/), including Zod, Valibot, and ArkType. Pass the `issues` array from the schema result directly to render a unified error list across libraries.
