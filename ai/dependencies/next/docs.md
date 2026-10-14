# Next.js — docs snapshot

Fetched: 2026-10-14
Versions: next@16.4.0 (App Router)

Sources:
- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- https://nextjs.org/docs/app/guides/environment-variables
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy

Snapshot for offline reference. Confirm against the live docs when exact behaviour matters.


---

<!-- source: https://nextjs.org/docs/app/getting-started/installation -->

---
title: Installation
description: "Learn how to create a new Next.js application with the `create-next-app` CLI, and set up TypeScript, ESLint, and Module Path Aliases."
url: "https://nextjs.org/docs/app/getting-started/installation"
docs_index: /docs/llms.txt
lastUpdated: 2026-10-02
prerequisites:
  - "Getting Started: /docs/app/getting-started"
---

> For an index of all documentation, see [/docs/llms.txt](/docs/llms.txt).

Create a new Next.js app and run it locally.

## Quick start

1. Create a new Next.js app named `my-app`
2. `cd my-app` and start the dev server.
3. Visit `http://localhost:3000`.

```bash
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
```

```bash
npx create-next-app@latest my-app --yes
cd my-app
npm run dev
```

```bash
yarn create next-app@latest my-app --yes
cd my-app
yarn dev
```

```bash
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

- `--yes` skips prompts using saved preferences or defaults. The default setup enables TypeScript, Tailwind CSS, ESLint, App Router, and Turbopack, with import alias `@/*`, and includes `AGENTS.md` to guide coding agents to write up-to-date Next.js code.

## System requirements

Before you begin, make sure your development environment meets the following requirements:

- Minimum Node.js version: [20.9](https://nodejs.org/)
- Operating systems: macOS, Windows (including WSL), and Linux.

## Supported browsers

Next.js supports modern browsers with zero configuration.

- Chrome 111+
- Edge 111+
- Firefox 111+
- Safari 16.4+

Learn more about [browser support](/docs/architecture/supported-browsers), including how to configure polyfills and target specific browsers.

## Create with the CLI

The quickest way to create a new Next.js app is using [`create-next-app`](/docs/app/api-reference/cli/create-next-app), which sets up everything automatically for you. To create a project, run:

```bash
pnpm create next-app
```

```bash
npx create-next-app@latest
```

```bash
yarn create next-app
```

```bash
bun create next-app
```

On installation, you'll see the following prompts:

```txt title="Terminal"
What is your project named? my-app
Would you like to use the recommended Next.js defaults?
    Yes, use recommended defaults - TypeScript, ESLint, No React Compiler, Tailwind CSS, No src/ directory, App Router, Cache Components, AGENTS.md
    No, reuse previous settings
    No, customize settings - Choose your own preferences
```

If you choose to `customize settings`, you'll see the following prompts:

```txt title="Terminal"
Would you like to use TypeScript? No / Yes
Which linter would you like to use? ESLint / Biome / None
Would you like to use React Compiler? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to use Cache Components? No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
Would you like to include AGENTS.md to guide coding agents to write up-to-date Next.js code? No / Yes
```

After the prompts, [`create-next-app`](/docs/app/api-reference/cli/create-next-app) will create a folder with your project name and install the required dependencies.

## Manual installation

To manually create a new Next.js app, install the required packages:

```bash
pnpm i next@latest react@latest react-dom@latest
```

```bash
npm i next@latest react@latest react-dom@latest
```

```bash
yarn add next@latest react@latest react-dom@latest
```

```bash
bun add next@latest react@latest react-dom@latest
```

> **Good to know:**
>
> - The `App Router` uses [React canary releases](https://react.dev/blog/2023/05/03/react-canaries) built-in, which include all the stable React 19 changes, as well as newer features being validated in frameworks, but you should still declare react and react-dom in package.json for tooling and ecosystem compatibility.
> - The `Pages Router` uses the React version from your `package.json`.

Then, add the following scripts to your `package.json` file:

```json title="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

These scripts refer to the different stages of developing an application:

- `next dev`: Starts the development server using Turbopack (default bundler).
- `next build`: Builds the application for production.
- `next start`: Starts the production server.
- `eslint`: Runs ESLint.

Turbopack is now the default bundler. To use Webpack run `next dev --webpack` or `next build --webpack`. See the [Turbopack docs](/docs/app/api-reference/turbopack) for configuration details.

### Create the `app` directory

Next.js uses file-system routing, which means the routes in your application are determined by how you structure your files.

Create an `app` folder. Then, inside `app`, create a `layout.tsx` file. This file is the [root layout](/docs/app/api-reference/file-conventions/layout#root-layout). It's required and must contain the `<html>` and `<body>` tags.

```tsx title="app/layout.tsx" 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx title="app/layout.js" 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Create a home page `app/page.tsx` with some initial content:

```tsx title="app/page.tsx" 
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

```jsx title="app/page.js" 
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

Both `layout.tsx` and `page.tsx` will be rendered when the user visits the root of your application (`/`).

![App Folder Structure](/docs/light/app-getting-started.png)

> **Good to know:**
>
> - If you forget to create the root layout, Next.js will automatically create this file when running the development server with `next dev`.
> - You can optionally use a [`src` folder](/docs/app/api-reference/file-conventions/src-folder) in the root of your project to separate your application's code from configuration files.

### Create the `public` folder (optional)

Create a [`public` folder](/docs/app/api-reference/file-conventions/public-folder) at the root of your project to store static assets such as images, fonts, etc. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

You can then reference these assets using the root path (`/`). For example, `public/profile.png` can be referenced as `/profile.png`:

```tsx highlight={4} title="app/page.tsx" 
import Image from 'next/image'

export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

```jsx highlight={4} title="app/page.js" 
import Image from 'next/image'

export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

## Run the development server

1. Run `npm run dev` to start the development server.
2. Visit `http://localhost:3000` to view your application.
3. Edit the `app/page.tsx` file and save it to see the updated result in your browser.

## Set up TypeScript

> Minimum TypeScript version: `v5.1.0`

Next.js comes with built-in TypeScript support. To add TypeScript to your project, rename a file to `.ts` / `.tsx` and run `next dev`. Next.js will automatically install the necessary dependencies and add a `tsconfig.json` file with the recommended config options.

### IDE Plugin

Next.js includes a custom TypeScript plugin and type checker, which VSCode and other code editors can use for advanced type-checking and auto-completion.

You can enable the plugin in VS Code by:

1. Opening the command palette (`Ctrl/⌘` + `Shift` + `P`)
2. Searching for "TypeScript: Select TypeScript Version"
3. Selecting "Use Workspace Version"

![TypeScript Command Palette](/docs/light/typescript-command-palette.png)

See the [TypeScript reference](/docs/app/api-reference/config/typescript) page for more information.

## Set up your editor

The App Router names files by convention, like `page.tsx`, `layout.tsx`, and `route.ts`, so your editor quickly fills with same-named tabs. Label each tab with its enclosing folders, like `blog/[id]`, so you can tell them apart.

In VS Code 1.88+ or Cursor, add [custom editor labels](https://code.visualstudio.com/updates/v1_88#_customize-editor-labels) to `.vscode/settings.json`. Labeling two folders deep keeps dynamic routes like `blog/[id]/page.tsx` from all collapsing to the same `[id]` label:

```json title=".vscode/settings.json"
{
  "workbench.editor.customLabels.patterns": {
    "**/app/**/page.tsx": "${dirname(1)}/${dirname} - page.tsx",
    "**/app/**/layout.tsx": "${dirname(1)}/${dirname} - layout.tsx",
    "**/app/**/loading.tsx": "${dirname(1)}/${dirname} - loading.tsx",
    "**/app/**/error.tsx": "${dirname(1)}/${dirname} - error.tsx",
    "**/app/**/not-found.tsx": "${dirname(1)}/${dirname} - not-found.tsx",
    "**/app/**/template.tsx": "${dirname(1)}/${dirname} - template.tsx",
    "**/app/**/default.tsx": "${dirname(1)}/${dirname} - default.tsx",
    "**/app/**/route.ts": "${dirname(1)}/${dirname} - route.ts"
  }
}
```

Or copy this prompt to have your coding agent set it up:

Set up custom editor labels so my Next.js App Router files are easy to tell apart. Read https\://nextjs.org/docs/app/getting-started/installation#set-up-your-editor and add the workbench.editor.customLabels.patterns config shown there to my .vscode/settings.json, creating the file if it doesn't exist. Adjust the labels to taste. If I use a different editor, apply the equivalent setting or tell me it's automatic, and leave my other settings untouched.

> **Good to know:**
>
> JetBrains IDEs (WebStorm, IntelliJ) show the folder for same-named files automatically, so no setup is needed.

## Set up linting

Next.js supports linting with either ESLint or Biome. Choose a linter and run it directly via `package.json` scripts.

- Use **ESLint** (comprehensive rules):

```json title="package.json"
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

- Or use **Biome** (fast linter + formatter):

```json title="package.json"
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}
```

If your project previously used `next lint`, migrate your scripts to the ESLint CLI with the codemod:

```bash title="Terminal"
npx @next/codemod@canary next-lint-to-eslint-cli .
```

If you use ESLint, create an explicit config (recommended `eslint.config.mjs`). ESLint supports both [the legacy `.eslintrc.*` and the newer `eslint.config.mjs` formats](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-eslint). See the [ESLint API reference](/docs/app/api-reference/config/eslint#with-core-web-vitals) for a recommended setup.

> **Good to know:**
>
> Starting with Next.js 16, `next build` no longer runs the linter automatically. Instead, you can run your linter through NPM scripts.

See the [ESLint Plugin](/docs/app/api-reference/config/eslint) page for more information.

## Set up Absolute Imports and Module Path Aliases

Next.js has in-built support for the `"paths"` and `"baseUrl"` options of `tsconfig.json` and `jsconfig.json` files.

These options allow you to alias project directories to absolute paths, making it easier and cleaner to import modules. For example:

```jsx
// Before
import { Button } from '../../../components/button'

// After
import { Button } from '@/components/button'
```

To configure absolute imports, add the `baseUrl` configuration option to your `tsconfig.json` or `jsconfig.json` file. For example:

```json title="tsconfig.json or jsconfig.json"
{
  "compilerOptions": {
    "baseUrl": "src/"
  }
}
```

In addition to configuring the `baseUrl` path, you can use the `"paths"` option to `"alias"` module paths.

For example, the following configuration maps `@/components/*` to `components/*`:

```json title="tsconfig.json or jsconfig.json"
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

Each of the `"paths"` are relative to the `baseUrl` location.

## Upgrade your Next.js app

Keep your Next.js version up to date. Each release ships security patches, bug fixes, and performance optimizations alongside new features, and staying current keeps every individual upgrade small. Run the `upgrade` command:

```bash
pnpm next upgrade
```

```bash
npx next upgrade
```

```bash
yarn next upgrade
```

```bash
bunx next upgrade
```

Upgrading also updates the documentation bundled inside the `next` package at `node_modules/next/dist/docs/`. New features arrive with their docs, and existing pages pick up new guidance and pitfalls discovered along the way. [AI coding agents](/docs/app/guides/ai-agents) in your project then work from the version you have installed rather than their training data.

To have a coding agent perform and verify the upgrade, run `npx next@canary upgrade --agent=latest`. See [Upgrade with a coding agent](/docs/app/guides/upgrading/agent-upgrade) for other policies.

See [Upgrading](/docs/app/getting-started/upgrading) for version guides and manual upgrade steps, or the [preview docs](https://preview.nextjs.org) to explore features before they ship in a stable version.

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---

<!-- source: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups -->

---
title: Route Groups
description: Route Groups can be used to partition your Next.js application into different sections.
url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-groups"
docs_index: /docs/llms.txt
lastUpdated: 2025-06-16
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "File-system conventions: /docs/app/api-reference/file-conventions"
---

> For an index of all documentation, see [/docs/llms.txt](/docs/llms.txt).

Route Groups are a folder convention that let you organize routes by category or team.

## Convention

A route group can be created by wrapping a folder's name in parenthesis: `(folderName)`.

This convention indicates the folder is for organizational purposes and should **not be included** in the route's URL path.

![An example folder structure using route groups](/docs/light/project-organization-route-groups.png)

## Use cases

- Organizing routes by team, concern, or feature.
- Defining multiple [root layouts](/docs/app/api-reference/file-conventions/layout#root-layout).
- Opting specific route segments into sharing a layout, while keeping others out.

## Caveats

- **Full page load**: If you navigate between routes that use different root layouts, it'll trigger a full page reload. For example, navigating from `/cart` that uses `app/(shop)/layout.js` to `/blog` that uses `app/(marketing)/layout.js`. This **only** applies to multiple root layouts.
- **Conflicting paths**: Routes in different groups should not resolve to the same URL path. For example, `(marketing)/about/page.js` and `(shop)/about/page.js` would both resolve to `/about` and cause an error.
- **Top-level root layout**: If you use multiple root layouts without a top-level `layout.js` file, make sure your home route (/) is defined within one of the route groups, e.g. app/(marketing)/page.js.

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---

<!-- source: https://nextjs.org/docs/app/guides/environment-variables -->

---
title: How to use environment variables in Next.js
description: Learn to add and access environment variables in your Next.js application.
url: "https://nextjs.org/docs/app/guides/environment-variables"
docs_index: /docs/llms.txt
lastUpdated: 2026-08-25
navTitle: "Environment Variables"
prerequisites:
  - "Guides: /docs/app/guides"
---

> For an index of all documentation, see [/docs/llms.txt](/docs/llms.txt).

Next.js comes with built-in support for environment variables, which allows you to do the following:

- [Use `.env` to load environment variables](#loading-environment-variables)
- [Bundle environment variables for the browser by prefixing with `NEXT_PUBLIC_`](#bundling-environment-variables-for-the-browser)

> **Warning:**
>
> The default `create-next-app` template ensures all `.env` files are added to your `.gitignore`. You almost never want to commit these files to your repository.

## Loading Environment Variables

Next.js has built-in support for loading environment variables from `.env*` files into `process.env`.

```txt title=".env"
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

> **Note:**
>
> Next.js also supports multiline variables inside of your `.env*` files:
>
> ```bash
> # .env
>
> # you can write with line breaks
> PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
> ...
> Kh9NV...
> ...
> -----END DSA PRIVATE KEY-----"
>
> # or with `\n` inside double quotes
> PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nKh9NV...\n-----END DSA PRIVATE KEY-----\n"
> ```

> **Note:**
>
> If you are using a `/src` folder, please note that Next.js will load the .env files **only** from the parent folder and **not** from the `/src` folder.
> This loads `process.env.DB_HOST`, `process.env.DB_USER`, and `process.env.DB_PASS` into the Node.js environment automatically allowing you to use them in [Route Handlers](/docs/app/api-reference/file-conventions/route).

For example:

```js title="app/api/route.js"
export async function GET() {
  const db = await myDB.connect({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
  })
  // ...
}
```

### Loading Environment Variables with `@next/env`

If you need to load environment variables outside of the Next.js runtime, such as in a root config file for an ORM or test runner, you can use the `@next/env` package.

This package is used internally by Next.js to load environment variables from `.env*` files.

To use it, install the package and use the `loadEnvConfig` function to load the environment variables:

```bash
pnpm add @next/env
```

```bash
npm install @next/env
```

```bash
yarn add @next/env
```

```bash
bun add @next/env
```

```tsx title="envConfig.ts" 
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)
```

```jsx title="envConfig.js" 
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)
```

Then, you can import the configuration where needed. For example:

```tsx title="orm.config.ts" 
import './envConfig.ts'

export default defineConfig({
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
})
```

```jsx title="orm.config.js" 
import './envConfig.js'

export default defineConfig({
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
})
```

### Referencing Other Variables

Next.js will automatically expand variables that use `$` to reference other variables e.g. `$VARIABLE` inside of your `.env*` files. This allows you to reference other secrets. For example:

```txt title=".env"
TWITTER_USER=nextjs
TWITTER_URL=https://x.com/$TWITTER_USER
```

In the above example, `process.env.TWITTER_URL` would be set to `https://x.com/nextjs`.

> **Good to know:**
>
> If you need to use variable with a `$` in the actual value, it needs to be escaped e.g. `\$`.

## Bundling Environment Variables for the Browser

Non-`NEXT_PUBLIC_` environment variables are only available in the Node.js environment, meaning they aren't accessible to the browser (the client runs in a different *environment*).

In order to make the value of an environment variable accessible in the browser, Next.js can "inline" a value, at build time, into the js bundle that is delivered to the client, replacing all references to `process.env.[variable]` with a hard-coded value. To tell it to do this, you just have to prefix the variable with `NEXT_PUBLIC_`. For example:

```txt title=".env"
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
```

This will tell Next.js to replace all references to `process.env.NEXT_PUBLIC_ANALYTICS_ID` in the Node.js environment with the value from the environment in which you run `next build`, allowing you to use it anywhere in your code. It will be inlined into any JavaScript sent to the browser.

> **Note:**
>
> After being built, your app will no longer respond to changes to these environment variables. For instance, if you use a Heroku pipeline to promote slugs built in one environment to another environment, or if you build and deploy a single Docker image to multiple environments, all `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time, so these values need to be set appropriately when the project is built. If you need access to runtime environment values, you'll have to set up your own API to provide them to the client (either on demand or during initialization).

```js title="pages/index.js"
import setupAnalyticsService from '../lib/my-analytics-service'

// 'NEXT_PUBLIC_ANALYTICS_ID' can be used here as it's prefixed by 'NEXT_PUBLIC_'.
// It will be transformed at build time to `setupAnalyticsService('abcdefghijk')`.
setupAnalyticsService(process.env.NEXT_PUBLIC_ANALYTICS_ID)

function HomePage() {
  return <h1>Hello World</h1>
}

export default HomePage
```

Note that dynamic lookups will *not* be inlined, such as:

```js
// This will NOT be inlined, because it uses a variable
const varName = 'NEXT_PUBLIC_ANALYTICS_ID'
setupAnalyticsService(process.env[varName])

// This will NOT be inlined, because it uses a variable
const env = process.env
setupAnalyticsService(env.NEXT_PUBLIC_ANALYTICS_ID)
```

### Runtime Environment Variables

Next.js can support both build time and runtime environment variables.

**By default, environment variables are only available on the server**. To expose an environment variable to the browser, it must be prefixed with `NEXT_PUBLIC_`. However, these public environment variables will be inlined into the JavaScript bundle during `next build`.

You can safely read environment variables on the server during dynamic rendering:

```tsx title="app/page.ts" 
import { connection } from 'next/server'

export default async function Component() {
  await connection()
  // cookies, headers, and other Request-time APIs
  // will also opt into dynamic rendering, meaning
  // this env variable is evaluated at runtime
  const value = process.env.MY_VALUE
  // ...
}
```

```jsx title="app/page.js" 
import { connection } from 'next/server'

export default async function Component() {
  await connection()
  // cookies, headers, and other Request-time APIs
  // will also opt into dynamic rendering, meaning
  // this env variable is evaluated at runtime
  const value = process.env.MY_VALUE
  // ...
}
```

This allows you to use a singular Docker image that can be promoted through multiple environments with different values.

**Good to know:**

- You can run code on server startup using the [`register` function](/docs/app/guides/instrumentation).

## Test Environment Variables

Apart from `development` and `production` environments, there is a 3rd option available: `test`. In the same way you can set defaults for development or production environments, you can do the same with a `.env.test` file for the `testing` environment (though this one is not as common as the previous two). Next.js will not load environment variables from `.env.development` or `.env.production` in the `testing` environment.

This one is useful when running tests with tools like `jest` or `cypress` where you need to set specific environment vars only for testing purposes. Test default values will be loaded if `NODE_ENV` is set to `test`, though you usually don't need to do this manually as testing tools will address it for you.

There is a small difference between `test` environment, and both `development` and `production` that you need to bear in mind: `.env.local` won't be loaded, as you expect tests to produce the same results for everyone. This way every test execution will use the same env defaults across different executions by ignoring your `.env.local` (which is intended to override the default set).

> **Good to know:**
>
> similar to Default Environment Variables, `.env.test` file should be included in your repository, but `.env.test.local` shouldn't, as `.env*.local` are intended to be ignored through `.gitignore`.

While running unit tests you can make sure to load your environment variables the same way Next.js does by leveraging the `loadEnvConfig` function from the `@next/env` package.

```js
// The below can be used in a Jest global setup file or similar for your testing set-up
import { loadEnvConfig } from '@next/env'

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
```

## Environment Variable Load Order

Environment variables are looked up in the following places, in order, stopping once the variable is found.

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (Not checked when `NODE_ENV` is `test`.)
4. `.env.$(NODE_ENV)`
5. `.env`

For example, if `NODE_ENV` is `development` and you define a variable in both `.env.development.local` and `.env`, the value in `.env.development.local` will be used.

> **Good to know:**
>
> The allowed values for `NODE_ENV` are `production`, `development` and `test`.

## Good to know

- If you are using a [`/src` directory](/docs/app/api-reference/file-conventions/src-folder), `.env.*` files should remain in the root of your project.
- If the environment variable `NODE_ENV` is unassigned, Next.js automatically assigns `development` when running the `next dev` command, or `production` for all other commands.

## Version History

| Version  | Changes                                       |
| -------- | --------------------------------------------- |
| `v9.4.0` | Support `.env` and `NEXT_PUBLIC_` introduced. |

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)

---

<!-- source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy -->

---
title: proxy.js
description: API reference for the proxy.js file.
url: "https://nextjs.org/docs/app/api-reference/file-conventions/proxy"
docs_index: /docs/llms.txt
lastUpdated: 2026-09-04
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "File-system conventions: /docs/app/api-reference/file-conventions"
related:
  - /docs/app/api-reference/functions/next-request
  - /docs/app/api-reference/functions/next-response
---

> For an index of all documentation, see [/docs/llms.txt](/docs/llms.txt).

> **Note:**
>
> The `middleware` file convention is deprecated and has been renamed to `proxy`. See [Migration to Proxy](#migration-to-proxy) for more details.

The `proxy.js|ts` file is used to write [Proxy](/docs/app/getting-started/proxy) and run code on the server before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

Proxy executes before routes are rendered. It's particularly useful for implementing custom server-side logic like authentication, logging, or handling redirects.

> **Good to know:**
>
> Proxy is meant to be invoked separately of your render code and in optimized cases deployed to your CDN for fast redirect/rewrite handling, you should not attempt relying on shared modules or globals.
>
> To pass information from Proxy to your application, use [headers](#setting-headers), [cookies](#using-cookies), [rewrites](/docs/app/api-reference/functions/next-response#rewrite), [redirects](/docs/app/api-reference/functions/next-response#redirect), or the URL.

Create a `proxy.ts` (or `.js`) file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`.

If you’ve customized [`pageExtensions`](/docs/app/api-reference/config/next-config-js/pageExtensions), for example to `.page.ts` or `.page.js`, name your file `proxy.page.ts` or `proxy.page.js` accordingly.

```tsx title="proxy.ts" 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

```js title="proxy.js" 
import { NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

## Exports

### Proxy function

The file must export a single function, either as a default export or named `proxy`. Note that multiple proxy from the same file are not supported.

```js title="proxy.js"
// Example of default export
export default function proxy(request) {
  // Proxy logic
}
```

### Config object (optional)

Optionally, a config object can be exported alongside the Proxy function. This object includes the [matcher](#matcher) to specify paths where the Proxy applies.

### Matcher

The `matcher` option allows you to target specific paths for the Proxy to run on.

Without a `matcher`, Proxy runs on **every request**, including static files (`_next/static`), image optimizations (`_next/image`), and assets in the `public/` folder. Consider using a [negative match pattern](#negative-matching) to exclude these paths, otherwise auth logic or redirects can unintentionally block CSS, JS, or images from loading.

You can specify paths in several ways:

- For a single path: Directly use a string to define the path, like `'/about'`.
- For multiple paths: Use an array to list multiple paths, such as `matcher: ['/about', '/contact']`, which applies the Proxy to both `/about` and `/contact`.

```js title="proxy.js"
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
}
```

Additionally, the `matcher` option supports complex path specifications using regular expressions. For example, you can exclude certain paths with a regular expression matcher:

```js title="proxy.js"
export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
}
```

This enables precise control over which paths to include or exclude.

The `matcher` option accepts an array of objects with the following keys:

- `source`: The path or pattern used to match the request paths. It can be a string for direct path matching or a pattern for more complex matching.
- `locale` (optional): A boolean that, when set to `false`, ignores locale-based routing in path matching.
- `has` (optional): Specifies conditions based on the presence of specific request elements such as headers, query parameters, or cookies.
- `missing` (optional): Focuses on conditions where certain request elements are absent, like missing headers or cookies.

```js title="proxy.js"
export const config = {
  matcher: [
    {
      source: '/api/:path*',
      locale: false,
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
        { type: 'query', key: 'userId', value: '123' },
      ],
      missing: [{ type: 'cookie', key: 'session', value: 'active' }],
    },
  ],
}
```

The `source` path patterns:

1. MUST start with `/`
2. Can include named parameters: `/about/:path` matches `/about/a` and `/about/b` but not `/about/a/c`
3. Can have modifiers on named parameters (starting with `:`): `/about/:path*` matches `/about/a/b/c` because `*` is *zero or more*. `?` is *zero or one* and `+` *one or more*
4. Can use regular expression enclosed in parenthesis: `/about/(.*)` is the same as `/about/:path*`
5. Are anchored to the start of the path: `/about` matches `/about` and `/about/team` but not `/blog/about`

Read more details on [path-to-regexp](https://github.com/pillarjs/path-to-regexp#path-to-regexp-1) documentation.

> **Good to know:**
>
> - The `matcher` values need to be constants so they can be statically analyzed at build-time. Dynamic values such as variables will be ignored.
> - For backward compatibility, Next.js always considers `/public` as `/public/index`. Therefore, a matcher of `/public/:path` will match.

## Params

Next.js calls the Proxy function with two arguments, [`request`](#request) and [`event`](#event), in that order. Declare only the ones you use.

### `request`

The first parameter is an instance of `NextRequest`, which represents the incoming HTTP request.

```tsx title="proxy.ts" 
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Proxy logic goes here
}
```

```js title="proxy.js" 
export function proxy(request) {
  // Proxy logic goes here
}
```

### `event`

The second parameter is an instance of `NextFetchEvent`. It exposes a single method, `waitUntil(promise)`, which keeps the Proxy invocation alive until the promise settles, so background work like logging or analytics can finish after the response is sent. See [`waitUntil` and `NextFetchEvent`](#waituntil-and-nextfetchevent) for a full example.

```tsx title="proxy.ts" 
import type { NextFetchEvent, NextRequest } from 'next/server'

export function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch('https://example.com/log', {
      method: 'POST',
      body: JSON.stringify({ pathname: request.nextUrl.pathname }),
    })
  )
}
```

```js title="proxy.js" 
export function proxy(request, event) {
  event.waitUntil(
    fetch('https://example.com/log', {
      method: 'POST',
      body: JSON.stringify({ pathname: request.nextUrl.pathname }),
    })
  )
}
```

### `NextProxy` type

If you prefer a shorthand, you can use the `NextProxy` type. It infers the parameter types for both `request` (`NextRequest`) and `event` (`NextFetchEvent`) automatically:

```tsx title="proxy.ts"
import type { NextProxy } from 'next/server'

export const proxy: NextProxy = (request, event) => {
  event.waitUntil(Promise.resolve())
  return Response.json({ pathname: request.nextUrl.pathname })
}
```

> **Good to know:**
>
> - `NextRequest` is a type that represents incoming HTTP requests in Next.js Proxy, whereas [`NextResponse`](#nextresponse) is a class used to manipulate and send back HTTP responses.

## NextResponse

The `NextResponse` API allows you to:

- `redirect` the incoming request to a different URL
- `rewrite` the response by displaying a given URL
- Set request headers for API Routes, `getServerSideProps`, and `rewrite` destinations
- Set response cookies
- Set response headers

To produce a response from Proxy, you can:

1. `rewrite` to a route ([Page](/docs/app/api-reference/file-conventions/page) or [Route Handler](/docs/app/api-reference/file-conventions/route)) that produces a response
2. return a `NextResponse` directly. See [Producing a Response](#producing-a-response)

> **Good to know:**
>
> For redirects, you can also use `Response.redirect` instead of `NextResponse.redirect`.

## Execution order

Proxy will be invoked for **every route in your project**. Given this, it's crucial to use [matchers](#matcher) to precisely target or exclude specific routes. The following is the execution order:

1. `headers` from `next.config.js`
2. `redirects` from `next.config.js`
3. Proxy (`rewrites`, `redirects`, etc.)
4. `beforeFiles` (`rewrites`) from `next.config.js`
5. Filesystem routes (`public/`, `_next/static/`, `pages/`, `app/`, etc.)
6. `afterFiles` (`rewrites`) from `next.config.js`
7. Dynamic Routes (`/blog/[slug]`)
8. `fallback` (`rewrites`) from `next.config.js`

> **Good to know:**
>
> [Server Functions](/docs/app/api-reference/directives/use-server) are not separate routes in this chain. They are handled as POST requests to the route where they are used, so a Proxy matcher that excludes a path will also skip Server Function calls on that path.
>
> A matcher change or a refactor that moves a Server Function to a different route can silently remove Proxy coverage. Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone. See the [Data Security guide](/docs/app/guides/data-security#authentication-and-authorization) for recommended patterns.

## Runtime

Proxy defaults to using the Node.js runtime. The [`runtime`](/docs/app/api-reference/file-conventions/route-segment-config/runtime) config option is not available in Proxy files. Setting the `runtime` config option in Proxy will throw an error.

## Advanced Proxy flags

In `v13.1` of Next.js two additional flags were introduced for proxy, [`skipProxyUrlNormalize`](/docs/app/api-reference/config/next-config-js/skipProxyUrlNormalize) (formerly `skipMiddlewareUrlNormalize`) and [`skipTrailingSlashRedirect`](/docs/app/api-reference/config/next-config-js/skipTrailingSlashRedirect) to handle advanced use cases.

`skipTrailingSlashRedirect` disables Next.js redirects for adding or removing trailing slashes. This allows custom handling inside proxy to maintain the trailing slash for some paths but not others, which can make incremental migrations easier.

```js title="next.config.js"
module.exports = {
  skipTrailingSlashRedirect: true,
}
```

```js title="proxy.js"
const legacyPrefixes = ['/docs', '/blog']

export default async function proxy(req) {
  const { pathname } = req.nextUrl

  if (legacyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // apply trailing slash handling
  if (
    !pathname.endsWith('/') &&
    !pathname.match(/((?!\.well-known(?:\/.*)?)(?:[^/]+\/)*[^/]+\.\w+)/)
  ) {
    return NextResponse.redirect(
      new URL(`${req.nextUrl.pathname}/`, req.nextUrl)
    )
  }
}
```

`skipProxyUrlNormalize` allows for disabling the URL normalization in Next.js to make handling direct visits and client-transitions the same. In some advanced cases, this option provides full control by using the original URL.

```js title="next.config.js"
module.exports = {
  skipProxyUrlNormalize: true,
}
```

```js title="proxy.js"
export default async function proxy(req) {
  const { pathname } = req.nextUrl

  // GET /_next/data/build-id/hello.json

  console.log(pathname)
  // with the flag this now /_next/data/build-id/hello.json
  // without the flag this would be normalized to /hello
}
```

## Examples

### Conditional Statements

```ts title="proxy.ts" 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url))
  }
}
```

```js title="proxy.js" 
import { NextResponse } from 'next/server'

export function proxy(request) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url))
  }
}
```

### Using Cookies

Cookies are regular headers. On a `Request`, they are stored in the `Cookie` header. On a `Response` they are in the `Set-Cookie` header. Next.js provides a convenient way to access and manipulate these cookies through the `cookies` extension on `NextRequest` and `NextResponse`.

1. For incoming requests, `cookies` comes with the following methods: `get`, `getAll`, `set`, and `delete` cookies. You can check for the existence of a cookie with `has` or remove all cookies with `clear`.
2. For outgoing responses, `cookies` have the following methods `get`, `getAll`, `set`, and `delete`.

```ts title="proxy.ts" 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = request.cookies.get('nextjs')
  console.log(cookie) // => { name: 'nextjs', value: 'fast', Path: '/' }
  const allCookies = request.cookies.getAll()
  console.log(allCookies) // => [{ name: 'nextjs', value: 'fast' }]

  request.cookies.has('nextjs') // => true
  request.cookies.delete('nextjs')
  request.cookies.has('nextjs') // => false

  // Setting cookies on the response using the `ResponseCookies` API
  const response = NextResponse.next()
  response.cookies.set('vercel', 'fast')
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/',
  })
  cookie = response.cookies.get('vercel')
  console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/' }
  // The outgoing response will have a `Set-Cookie:vercel=fast;path=/` header.

  return response
}
```

```js title="proxy.js" 
import { NextResponse } from 'next/server'

export function proxy(request) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = request.cookies.get('nextjs')
  console.log(cookie) // => { name: 'nextjs', value: 'fast', Path: '/' }
  const allCookies = request.cookies.getAll()
  console.log(allCookies) // => [{ name: 'nextjs', value: 'fast' }]

  request.cookies.has('nextjs') // => true
  request.cookies.delete('nextjs')
  request.cookies.has('nextjs') // => false

  // Setting cookies on the response using the `ResponseCookies` API
  const response = NextResponse.next()
  response.cookies.set('vercel', 'fast')
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/',
  })
  cookie = response.cookies.get('vercel')
  console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/' }
  // The outgoing response will have a `Set-Cookie:vercel=fast;path=/` header.

  return response
}
```

### Setting Headers

You can set request and response headers using the `NextResponse` API (setting *request* headers is available since Next.js v13.0.0).

```ts title="proxy.ts" 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Clone the request headers and set a new header `x-hello-from-proxy1`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-proxy1', 'hello')

  // You can also set request headers in NextResponse.next
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })

  // Set a new response header `x-hello-from-proxy2`
  response.headers.set('x-hello-from-proxy2', 'hello')
  return response
}
```

```js title="proxy.js" 
import { NextResponse } from 'next/server'

export function proxy(request) {
  // Clone the request headers and set a new header `x-hello-from-proxy1`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-proxy1', 'hello')

  // You can also set request headers in NextResponse.next
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })

  // Set a new response header `x-hello-from-proxy2`
  response.headers.set('x-hello-from-proxy2', 'hello')
  return response
}
```

Note that the snippet uses:

- `NextResponse.next({ request: { headers: requestHeaders } })` to make `requestHeaders` available upstream
- **NOT** `NextResponse.next({ headers: requestHeaders })` which makes `requestHeaders` available to clients

Learn more in [NextResponse headers in Proxy](/docs/app/api-reference/functions/next-response#next).

> **Good to know:**
>
> Avoid setting large headers as it might cause [431 Request Header Fields Too Large](https://developer.mozilla.org/docs/Web/HTTP/Status/431) error depending on your backend web server configuration.

#### RSC requests and rewrites

During RSC requests, Next.js strips internal Flight headers from the `request` instance in Proxy. For example, headers like `rsc`, `next-router-state-tree`, and `next-router-prefetch` are not exposed through `request.headers`. This is to prevent accidentally handling an RSC request differently than the HTML request as both need to align.

When you use `NextResponse.rewrite()`, Next.js automatically propagates the required RSC rewrite headers upstream.

If you implement custom rewrite logic with `fetch()` instead of `NextResponse.rewrite()`, you can run into missing RSC headers unless you forward them manually.

For custom `fetch` rewrite setups, you can also enable [`skipProxyUrlNormalize`](/docs/app/api-reference/config/next-config-js/skipProxyUrlNormalize) in `next.config.js` so your rewrite logic can receive the necessary URL shape and RSC headers from the provided request object:

```js title="next.config.js"
module.exports = {
  skipProxyUrlNormalize: true,
}
```

### CORS

You can set CORS headers in Proxy to allow cross-origin requests, including [simple](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests) and [preflighted](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests) requests.

```tsx title="proxy.ts" 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = ['https://acme.com', 'https://my-app.org']

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function proxy(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  // Handle simple requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

```jsx title="proxy.js" 
import { NextResponse } from 'next/server'

const allowedOrigins = ['https://acme.com', 'https://my-app.org']

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function proxy(request) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  // Handle simple requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

> **Good to know:**
>
> You can configure CORS headers for individual routes in [Route Handlers](/docs/app/api-reference/file-conventions/route#cors).

### Producing a response

You can respond from Proxy directly by returning a `Response` or `NextResponse` instance. (This is available since [Next.js v13.1.0](https://nextjs.org/blog/next-13-1#nextjs-advanced-proxy))

```ts title="proxy.ts" 
import type { NextRequest } from 'next/server'
import { isAuthenticated } from '@lib/auth'

// Limit the proxy to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
}

export function proxy(request: NextRequest) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return Response.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    )
  }
}
```

```js title="proxy.js" 
import { isAuthenticated } from '@lib/auth'

// Limit the proxy to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
}

export function proxy(request) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return Response.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    )
  }
}
```

### Negative matching

The `matcher` config allows full regex so matching like negative lookaheads or character matching is supported. An example of a negative lookahead to match all except specific paths can be seen here:

```js title="proxy.js"
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

You can also bypass Proxy for certain requests by using the `missing` or `has` arrays, or a combination of both:

```js title="proxy.js"
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },

    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      has: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },

    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      has: [{ type: 'header', key: 'x-present' }],
      missing: [{ type: 'header', key: 'x-missing', value: 'prefetch' }],
    },
  ],
}
```

> **Good to know:**
>
> Even when `_next/data` is excluded in a negative matcher pattern, proxy will still be invoked for `_next/data` routes. This is intentional behavior to prevent accidental security issues where you might protect a page but forget to protect the corresponding data route.

```js title="proxy.js"
export const config = {
  matcher:
    '/((?!api|_next/data|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
}

// Proxy will still run for /_next/data/* routes despite being excluded
```

### `waitUntil` and `NextFetchEvent`

The `NextFetchEvent` object extends the native [`FetchEvent`](https://developer.mozilla.org/docs/Web/API/FetchEvent) object, and includes the [`waitUntil()`](https://developer.mozilla.org/docs/Web/API/ExtendableEvent/waitUntil) method.

The `waitUntil()` method takes a promise as an argument, and extends the lifetime of the Proxy until the promise settles. This is useful for performing work in the background.

```ts title="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

export function proxy(req: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch('https://my-analytics-platform.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: req.nextUrl.pathname }),
    })
  )

  return NextResponse.next()
}
```

### Unit testing (experimental)

Starting in Next.js 15.1, the `next/experimental/testing/server` package contains utilities to help unit test proxy files. Unit testing proxy can help ensure that it's only run on desired paths and that custom routing logic works as intended before code reaches production.

The `unstable_doesProxyMatch` function can be used to assert whether proxy will run for the provided URL, headers, and cookies.

```js
import { unstable_doesProxyMatch } from 'next/experimental/testing/server'

expect(
  unstable_doesProxyMatch({
    config,
    nextConfig,
    url: '/test',
  })
).toEqual(false)
```

The entire proxy function can also be tested.

```js
import { isRewrite, getRewrittenUrl } from 'next/experimental/testing/server'

const request = new NextRequest('https://nextjs.org/docs')
const response = await proxy(request)
expect(isRewrite(response)).toEqual(true)
expect(getRewrittenUrl(response)).toEqual('https://other-domain.com/docs')
// getRedirectUrl could also be used if the response were a redirect
```

## Platform support

| Deployment Option                                                   | Supported         |
| ------------------------------------------------------------------- | ----------------- |
| [Node.js server](/docs/app/getting-started/deploying#nodejs-server) | Yes               |
| [Docker container](/docs/app/getting-started/deploying#docker)      | Yes               |
| [Static export](/docs/app/getting-started/deploying#static-export)  | No                |
| [Adapters](/docs/app/getting-started/deploying#adapters)            | Platform-specific |

Learn how to [configure Proxy](/docs/app/guides/self-hosting#proxy) when self-hosting Next.js.

## Migration to Proxy

### Why the Change

The reason behind the renaming of `middleware` is that the term "middleware" can often be confused with Express.js middleware, leading to a misinterpretation of its purpose. Also, Middleware is highly capable, so it may encourage the usage; however, this feature is recommended to be used as a last resort.

Next.js is moving forward to provide better APIs with better ergonomics so that developers can achieve their goals without Middleware. This is the reason behind the renaming of `middleware`.

### Why "Proxy"

The name Proxy clarifies what Middleware is capable of. The term "proxy" implies a network boundary in front of the app, which is how this feature behaves. It can run outside of your application’s main runtime and handle requests before they reach your app. These characteristics align better with the term "proxy" and provide a clearer purpose for the feature.

### How to Migrate

We recommend users avoid relying on Middleware unless no other options exist. Our goal is to give them APIs with better ergonomics so they can achieve their goals without Middleware.

The term “middleware” often confuses users with Express.js middleware, which can encourage misuse. To clarify our direction, we are renaming the file convention to “proxy.” This highlights that we are moving away from Middleware, breaking down its overloaded features, and making the Proxy clear in its purpose.

Next.js provides a codemod to migrate from `middleware.ts` to `proxy.ts`. You can run the following command to migrate:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

The codemod will rename the file and the function name from `middleware` to `proxy`.

```diff
// middleware.ts -> proxy.ts

- export function middleware() {
+ export function proxy() {
```

## Version history

| Version   | Changes                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| `v16.0.0` | Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime          |
| `v15.5.0` | Middleware can now use the Node.js runtime (stable)                                           |
| `v15.2.0` | Middleware can now use the Node.js runtime (experimental)                                     |
| `v13.1.0` | Advanced Middleware flags added                                                               |
| `v13.0.0` | Middleware can modify request headers, response headers, and send responses                   |
| `v12.2.0` | Middleware is stable, please see the [upgrade guide](/docs/messages/middleware-upgrade-guide) |
| `v12.0.9` | Enforce absolute URLs in Edge Runtime ([PR](https://github.com/vercel/next.js/pull/33410))    |
| `v12.0.0` | Middleware (Beta) added                                                                       |

## Learn more about Proxy

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)
