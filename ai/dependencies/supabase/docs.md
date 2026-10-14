# Supabase — docs snapshot

Fetched: 2026-10-14
Versions: @supabase/ssr@0.12.7, @supabase/supabase-js, supabase CLI@2.120.0

Sources:
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/migrations
- https://supabase.com/docs/guides/cli/getting-started
- https://supabase.com/docs/guides/auth/passwords

Snapshot for offline reference. Confirm against the live docs when exact behaviour matters.


---

<!-- source: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs -->

# Use Supabase with Next.js

Learn how to create a Supabase project, add some sample data, and query from a Next.js app.



## 1. Create a Supabase project

To start, you need a Supabase project.

Create a new Supabase project from [the Dashboard of any organization](https://supabase.com/dashboard/new/_) you belong to.

Note: Use [the Management API](https://supabase.com/docs/reference/api/v1-create-a-project) or ask [the MCP server](https://supabase.com/docs/guides/ai-tools/mcp#account-management) to create a new Supabase project.

## 2. Set up your database

When your Supabase project is up and running, create an `instruments` table with some sample data. Then set only the privileges each Postgres role needs, add [Row Level Security (RLS)](https://supabase.com/docs/guides/database/postgres/row-level-security) for enhanced security for database data by default, and create an RLS policy to make the data in the table publicly readable.

Do these steps within your project's dashboard by copying and running the snippet in your project's [SQL Editor](https://supabase.com/dashboard/project/_/sql/new).

Note: Save some steps by clicking here to prefill the SQL in the SQL Editor, and then clicking **Run**.

Note: You can use [the Management API](https://supabase.com/docs/reference/api/v1-run-a-query) or ask [the MCP server](https://supabase.com/docs/guides/ai-tools/mcp#database) to execute SQL queries.

```sql SQL_EDITOR
-- Create the table
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert sample data into the table
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello');

-- Grant the privileges the role needs, which is read access
grant select on public.instruments to anon;

-- Enable row level security for the table
alter table instruments enable row level security;

-- Create a policy to allow the anon role to read from the instruments table
create policy "public can read instruments"
on public.instruments
for select to anon
using (true);
```

Note: If you disabled the Data API during project setup, enable it in the [**Integrations > Data API**](https://supabase.com/dashboard/project/_/integrations/data_api/settings) section of the Dashboard and expose the specific tables or functions you want to access. To automatically grant access for new tables and functions in `public`, enable **Automatically expose new tables**.

## 3. Create a Next.js app

Use the `create-next-app` command and the `with-supabase` template, to create a Next.js app pre-configured with [Cookie-based Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager\&package-manager=npm\&queryGroups=framework\&framework=nextjs\&queryGroups=environment\&environment=server), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

```bash
npx create-next-app@latest my-app -e with-supabase
```

## 4. Set up AI tooling (optional)

Supabase provides two ways to give AI tools context about your project: Agent Skills, which give your AI coding agent procedural knowledge, and the MCP server, which connects AI assistants to your Supabase project directly.

### Agent Skills

[Agent Skills](https://supabase.com/docs/guides/ai-tools/ai-skills) is a curated set of instructions that give your AI agent procedural knowledge about working with Supabase.

Install them so your AI coding agent can produce more accurate, reliable code using current Supabase patterns, such as authentication, server-side rendering, and database migrations, rather than relying solely on training data.

#### Installing Agent Skills

To install, run the following command in the root of your project:

```bash
npx skills add supabase/agent-skills
```

### Supabase MCP server

The Supabase MCP server connects AI assistants to Supabase, so they can inspect your schema and act on your projects on your behalf. Find out how to add it to your client in [the MCP docs](https://supabase.com/docs/guides/ai-tools/mcp).

## 5. Declare Supabase environment variables

Rename `.env.example` to `.env.local` and populate with your Supabase connection variables that you can get from the helper below, or [from the project **Connect** panel](https://supabase.com/dashboard/project/_?showConnect=true\&framework=nextjs\&connectTab=frameworks).

Open Connect panel

```text name=.env.local
NEXT_PUBLIC_SUPABASE_URL=<SUBSTITUTE_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<SUBSTITUTE_SUPABASE_PUBLISHABLE_KEY>
```

### Get API details

To interact with data in database tables, you use the client libraries that wrap [the auto-generated Data API endpoints](https://supabase.com/docs/guides/api), authenticating using the Project URL and key from [the project **Connect** dialog](https://supabase.com/dashboard/project/_?showConnect=true\&connectTab=frameworks\&framework=nextjs).





Note: See [API keys](https://supabase.com/docs/guides/getting-started/api-keys) for a full explanation of all key types, their uses, and where to find them.

## 6. Allow public access to the instruments page

The `with-supabase` template redirects unauthenticated visitors to the sign-in page for most routes. The `instruments` table is publicly readable, so update `lib/supabase/proxy.ts` to skip that redirect for `/instruments`.

Find this `if` statement:

```ts name=lib/supabase/proxy.ts
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
```

Add a condition for `/instruments`:

```ts name=lib/supabase/proxy.ts
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/instruments" &&
    !request.nextUrl.pathname.startsWith("/instruments/")
  ) {
```

## 7. Query Supabase data from Next.js

The `with-supabase` template already installs `@supabase/supabase-js` and `@supabase/ssr` and creates the clients for you, in `lib/supabase/client.ts` for the browser and `lib/supabase/server.ts` for Server Components. The code below imports the server client from there.

Create a new file at `app/instruments/page.tsx` and populate with the following.

This selects all the rows from the `instruments` table you created earlier and renders them on the page.

```ts name=app/instruments/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase.from("instruments").select();

  if (error) {
    return <p>Error loading instruments: {error.message}</p>;
  }

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
```

## 8. Start the app

Run the development server, go to [http://localhost:3000/instruments](http://localhost:3000/instruments) in a browser and you should see the list of instruments.

```bash
npm run dev
```

## Production requirements

The quickstart procedure in this guide optimizes for getting you to a working app, not for production.

Before you deploy:

- If your app reads or writes through the Data API, review your [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) policies. Any policy you added here is scoped to this quickstart's sample data, not to real user data.
- Set your Supabase credentials as environment variables on whatever platform you deploy to, rather than committing them to source control.
- Configure a [custom domain](https://supabase.com/docs/guides/platform/custom-domains) for your Supabase project once you're ready to go live.

## Next steps

- Set up [Auth](https://supabase.com/docs/guides/auth) for your app
- [Insert more data](https://supabase.com/docs/guides/database/import-data) into your database
- Upload and serve static files using [Storage](https://supabase.com/docs/guides/storage)
- Explore [drop-in UI components](https://supabase.com/ui) for your Supabase app

---

<!-- source: https://supabase.com/docs/guides/auth/server-side/creating-a-client -->

# Creating a Supabase client for SSR

Configure your Supabase client to use cookies

Learn how to configure your Supabase client to use cookies. Your app can then render on the server with the user already signed in.

Server-Side Rendering (SSR) with Supabase requires cookie-based session storage. The `@supabase/ssr` package handles this for JavaScript and TypeScript applications.

Use this guide to:

1. [Install the packages](#install).
2. [Set environment variables](#set-environment-variables).
3. [Create a client](#create-a-client) for your framework.

Refer to these reference sections to make better decisions about verifying users and caching responses:

- [Choosing an auth method](#choosing-an-auth-method), before you write code that checks who the user is.
- [Caching considerations](#caching-considerations), if you deploy behind a CDN or use ISR.

## Install

Install the `@supabase/supabase-js` and `@supabase/ssr` helper packages:

**npm**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**yarn**

```bash
yarn add @supabase/supabase-js @supabase/ssr
```

**pnpm**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Set environment variables

Create a `.env.local` file in the project root directory. In the file, set the project's Supabase URL and Key:

### Get API details

To interact with data in database tables, you use the client libraries that wrap [the auto-generated Data API endpoints](https://supabase.com/docs/guides/api), authenticating using the Project URL and key from [the project **Connect** dialog](https://supabase.com/dashboard/project/_?showConnect=true\&connectTab=frameworks\&framework=nextjs).





Note: See [API keys](https://supabase.com/docs/guides/getting-started/api-keys) for a full explanation of all key types, their uses, and where to find them.

**Next.js**

```bash .env.local
NEXT_PUBLIC_SUPABASE_URL=supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**SvelteKit**

```bash .env.local
PUBLIC_SUPABASE_URL=supabase_project_url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**Astro**

```bash .env
PUBLIC_SUPABASE_URL=supabase_project_url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**Remix**

```bash .env
SUPABASE_URL=supabase_project_url
SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**Nuxt**

```bash .env
NUXT_PUBLIC_SUPABASE_URL=supabase_project_url
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

In `nuxt.config.ts`, map these public env vars into runtime config keys used by the examples below:

```ts nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // These defaults will be overridden by NUXT_PUBLIC_SUPABASE_URL and
      // NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables at runtime.
      supabaseUrl: '',
      supabasePublishableKey: '',
    },
  },
})
```

**React Router**

```bash .env
SUPABASE_URL=supabase_project_url
SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**Express**

```bash .env
SUPABASE_URL=supabase_project_url
SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

Install [dotenv](https://www.npmjs.com/package/dotenv):

**npm**

```bash
npm install dotenv
```

**yarn**

```bash
yarn add dotenv
```

**pnpm**

```bash
pnpm add dotenv
```

Then load the file before you read any variable from it. Put this on the first line of your entry point, above every other import:

```js app.js
require('dotenv').config()
```

**Hono**

```bash .env
SUPABASE_URL=supabase_project_url
SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

**TanStack Start**

```bash .env.local
VITE_SUPABASE_URL=supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

## Create a client

You need setup code to configure a Supabase client to use cookies. Once you have the utility code, you can use the `createClient` utility functions to get a properly configured Supabase client.

Use the browser client in code that runs on the browser, and the server client in code that runs on the server.

Before you write code that checks who the user is, see [Choosing an auth method](#choosing-an-auth-method).

**Next.js**

### Write utility functions to create Supabase clients \[#nextjs-utility-functions]

To access Supabase from a Next.js app, you need 2 types of Supabase clients:

1. **Client Component client** - To access Supabase from Client Components, which run in the browser.
2. **Server Component client** - To access Supabase from Server Components, Server Actions, and Route Handlers, which run only on the server.

Since Next.js Server Components can't write cookies, you need a [Proxy](https://nextjs.org/docs/app/getting-started/proxy) to refresh expired Auth tokens and store them.

Note: On Next.js 15 and earlier, a `proxy.ts` file is never called, so sessions never refresh and users get signed out. Next.js renamed this file in version 16. Before that, it's `middleware.ts` and the function is `export async function middleware`. The Supabase code inside it is the same either way.

The Proxy is responsible for:

1. Refreshing the Auth token by calling `supabase.auth.getClaims()`.
2. Passing the refreshed Auth token to Server Components, so they don't attempt to refresh the same token themselves. It is what keeps users signed in. This is accomplished with `request.cookies.set`.
3. Passing the refreshed Auth token to the browser, so it replaces the old token. This is accomplished with `response.cookies.set`.

**What does the `cookies` object do?**

The cookies object lets the Supabase client know how to access the cookies, so it can read and write the user session data. To make `@supabase/ssr` framework-agnostic, the cookies methods aren't hard-coded. These utility functions adapt `@supabase/ssr`'s cookie handling for Next.js.

`setAll` is called whenever the library needs to write cookies, for example after a token refresh. It receives two arguments: the array of cookies to set, and a `headers` object containing the cache headers `Cache-Control`, `Expires`, and `Pragma`, which must be applied to the HTTP response to prevent CDNs from caching the response and leaking the session to other users. In the Proxy, apply these headers to the response. In Server Components, the headers cannot be set, which is why the `setAll` call is wrapped in a try/catch and the error is ignored. The Proxy handles writing cookies and headers on every request.

The cookie is named `sb-<project_ref>-auth-token` by default.

**Do I need to create a new client for every route?**

Yes! Creating a Supabase client is lightweight.

- On the server, it basically configures a `fetch` call. You need to reconfigure the fetch call anew for every request to your server, because you need the cookies from the request.
- On the client, `createBrowserClient` already uses a singleton pattern, so you only ever create one instance, no matter how many times you call your `createClient` function.

**Why does refreshing in two places sign users out?**

A refresh token can generally be used only once, with two exceptions. Supabase allows a short window in which the same token can be presented again, which covers the normal SSR round trip. It also returns the active token when the parent of the active token is presented, which covers a client that never received the previous response. A reuse attempt that matches neither exception revokes the whole session.

This is hard to trace, because it looks like users being signed out at random rather than an error in your code.

See [refresh token reuse detection](https://supabase.com/docs/guides/auth/sessions#what-is-refresh-token-reuse-detection-and-what-does-it-protect-from).

Create a `lib/supabase` folder at the root of your project, or inside the `./src` folder if you are using one, with a file for each type of client. Then copy the lib utility functions for each client type.



### Hook up proxy

The code adds a [matcher](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) so the Proxy doesn't run on routes that don't access Supabase.

Return the `supabaseResponse` object that `setAll` last built. An earlier response doesn't carry the refreshed cookies, so the user is signed out on the next request.

When you need to return a different response, copy the cookies and the cache headers onto it first:

```ts
const myNewResponse = NextResponse.next({ request })
myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
for (const header of ['cache-control', 'expires', 'pragma']) {
  const value = supabaseResponse.headers.get(header)
  if (value) myNewResponse.headers.set(header, value)
}
return myNewResponse
```

Danger: Anyone can forge the session cookie, so trusting it without verification lets an attacker render another user's page. Always use `supabase.auth.getClaims()` to protect pages and user data.

*Never* trust `supabase.auth.getSession()` inside server code such as Proxy. It reads the session out of the cookie without revalidating it.

`getClaims()` verifies the token's signature on every call. On projects with asymmetric signing keys, the default for new projects, it verifies locally against a cached copy of the project's public keys. On projects still using a symmetric secret, it calls the Auth server instead. Either way the claims come from a token the server has verified rather than from whatever the cookie says.



### Congratulations \[#nextjs-congratulations]

To recap, you've:

- Called Supabase from a Server Action.
- Called Supabase from a Server Component.
- Set up a Supabase client utility to call Supabase from a Client Component. You can use this if you need to call Supabase from a Client Component, for example to set up a realtime subscription.
- Set up Proxy to automatically refresh the Supabase Auth session.

You can now use any Supabase feature from your client or server code.

**SvelteKit**

### Set up server-side hooks

Set up server-side hooks in `src/hooks.server.ts`. The hooks:

- Create a request-specific Supabase client, using the user credentials from the request cookie. This client is used for server-only code.
- Check user authentication.
- Guard protected pages.



To prevent TypeScript errors, add type definitions for the new event.locals properties.



### Create a Supabase client in your root layout

Create a Supabase client in your root `+layout.ts`. This client can be used to access Supabase from the client or the server. In order to get access to the Auth token on the server, use a `+layout.server.ts` file to pass in the session from event.locals.

Page components can access the Supabase client from the `data` object using the `load` function.



### Congratulations \[#sveltekit-congratulations]

To recap, you've:

- Set up server-side hooks to create a request-specific Supabase client and guard protected pages.
- Created a Supabase client in your root layout to use on both the client and server.

You can now use any Supabase feature from your client or server code.

**Astro**

### Configure Astro for SSR

Astro apps are static by default, so requests for data happen at build time rather than when a user requests a page. At build time there is no user, session, or cookie. Configure Astro for SSR if you want data fetched per request.

```js astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'server',
})
```

### Create the Supabase clients \[#astro-create-clients]

**Server**

```ts index.astro
---
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

const supabase = createServerClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    cookies: {
      getAll() {
        return parseCookieHeader(Astro.request.headers.get('Cookie') ?? '')
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          Astro.cookies.set(name, value))
        Object.entries(headers).forEach(([key, value]) =>
          Astro.response.headers.set(key, value)
        )
      },
    },
  }
);
---
```

**Browser**

```html index.astro
<script>
  import { createBrowserClient } from "@supabase/ssr";

  const supabase = createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
</script>
```

**Server Endpoint**

```ts route.ts
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => context.cookies.set(name, value))
          Object.entries(headers).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  // Build your response here, and pass `responseHeaders` to it. Without them a
  // shared cache can store this response along with its Set-Cookie header.
  return new Response(null, { headers: responseHeaders })
}
```

**Middleware**

```ts middleware.ts
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => context.cookies.set(name, value))
          Object.entries(headers).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  const response = await next()
  responseHeaders.forEach((value, key) => response.headers.set(key, value))
  return response
})
```

### Congratulations \[#astro-congratulations]

To recap, you've:

- Created a server client for code that runs on the server, and a browser client for code that runs in the browser.
- Read and wrote the session cookie from a server endpoint and from middleware.

You can now use any Supabase feature from your client or server code.

**Remix**

### Create the Supabase clients \[#remix-create-clients]

With Remix, in a route module such as `_index.tsx`, you can export a `loader`, an `action`, and a default component.

Configure Supabase clients as follows:

1. **Create a server client in the `loader`.** Use it to load data and manage the user session on the server. Return your Supabase URL and publishable key so the browser can create a client.
2. **Create a server client in the `action`.** Use it to handle form submissions and other mutations on the server.
3. **Create a browser client in the default component.** Call `useLoaderData` to read the URL and key, then call `createBrowserClient`.

The following example shows all three exports in one route module:

```ts _index.tsx
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'

// Server: load data and manage the user's session.
export async function loader({ request }: LoaderFunctionArgs) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHeaders.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
          Object.entries(cacheHeaders).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  // Use `supabase` here for server-side work, e.g. await supabase.auth.getClaims()

  // Return the environment variables so the browser can create its own client.
  return json(
    {
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY!,
      },
    },
    { headers: responseHeaders }
  )
}

// Server: handle form submissions and mutations.
export async function action({ request }: ActionFunctionArgs) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHeaders.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
          Object.entries(cacheHeaders).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  return json(null, { headers: responseHeaders })
}

// Browser: create a client using the env vars returned by the loader.
export default function Index() {
  const { env } = useLoaderData<typeof loader>()

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)

  return <div>...</div>
}
```

### Congratulations \[#remix-congratulations]

To recap, you've:

- Created a server client in the `loader` to load data and manage the session.
- Created a server client in the `action` to handle form submissions and mutations.
- Created a browser client in the default component, using the values the `loader` returned.

You can now use any Supabase feature from your client or server code.

**Nuxt**

### Create the Supabase clients \[#nuxt-create-clients]

**Server route**

```ts server/api/hello.ts
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { appendHeader, defineEventHandler, getHeader, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createServerClient(
    config.public.supabaseUrl,
    config.public.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(getHeader(event, 'Cookie') ?? '')
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            appendHeader(event, 'Set-Cookie', serializeCookieHeader(name, value, options))
          })
          Object.entries(cacheHeaders).forEach(([key, value]) => setHeader(event, key, value))
        },
      },
    }
  )

  await supabase.auth.getClaims()

  return { ok: true }
})
```

**Browser plugin**

```ts plugins/supabase.client.ts
import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabasePublishableKey
  )

  return {
    provide: {
      supabase,
    },
  }
})
```

### Congratulations \[#nuxt-congratulations]

To recap, you've:

- Created a server client in a server route for code that runs on the server.
- Created a browser client in a plugin for code that runs in the browser.

You can now use any Supabase feature from your client or server code.

**React Router**

### Create the Supabase clients \[#react-router-create-clients]

In React Router, a route module such as `_index.tsx` can export a `loader`, an `action`, and a default component. Create a server client inside the `loader` and `action`, and a browser client inside the component, passing the env vars through the `loader`.

```ts _index.tsx
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'

// Server: load data and manage the user's session.
export async function loader({ request }: LoaderFunctionArgs) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHeaders.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
          Object.entries(cacheHeaders).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  // Use `supabase` here for server-side work, e.g. await supabase.auth.getClaims()

  // Return the env vars so the browser can create its own client.
  return data(
    {
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY!,
      },
    },
    { headers: responseHeaders }
  )
}

// Server: handle form submissions and mutations.
export async function action({ request }: ActionFunctionArgs) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHeaders.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
          Object.entries(cacheHeaders).forEach(([key, value]) => responseHeaders.set(key, value))
        },
      },
    }
  )

  return data(null, { headers: responseHeaders })
}

// Browser: create a client using the env vars returned by the loader.
export default function Index() {
  const { env } = useLoaderData<typeof loader>()

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)

  return <div>...</div>
}
```

### Congratulations \[#react-router-congratulations]

To recap, you've:

- Created a server client in the `loader` and the `action`.
- Created a browser client in the default component, using the values the `loader` returned.

You can now use any Supabase feature from your client or server code.

**Express**

### Create the Supabase clients \[#express-create-clients]

**Server Client**

```js lib/supabase.js
const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')

exports.createClient = (context) => {
  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.req.headers.cookie ?? '')
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          context.res.appendHeader('Set-Cookie', serializeCookieHeader(name, value))
        )
        Object.entries(headers).forEach(([key, value]) => context.res.setHeader(key, value))
      },
    },
  })
}
```

**Route**

```js app.js
require("dotenv").config()

const express = require("express")

const { createClient } = require("./lib/supabase")

const app = express()

app.post("/hello-world", async function (req, res, next) {
  const { email, emailConfirm } = req.body
  ...

  const supabase = createClient({ req, res })
})
```

### Congratulations \[#express-congratulations]

To recap, you've:

- Created a request-specific server client.
- Used that client in a route to make authenticated requests.

You can now use any Supabase feature from your client or server code.

**Hono**

### Create the Supabase clients \[#hono-create-clients]

**Server Client**

Create a Hono middleware that creates a Supabase client.

**Route**

You can now use this middleware in your Hono application to create a server Supabase client that can be used to make authenticated requests.

### Congratulations \[#hono-congratulations]

To recap, you've:

- Created a Hono middleware that builds a request-specific server client.
- Used that client in a route to make authenticated requests.

You can now use any Supabase feature from your client or server code.

**TanStack Start**

### Write utility functions to create Supabase clients \[#tanstack-utility-functions]

TanStack Start renders matched routes on the server by default, so `beforeLoad` and `loader` run server-side on the initial request. Unlike Next.js, this means you don't need a proxy or middleware layer to keep sessions fresh. The server client reads and writes the session cookie directly on each request.

Create a `lib/supabase` folder at the root of your project, or inside the `./src` folder if you are using one, then add a file for each type of client:

1. **Create a browser client in `lib/supabase/client.ts`.** Use it to access Supabase from components that run in the browser.
2. **Create a server client in `lib/supabase/server.ts`.** Use it to access Supabase from loaders, server functions, and other code that runs only on the server.

Copy the lib utility functions below into each file:



### Protecting routes

TanStack Start has no global middleware layer, so protect each route explicitly.

To protect your routes:

1. Write a server function, `fetchClaims`, that calls `supabase.auth.getClaims()` and returns the claims, or `null` if the session isn't valid.
2. Call `fetchClaims` from a layout route's `beforeLoad` hook, such as `_protected.tsx`, before any nested route renders. Redirect to `/login` when it returns `null`.

Danger: Skipping the check inside the server function exposes private data to unauthenticated users. `beforeLoad` runs on the server for the initial request and on the client for later navigation, but either way it only gates the route's render. It doesn't stop the server function from being called directly. Because there's no proxy re-checking every request, the server function is the only checkpoint that always runs, so it must call `supabase.auth.getClaims()` to authorize the request itself.

`getClaims()` validates the JWT signature on every call, the same check the Next.js Proxy relies on. Calling it inside the server function gives TanStack Start's per-route check that same guarantee, because the function runs on every request to a protected route.



Any other server function that returns or mutates private data needs this same check. Don't rely on a route being nested under `_protected` alone.

### Congratulations \[#tanstack-congratulations]

To recap, you've:

- Set up a Supabase client utility to call Supabase from a browser component. You can use this if you need to call Supabase from the browser, for example to set up a realtime subscription.
- Set up a server client utility to call Supabase from loaders and server functions.
- Protected a route with `beforeLoad`, backed by a server function that authorizes the request itself.

You can now use any Supabase feature from your client or server code.

## Choosing an auth method

The Supabase Auth SDK contains three different functions for authenticating user access to applications:

### Summary of the methods

- Use [`getClaims`](https://supabase.com/docs/reference/javascript/auth-getclaims) to protect pages and user data. It reads the access token from storage and verifies it. Locally via the [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and a cached JWKS endpoint when the project uses asymmetric signing keys (the default for new projects), or by calling `getUser` solely to validate when symmetric keys are in use. The returned claims always come from decoding the JWT, not from a user lookup. When the access token is close to expiring, `getClaims` refreshes the session before it verifies, which is how a server-rendered session stays alive.
- [`getUser`](https://supabase.com/docs/reference/javascript/auth-getuser) makes a network call to the project's Auth instance to get the user record, which includes the most up-to-date information about the user at the cost of a network call.
- [`getSession`](https://supabase.com/docs/reference/javascript/auth-getsession) when you need the raw session (the access token, refresh token, and expiry). For example to forward the access token to another service. The session is loaded directly from local storage and isn't re-validated against the Auth server, so the embedded user object shouldn't be trusted on its own when storage is shared with the client (cookies, request headers). To verify identity, validate the access token with `getClaims`, or call `getUser` for a fresh, server-confirmed user record.

**In summary**: use `getClaims` to verify identity (typically for protecting pages and data), `getUser` when you need an up-to-date user record from the Auth server, and `getSession` when you need the access or refresh token directly, but don't rely on the user object it returns for authorization decisions.

## Caching considerations

If your app uses ISR (Incremental Static Regeneration) or is deployed behind a CDN, caching of HTTP responses can cause users to receive another user's session. When a session is refreshed, the new token is written to the response via `Set-Cookie`. If that response is cached and served to a different user, that user will be signed in as the wrong person.

See the [advanced Auth server-side rendering guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide#can-i-use-server-side-rendering-with-a-cdn-or-cache) for details and framework-specific examples.

## Next steps

- Implement [Authentication using Email and Password](https://supabase.com/docs/guides/auth/passwords)
- Implement [Authentication using OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Learn more about SSR](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

---

<!-- source: https://supabase.com/docs/guides/getting-started/api-keys -->

# API keys

First-layer protection for your project's data

Every request to your Supabase project carries an API key. The key identifies what is calling your project: a web page, a mobile app, a server, or an Edge Function. [Supabase Auth](https://supabase.com/docs/guides/auth) identifies who is calling, when someone is signed in.

This guide covers:

- [Which key do you use?](#which-key-do-you-use) answers that in one table.
- [How API keys work](#how-api-keys-work) explains what each key type is and which Postgres role it maps to.
- [Find and use your keys](#find-and-use-your-keys) covers the ways to retrieve a key, wiring it into your code, and rotating one that leaked.
- [Security reference](#security-reference) lists what publishable keys don't protect against, how to handle secret keys, and the known limitations.

## Which key do you use?

Pick the key by asking where the code runs.

| Where the code runs                                   | Use this key    | Because                                                               |
| ----------------------------------------------------- | --------------- | --------------------------------------------------------------------- |
| Anything you ship: browser, mobile app, CLI, script   | Publishable key | Anyone can read it, so it only reaches what Row Level Security allows |
| Anything you control: server, Edge Function, cron job | Secret key      | It bypasses Row Level Security, so it must never leave your control   |

Think of your project's data as a building. The publishable key is taped to the front door, and it only opens the lobby. The secret key is the master key, and it stays in your pocket.

After you know which key you need, see [Find and use your keys](#find-and-use-your-keys) to get its value and wire it in. To swap keys in an application that already ships legacy keys, follow [Migrating to new API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys) instead.

Deprecation: Supabase is deprecating the `anon` and `service_role` keys by the end of 2026. Use the publishable (`sb_publishable_xxx`) and secret (`sb_secret_xxx`) keys instead. For the reasoning behind the change, see [the announcement on GitHub](https://github.com/orgs/supabase/discussions/29260).

In most cases you can get keys from your project's [**Connect** dialog](https://supabase.com/dashboard/project/_?showConnect=true\&connectTab=\&framework=). For every way to retrieve a key, including the CLI and the Management API, refer to [Find your keys](https://supabase.com/docs/guides/getting-started/api-keys#find-your-keys).

## How API keys work

### What an API key identifies

An API key authenticates an application component to give it access to Supabase services. An application component might be a web page, a mobile app, or a server. An API key doesn't distinguish between users but between applications.

API keys provide the first layer of authentication for data access. Supabase Auth builds on top of that. This table covers the difference:

| Responsibility                                         | Question                       | Answer                                                  |
| ------------------------------------------------------ | ------------------------------ | ------------------------------------------------------- |
| API keys                                               | What is accessing the project? | A web page, a mobile app, a server, or an Edge Function |
| [Supabase Auth](https://supabase.com/docs/guides/auth) | Who is accessing the project?  | An individual signed-in user                            |

### Key types

Supabase supports four types of API keys:

| Type            | Format               | Privileges | Availability  | Use                                                                                                                                                                                                                                                                                                                                             |
| --------------- | -------------------- | ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publishable key | `sb_publishable_...` | Low        | Platform, CLI | Safe to expose online: web page, mobile or desktop app, GitHub actions, CLIs, source code.                                                                                                                                                                                                                                                      |
| Secret keys     | `sb_secret_...`      | Elevated   | Platform, CLI | Only use in backend components of your app, such as servers, APIs with their own authorization checks, [Edge Functions](https://supabase.com/docs/guides/functions), and microservices. They provide full access to your project's data, bypassing [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security). |
| `anon`          | JWT (long-lived)     | Low        | Platform, CLI | Legacy version of publishable keys.                                                                                                                                                                                                                                                                                                             |
| `service_role`  | JWT (long-lived)     | Elevated   | Platform, CLI | Legacy version of secret keys.                                                                                                                                                                                                                                                                                                                  |

Publishable and secret keys are short strings, not JWTs. If a tool, tutorial, or AI assistant tells you to copy a long key that begins with `eyJ`, it was written for the legacy keys.

Running `supabase start` prints a publishable key and a secret key for your local project. The local secret key takes the place of the local `service_role` key. See the [CLI getting started guide](https://supabase.com/docs/guides/local-development/cli/getting-started) for the full output.

### Legacy `anon` and `service_role` keys

Creating publishable and secret keys doesn't revoke your legacy keys. Both key systems work at the same time.

Creating a publishable or secret key adds it alongside your existing `anon` and `service_role` keys without affecting them, so your legacy keys keep working. They stay valid until you disable them in the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard, which is a separate step.

See [Migrating to new API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys) for the full process.

### Publishable keys and public components

Publishable keys identify the public components of your application. Public components run in environments where you can't keep a secret. These include:

- Web pages, where the key is bundled in source code.
- Mobile or desktop applications, where the key is bundled inside the compiled packages or executables.
- CLI, scripts, tools, or other pre-built executables.
- Public APIs that return the key without requiring authorization first.

These environments are always considered public because anyone can retrieve the key from the source code or build artifacts.

### Postgres roles and Row Level Security

Every key resolves to a built-in Postgres role, and that role is what your Row Level Security policies match on. Using a publishable key doesn't mean your user is anonymous: your application authenticates with the publishable key while your user authenticates separately through Supabase Auth with their own JWT.

| Key             | User signed in through Supabase Auth | Postgres role   |
| --------------- | ------------------------------------ | --------------- |
| Publishable key | No                                   | `anon`          |
| Publishable key | Yes                                  | `authenticated` |
| Secret key      | Not applicable                       | `service_role`  |

Write your Row Level Security policies for the `anon` and `authenticated` roles. Policies never apply to a secret key, because `service_role` has the `BYPASSRLS` attribute.

Postgres evaluates table grants first, and only then applies Row Level Security. The two failures look different. A missing grant returns a permission error, including for `service_role`, whereas a policy that matches no rows returns an empty result. Check the grant before you debug the policy. See [Securing your API](https://supabase.com/docs/guides/api/securing-your-api#grants-and-rls).

### Secret keys and elevated access

Unlike publishable keys, secret keys allow elevated access to your project's data. Use them only in secure, developer-controlled components of your application, such as:

- Servers that run their own authorization checks, such as Edge Functions, microservices, and web servers.
- Periodic jobs, queue processors, topic subscribers.
- Admin and back-office tools that run authorization checks first.
- Data processing pipelines, such as for analytics, reports, backups, or database synchronization.

Danger: A secret key bypasses every Row Level Security policy you have. Never put one in a browser, a shipped application, or source control. For the full list of places a secret key must never go, see [Handling secret keys safely](#handling-secret-keys-safely).

Secret keys authorize access to your project's data through the built-in `service_role` Postgres role. By design, this role has full access to your project's data. It also has the [`BYPASSRLS` attribute](https://www.postgresql.org/docs/current/ddl-rowsecurity.html#:~:text=BYPASSRLS), so it skips every Row Level Security policy you attach.

Secret keys improve on the old JWT-based `service_role` key, and we recommend them wherever possible. They add checks that prevent misuse:

- A secret key doesn't work in a browser. Supabase matches on the `User-Agent` header and returns HTTP 401 Unauthorized.
- A project doesn't need any secret keys if nothing uses them.

## Find and use your keys

Getting a key into an app has two halves. You copy the value, which needs a signed-in Dashboard session, and your code reads it by name. The key itself never belongs in source code, so start by setting these names in `.env`:

```bash .env
# Safe to expose to the browser. Prefix per your framework.
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Server-only. Never prefix these, or your bundler will ship the key.
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

### Find your keys

Pick the path that matches where you are working.

Every path below reads keys that already exist. If your project has no publishable or secret key yet, create them first in the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard.

**Dashboard**

Use the Dashboard when you are setting up a project by hand. It needs nothing but a signed-in session.

1. Open your project's [**Connect** dialog](https://supabase.com/dashboard/project/_?showConnect=true). It shows the URL and publishable key for the framework you select, ready to paste into `.env`.
2. To pick a specific key, or to see every key your project has, open the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard instead. Every key lives there, legacy or not, and there is no separate **Settings > API** page.
3. Copy each value into `.env` under the variable names above.

**Supabase CLI**

Use the CLI to script setup, or to read the keys for a preview branch. This path needs the Supabase CLI, so [install it](https://supabase.com/docs/guides/local-development/cli/getting-started#installing-the-supabase-cli) first.

1. Sign in, if you haven't already:

   ```bash
   supabase login
   ```

2. Find the project ref, if you don't know it:

   ```bash
   supabase projects list
   ```

3. List the keys for that project:

   ```bash
   supabase projects api-keys --project-ref your-project-ref
   ```

Pass the branch's own project ref to read the keys for a preview branch. A branch has its own keys, and the command returns the linked project's keys when you omit the flag.

**Management API**

Use the Management API to fetch keys from your own tooling, such as a deploy script or an internal provisioning service.

Authenticate with a [personal access token](https://supabase.com/dashboard/account/tokens). An OAuth application needs the `secrets:read` scope, and a [scoped personal access token](https://supabase.com/docs/guides/platform/personal-access-tokens) needs the **API Keys** permission with **Read** access. To reveal key values with `reveal=true`, as the example below does, the scoped token also needs **API Key Secrets** with **Read** access. Without the required scope or permissions, the request returns 403 Forbidden.

```bash
export PROJECT_REF="your-project-ref"
export SUPABASE_ACCESS_TOKEN="your-personal-access-token"

curl -X GET "https://api.supabase.com/v1/projects/$PROJECT_REF/api-keys?reveal=true" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | jq '.[] | {name, type}'
```

`reveal=true` includes the key values in the response, and this `jq` filter drops them again so they stay out of your terminal. Write the values straight into your secret store rather than printing them, because anything on standard output lands in your CI logs. See [Get project API keys](https://supabase.com/docs/reference/api/v1-get-project-api-keys) for the full response.

**Local stack**

A local stack mints its own keys. They are unrelated to your hosted project's keys, so a local key never grants access to your hosted data.

This path needs the Supabase CLI and a container runtime. See [Running a local Supabase project](https://supabase.com/docs/guides/local-development/cli/getting-started#running-a-local-supabase-project) for both.

1. Start the stack:

   ```bash
   supabase start
   ```

   The publishable and secret keys are in the output, under **Authentication Keys**.

2. Print them again at any time while the stack is running:

   ```bash
   supabase status
   ```

### Use a publishable key in client code

Pass the publishable key to `createClient` in any code that reaches a user's device.

```ts lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
```

Row Level Security decides what this client can reach, so enable it on every table before you deploy.

### Use a secret key in backend code

Pass the secret key to `createClient` only in code that never reaches a user's device, such as a server route or a worker.

```ts server/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)
```

#### Inside an Edge Function

Don't read the key from the environment inside an Edge Function. Use the [`@supabase/server`](https://supabase.com/docs/guides/functions/auth) SDK instead. It verifies the caller's secret key for you and hands back a privileged client on `ctx`, so the key never appears in your code.

```ts supabase/functions/roster/index.ts
import { withSupabase } from 'npm:@supabase/server@1'

export default {
  fetch: withSupabase({ auth: 'secret' }, async (_req, ctx) => {
    // ctx.supabaseAdmin bypasses Row Level Security
    const { data } = await ctx.supabaseAdmin.from('profiles').select('email')
    return Response.json({ data })
  }),
}
```

Set `verify_jwt = false` for a function called with a secret key rather than a user's token.

```toml supabase/config.toml
[functions.roster]
verify_jwt = false
```

If you build the client yourself instead of using the SDK, read the key from `SUPABASE_SECRET_KEYS`. The runtime injects it as a JSON dictionary keyed by key name, so pick the one you want.

```ts supabase/functions/roster/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2'

const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!)

const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, secretKeys['default'])
```

`SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` still exist in the runtime, but they carry the legacy keys, so reading them keeps you on the deprecated path. See [Environment variables](https://supabase.com/docs/guides/functions/secrets) for the full list of injected variables.

If you are replacing legacy keys in an existing application rather than starting fresh, follow [Migrating to new API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).

### Rotate a leaked or compromised key \[#leaked-key]

This procedure covers both a leaked secret key and a leaked `service_role` key.

Don't rush. Fix the root cause of the leak before you rotate anything. The [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology) helps you judge the severity of the incident and plan your next steps.

1. Create a new secret key in the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard.
2. Replace the compromised key with the new one everywhere your application uses it. If the compromised key is a JWT-based `service_role` key, replace it with the new secret key.
3. Confirm that every component now uses the new key.
4. Retire the compromised key. Delete a secret key, which can't be undone, so don't start until step 3 is done. For a legacy `anon` or `service_role` key, deactivate the legacy keys in the same Dashboard section instead. Deactivation is reversible, so you can re-enable them if you find a client you missed.

## Security reference

### What publishable keys don't protect against

Publishable keys aren't intended to protect against the following, because anyone can retrieve a key from a public component:

- Static or dynamic code analysis and reverse engineering attempts.
- Use of the Network inspector in the browser.
- Cross-site request forgery, cross-site scripting, phishing attacks.
- Man-in-the-middle attacks.

When you use a publishable key, Postgres guards access to your project's data through the built-in `anon` and `authenticated` roles. For full protection, confirm that:

- You have enabled Row Level Security on all tables.
- You regularly review your Row Level Security policies for permissions granted to the `anon` and `authenticated` roles.
- You don't change the roles' attributes without understanding what the change does.

Your project's [Security Advisor](https://supabase.com/dashboard/project/_/advisors/security) checks for common security problems with the built-in Postgres roles. Review each finding carefully before you dismiss it.

### Handling secret keys safely

Exposing a secret key puts all of your project's data at risk. The rules below are grouped by the kind of mistake they prevent.

**Where a secret key must never appear**

- A web page, a public document, source code, or a bundled mobile, desktop, or CLI package.
- A browser, even on `localhost`.

**How a secret key must never travel**

- Over chat, email, or SMS.
- In a URL or a query parameter, because those are often logged.
- In a request header, until you have log sanitization in place.
- Over plain HTTP, or to any host other than your project's Supabase endpoint.

**What must never be written down**

- Don't log a key, even one that looks invalid. A typo today can reveal the real key later.
- If you must record a key, log no more than 6 characters from the random part after its prefix.
- To record which key was used, store a SHA256 hash of it instead.

**Storing and sharing a secret key**

- Work with secret keys only on computers you fully own or control.
- Encrypt keys stored in files or environment variables.
- Keep keys out of source control, including CI scripts. Use the tool's own secrets storage instead.
- Share keys through an encrypted transfer tool, such as the one in your password manager. Better still, have the other person read the key from the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard.

**Limiting the damage of a leak**

- Use a separate secret key for each backend component. If one component leaks its key, you only rotate that one.
- Delete a leaked key immediately. The browser block returns HTTP 401 Unauthorized, but an attacker can still use the key from other tools.

Handle secret keys using [secure coding practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/stable-en/).

### Known limitations

Publishable and secret keys aren't JWTs, which creates a few compatibility differences to plan for:

- Send publishable and secret keys on the `apikey` header, not on `Authorization: Bearer`. Because the keys aren't JWTs, anything that tries to verify one as a JWT fails. For migration compatibility the `verify_jwt` platform check accepts them on either header, but passing that check doesn't authenticate the caller. See [Authorization headers](https://supabase.com/docs/guides/functions/auth-headers).
- Edge Functions need to authorize API keys in code. The `verify_jwt` check alone doesn't authenticate a caller that sends only an API key. Use the `@supabase/server` SDK, as shown in [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth), rather than relying on the platform check.
- Public Realtime connections last a maximum of 24 hours, unless the connection is upgraded to user-level authentication through Supabase Auth or a supported third-party auth provider.

---

<!-- source: https://supabase.com/docs/guides/database/postgres/row-level-security -->

# Row Level Security

Secure your data using Postgres Row Level Security.

Postgres [Row Level Security (RLS)](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) gives you granular authorization rules that run inside the database.

Danger: A table in an exposed schema without RLS is readable and writable by any role with a grant on it. Enable RLS on every table in an exposed schema. On projects that still grant `anon` and `authenticated` by default, revoke those grants. Adding policies doesn't remove them.

Use the guide in three parts:

- [Understand Row Level Security](#understand-row-level-security) explains how grants and policies combine to control access.
- [Secure a table with RLS](#secure-a-table-with-rls) is the procedure to follow for every table in an exposed schema: grants, policies, and `supabase test db`.
- [RLS reference](#rls-reference) documents the helper functions and patterns you use inside a policy expression.

Read the first section when you're deciding how to model access. Go directly to the second section when you're ready to secure a table.

## Understand Row Level Security

### What a policy does

[Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html) are Postgres's rule engine. Each policy is attached to a table, and the policy is executed every time a table is accessed.

Think of a policy as adding a `WHERE` clause to every query. A policy like this:

```sql
create policy "Individuals can view their own todos."
on todos for select
to authenticated
using ( (select auth.uid()) = user_id );
```

That policy translates to this whenever a user selects from the todos table:

```sql
select *
from todos
where auth.uid() = todos.user_id;
-- Policy is implicitly added.
```

You write RLS rules in SQL, so a rule can express whatever access logic your app needs. Because RLS is a Postgres primitive, it also protects your data when it is reached through third-party tooling, which is what makes it "[defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_\(computing\))". Combine RLS with [Supabase Auth](https://supabase.com/docs/guides/auth) for end-to-end user security from the browser to the database.

### Grants and policies

Postgres runs two checks before a client touches a table. Grants decide whether a role can run an operation on the table at all. Policies decide which rows that operation applies to. Set both for every table you expose.

On existing projects, a new table in `public` starts with every privilege already granted to all three roles:

| Role            | Granted automatically                  | What it should keep                                     |
| --------------- | -------------------------------------- | ------------------------------------------------------- |
| `anon`          | `select`, `insert`, `update`, `delete` | Only what signed-out visitors are meant to read         |
| `authenticated` | `select`, `insert`, `update`, `delete` | Only the operations your app exposes to signed-in users |
| `service_role`  | `select`, `insert`, `update`, `delete` | Full access. It bypasses RLS, so keep it server-side    |

Adding policies doesn't take those grants back. A table protected only by policies still hands `anon` an insert path if you never revoke the grant.

Not every project grants these automatically. See [Default privileges](https://supabase.com/docs/guides/api/securing-your-api#default-privileges). Grant each role only the operations it needs.

A missing grant raises a `42501` error before any policy runs. When a request fails that your policy should allow, check the grants before you change the policy. To set them, see [Enable RLS and set the grants](#enable-rls-and-set-the-grants).

### Authenticated and unauthenticated roles

Supabase maps every request to one of the roles:

- `anon`: an unauthenticated request (the user is not signed in)
- `authenticated`: an authenticated request (the user is signed in)

These are [Postgres Roles](https://supabase.com/docs/guides/database/postgres/roles). You can use these roles within your Policies using the `TO` clause:

```sql
create policy "Profiles are viewable by everyone"
on profiles for select
to authenticated, anon
using ( true );

-- OR

create policy "Public profiles are viewable only by authenticated users"
on profiles for select
to authenticated
using ( true );
```

Note: Using the `anon` Postgres role is different from an [anonymous user](https://supabase.com/docs/guides/auth/auth-anonymous) in Supabase Auth. An anonymous user assumes the `authenticated` role to access the database and can be differentiated from a permanent user by checking the `is_anonymous` claim in the JWT.

A policy that reads `to anon using ( true )` grants every unauthenticated visitor read access to every row the role can already reach through grants. Use it only for data that is meant to be public.

### Views and RLS

Views bypass RLS by default because they are usually created with the `postgres` user. This is a feature of Postgres, which automatically creates views with `security definer`. A view over a protected table hands out every row its policies were meant to withhold, so a view needs the same attention as a table. To create one safely, see [Expose a view safely](#expose-a-view-safely).

## Secure a table with RLS

Follow these steps for every table in an exposed schema:

1. [Enable RLS and set the grants](#enable-rls-and-set-the-grants) to match the app.
2. [Write a policy per operation](#write-a-policy-for-each-operation).
3. [Create a `.sql` file under `supabase/tests/`](#policy-tests) that asserts allow and deny for `select`, `insert`, `update`, and `delete`, for `anon` and `authenticated`.
4. [Run `supabase test db`](#run-the-test-suite) and fix what it reports.

Until the suite passes, you don't know whether the policies do what you intended.

### Enable RLS and set the grants

Run these statements in the [SQL Editor](https://supabase.com/dashboard/project/_/sql/new) for a one-off change, or in a [migration](https://supabase.com/docs/guides/deployment/database-migrations) to keep the change reproducible across environments. Grants and RLS belong in the same migration.

Enable RLS, then set the grants to match what each role does in your app:

1. Enable RLS on the table.

   ```sql
   alter table public.reports enable row level security;
   ```

   Once RLS is enabled, no data is accessible through the [API](https://supabase.com/docs/guides/api) when using a publishable key, until you create policies.

2. Revoke any existing grants from both client roles.

   ```sql
   revoke all on table public.reports from anon, authenticated;
   ```

3. Grant back only the privileges the role needs.

   ```sql
   -- Signed-in users manage reports. Signed-out visitors get nothing.
   grant select, insert, update, delete on table public.reports to authenticated;
   ```

4. Write the test file for the table, and run the suite.

   ```bash
   supabase test new reports_rls.test
   supabase test db
   ```

   Give every table you secure one. The examples below show what goes in the file.

Data that clients read but never write, such as a feed a backend job populates, gets select only. The policy and the test file are part of the same change:

```sql
alter table public.announcements enable row level security;
revoke all on table public.announcements from anon, authenticated;
grant select on table public.announcements to anon, authenticated;

create policy "Anyone can read announcements"
on public.announcements for select
to anon, authenticated
using ( true );
```

```sql supabase/tests/announcements_rls.test.sql
-- File: supabase/tests/announcements_rls.test.sql
-- Create: supabase test new announcements_rls.test
-- Run:    supabase test db
-- Repeat for every public-read table you secured.
begin;
select plan(10);

insert into announcements (id, body)
values ('33333333-3333-3333-3333-333333333333', 'published');

-- A read has to return the row. lives_ok passes on an empty result.
select ok(
  not has_table_privilege('anon', 'public.announcements', 'insert,update,delete'),
  'anon holds no write grant on the feed'
);
select ok(
  not has_table_privilege('authenticated', 'public.announcements', 'insert,update,delete'),
  'authenticated holds no write grant on the feed'
);

set local role anon;
select results_eq(
  $$select body from announcements where id = '33333333-3333-3333-3333-333333333333'$$,
  array['published'],
  'anon reads the feed'
);
select throws_ok(
  $$insert into announcements select * from announcements$$,
  '42501',
  null,
  'anon cannot insert into the feed'
);
select throws_ok(
  $$update announcements set id = id$$,
  '42501',
  null,
  'anon cannot update the feed'
);
select throws_ok(
  $$delete from announcements$$,
  '42501',
  null,
  'anon cannot delete from the feed'
);

set local role authenticated;
select results_eq(
  $$select body from announcements where id = '33333333-3333-3333-3333-333333333333'$$,
  array['published'],
  'authenticated reads the feed'
);
select throws_ok(
  $$insert into announcements select * from announcements$$,
  '42501',
  null,
  'authenticated cannot insert into the feed'
);
select throws_ok(
  $$update announcements set id = id$$,
  '42501',
  null,
  'authenticated cannot update the feed'
);
select throws_ok(
  $$delete from announcements$$,
  '42501',
  null,
  'authenticated cannot delete from the feed'
);

select * from finish();
rollback;
```

If new tables still receive automatic grants, see [Revoke default privileges](https://supabase.com/docs/guides/api/securing-your-api#revoke-default-privileges). To enable RLS automatically on every new table, see [Event triggers](https://supabase.com/docs/guides/database/postgres/event-triggers).

### Write a policy for each operation

Write a separate policy for `select`, `insert`, `update`, and `delete`. Postgres does not accept multiple operations in one `for` clause, and a `for all` policy hides which operation each rule was meant to cover.

These examples use a `profiles` table where each user manages only their own row:

```sql
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

alter table profiles enable row level security;

revoke all on table profiles from anon, authenticated;
grant select, insert, update, delete on table profiles to authenticated;
```

Supabase provides [helper functions](#helper-functions) that simplify RLS if you are using Supabase Auth. `auth.uid()` returns the ID of the user making the request.

#### SELECT policies

You can specify select policies with the `using` clause.

```sql
create policy "Users can view their own profile."
on profiles for select
to authenticated
using ( (select auth.uid()) = user_id );
```

#### INSERT policies

You can specify insert policies with the `with check` clause. The `with check` expression ensures that any new row adheres to the policy constraints, so a user cannot create a row that belongs to someone else.

```sql
create policy "Users can create their own profile."
on profiles for insert
to authenticated
with check ( (select auth.uid()) = user_id );
```

#### UPDATE policies

You can specify update policies by combining the `using` and `with check` expressions. The `using` clause decides which existing rows can be updated. The `with check` clause decides what the resulting row is allowed to look like, which stops a user from reassigning `user_id` to someone else.

```sql
create policy "Users can update their own profile."
on profiles for update
to authenticated
using ( (select auth.uid()) = user_id )       -- checks the existing row
with check ( (select auth.uid()) = user_id ); -- checks the resulting row
```

If no `with check` expression is defined, the `using` expression decides both which rows are visible and which new rows are allowed.

Caution: To perform an `UPDATE` operation, a corresponding [`SELECT` policy](#select-policies) is required. Without a `SELECT` policy, the `UPDATE` operation will not work as expected.

#### DELETE policies

You can specify delete policies with the `using` clause.

```sql
create policy "Users can delete their own profile."
on profiles for delete
to authenticated
using ( (select auth.uid()) = user_id );
```

#### Policy tests

When you adapt those four policies to a table, add this file for that table. The path is `supabase/tests/<table>_rls.test.sql`. For a table users share, also assert that a member who is not the owner can perform the operations its policies allow, and that a non-member cannot.

```sql supabase/tests/profiles_rls.test.sql
-- File: supabase/tests/profiles_rls.test.sql
-- Create: supabase test new profiles_rls.test
-- Run:    supabase test db
-- One file per table you enabled RLS on. Name that table in the assertions.
-- Do not create a table only the tests use.
begin;
select plan(14);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.com');

-- anon holds no grant, so the request stops before any policy runs.
set local role anon;
select throws_ok(
  $$select * from profiles$$,
  '42501',
  null,
  'anon cannot read profiles'
);
select throws_ok(
  $$insert into profiles (id, user_id, avatar_url)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      'anon.png'
    )$$,
  '42501',
  null,
  'anon cannot create a profile'
);
select throws_ok(
  $$update profiles set avatar_url = 'anon.png'$$,
  '42501',
  null,
  'anon cannot update profiles'
);
select throws_ok(
  $$delete from profiles$$,
  '42501',
  null,
  'anon cannot delete profiles'
);

-- The owner writes their own row. returning proves the row changed.
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$insert into profiles (id, user_id, avatar_url)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      'owner.png'
    )
    returning avatar_url$$,
  array['owner.png'],
  'the owner creates their own profile'
);
select results_eq(
  $$select avatar_url from profiles where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array['owner.png'],
  'the owner reads their own profile'
);
select results_eq(
  $$update profiles set avatar_url = 'updated.png'
    where user_id = '11111111-1111-1111-1111-111111111111'
    returning avatar_url$$,
  array['updated.png'],
  'the owner updates their own profile'
);

-- A signed-in stranger holds the grant, so the policy is what stops them.
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select throws_ok(
  $$insert into profiles (id, user_id, avatar_url)
    values (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      'stolen.png'
    )$$,
  '42501',
  null,
  'another user cannot create a profile for the owner'
);
select is_empty(
  $$select * from profiles$$,
  'another user reads no profiles'
);
select is_empty(
  $$update profiles set avatar_url = 'stolen.png' returning avatar_url$$,
  'another user updates no profiles'
);

-- Matching no rows is not proof on its own. Pair every denied write with a
-- check that the row it targeted is intact. Scope it to that row: a suite
-- that asserts on everything a role can see breaks once the table holds more.
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select avatar_url from profiles where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array['updated.png'],
  'the denied update left the owner row intact'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select is_empty(
  $$delete from profiles returning avatar_url$$,
  'another user deletes no profiles'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select avatar_url from profiles where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array['updated.png'],
  'the denied delete left the owner row intact'
);

-- Owner delete last so earlier cases still have a row to assert against.
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$delete from profiles where user_id = '11111111-1111-1111-1111-111111111111'
    returning avatar_url$$,
  array['updated.png'],
  'the owner deletes their own profile'
);

select * from finish();
rollback;
```

Match the assertion to how the request is denied. Only two of the three raise an error:

| Denied by                              | Postgres                          | Assert with                                                                                  |
| -------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| A missing grant                        | raises `42501`                    | `throws_ok`                                                                                  |
| A `with check` violation               | raises `42501`                    | `throws_ok`                                                                                  |
| A `using` clause filtering the row out | raises nothing, matches zero rows | `is_empty` over the statement with `returning`, then a read proving the target row is intact |

Never prove an allowed write with `lives_ok`. It passes when the write matched zero rows. Add `returning` and assert the returned value.

Switch role and identity with `set local role` and `set local request.jwt.claim.sub`.

### Specify roles in your policies

Always name the role a policy applies to, using the `to` clause. Instead of this:

```sql
create policy "rls_test_select" on rls_test
using ( auth.uid() = user_id );
```

Use:

```sql
create policy "rls_test_select" on rls_test
to authenticated
using ( (select auth.uid()) = user_id );
```

This prevents the policy `( (select auth.uid()) = user_id )` from running for any `anon` users, since the execution stops at the `to authenticated` step.

### Run the test suite

The files above live under `supabase/tests/` and run through [pgTAP](https://supabase.com/docs/guides/database/extensions/pgtap). Create them with `supabase test new <table>_rls.test`, and run them with `supabase test db`.

[`supabase-test-helpers`](https://github.com/usebasejump/supabase-test-helpers/tree/main) adds `tests.create_supabase_user()`, `tests.authenticate_as()`, and `tests.rls_enabled()`. See [Advanced pgTAP testing](https://supabase.com/docs/guides/local-development/testing/pgtap-extended) and [Testing your database](https://supabase.com/docs/guides/database/testing).

### Add indexes

Add an [index](https://supabase.com/docs/guides/database/postgres/indexes) on every column your policies filter on. Postgres evaluates the policy against each candidate row, so an unindexed filter column turns a read into a sequential scan. For a policy like this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

You can add an index like:

```sql
create index userid
on test_table
using btree (user_id);
```

A column counts as indexed only when it comes first in a `btree` index. Postgres can't use a multi-column index to filter on a column that isn't the leading one, so a composite primary key indexes its first column and no others. A membership table keyed on `(team_id, user_id)` has no index on `user_id`:

```sql
create table team_members (
  team_id uuid references teams (id),
  user_id uuid references auth.users (id),
  primary key (team_id, user_id)
);

-- The primary key covers team_id. A policy filtering on user_id needs its own index.
create index team_members_user_id_idx
on team_members
using btree (user_id);
```

### Call functions with `select`

You can use `select` statement to improve policies that use functions. For example, instead of this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( auth.uid() = user_id );
```

You can do:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

This method works well for JWT functions like `auth.uid()` and `auth.jwt()` as well as `security definer` Functions. Wrapping the function causes an `initPlan` to be run by the Postgres optimizer, which allows it to "cache" the results per-statement, rather than calling the function on each row.

Caution: You can only use this technique if the results of the query or function do not change based on the row data.

Indexing the filter columns and wrapping helper calls keeps policies fast as a table grows. For the measured impact, and for tuning beyond these two rules, see [Row Level Security performance](https://supabase.com/docs/guides/database/postgres/row-level-security-performance).

### Expose a view safely

In Postgres 15 and above, make a view obey the RLS policies of its underlying tables when invoked by `anon` and `authenticated` by setting `security_invoker = true`.

```sql
create view <VIEW_NAME>
with(security_invoker = true)
as select <QUERY>
```

In older versions of Postgres, protect your views by revoking access from the `anon` and `authenticated` roles, or by putting them in an unexposed schema.

## RLS reference

These are the functions and patterns available inside a policy expression.

### Helper functions

Supabase provides some helper functions that make it easier to write policies.

#### `auth.uid()`

Returns the ID of the user making the request.

Caution: When a request is made without an authenticated user (e.g., no access token is provided or the session has expired), `auth.uid()` returns `null`.

This means that a policy like:

```sql
USING (auth.uid() = user_id)
```

will silently fail for unauthenticated users, because:

```sql
null = user_id
```

is always false in SQL.

To avoid confusion and make your intention clear, we recommend explicitly checking for authentication:

```sql
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
```

#### `auth.jwt()`

Caution: Not all information present in the JWT should be used in RLS policies. For instance, creating an RLS policy that relies on the `user_metadata` claim can create security issues in your application as this information can be modified by authenticated end users.

Returns the JWT of the user making the request. Anything that you store in the user's `raw_app_meta_data` column or the `raw_user_meta_data` column will be accessible using this function. It's important to know the distinction between these two:

- `raw_user_meta_data` - can be updated by the authenticated user using the `supabase.auth.update()` function. It is not a good place to store authorization data.
- `raw_app_meta_data` - cannot be updated by the user, so it's a good place to store authorization data.

The `auth.jwt()` function is extremely versatile. For example, if you store some team data inside `app_metadata`, you can use it to determine whether a particular user belongs to a team. For example, if this was an array of IDs:

```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

Caution: Keep in mind that a JWT is not always up-to-date. In the team policy example, even if you remove a user from a team and update the `app_metadata` field, that will not be reflected using `auth.jwt()` until the user's JWT is refreshed.

Also, if you are using Cookies for Auth, then you must be mindful of the JWT size. Some browsers are limited to 4096 bytes for each cookie, and so the total size of your JWT should be small enough to fit inside this limitation.

#### MFA

The `auth.jwt()` function can be used to check for [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa#enforce-rules-for-mfa-logins). For example, you could restrict a user from updating their profile unless they have at least 2 levels of authentication (Assurance Level 2):

```sql
create policy "Restrict updates."
on profiles
as restrictive
for update
to authenticated using (
  (select auth.jwt()->>'aal') = 'aal2'
);
```

### Use security definer functions

A "security definer" function runs using the same role that *created* the function. This means that if you create a role with a superuser (like `postgres`), then that function will have `bypassrls` privileges. For example, if you had a policy like this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using (
  exists (
    select 1 from roles_table
    where (select auth.uid()) = user_id and role = 'good_role'
  )
);
```

We can instead create a `security definer` function which can scan `roles_table` without any RLS penalties:

```sql
create function private.has_good_role()
returns boolean
language plpgsql
security definer -- will run as the creator
set search_path = '' -- every name inside must be schema-qualified
as $$
begin
  return exists (
    select 1 from public.roles_table
    where (select auth.uid()) = user_id and role = 'good_role'
  );
end;
$$;

-- Update our policy to use this function:
create policy "rls_test_select"
on test_table
to authenticated
using ( (select private.has_good_role()) );
```

Add member and non-member cases to that table's file under `supabase/tests/`. A member who is not the owner must be allowed; a non-member must not.

Set `search_path = ''` on every `security definer` function and schema-qualify the names inside it. Without a pinned `search_path`, a caller can point an unqualified name at their own object and run it with the function owner's privileges.

Caution: A `security definer` function in an exposed schema is callable over the Data API with the creator's privileges. Never create one in a schema listed under "Exposed schemas" in your [API settings](https://supabase.com/dashboard/project/_/settings/api).

### Avoid recursive policies

Two tables whose policies read each other never resolve. Postgres raises `42P17`, `infinite recursion detected in policy for relation`, and the query fails for every role the policies apply to.

Sharing features produce this shape. A policy on `lists` checks `list_members` to find who the list is shared with, and a policy on `list_members` checks `lists` to find who owns it:

```sql
-- Reject: each policy reads the table the other one protects.
create policy "members read lists" on lists for select
to authenticated
using (
  exists (
    select 1 from list_members m
    where m.list_id = lists.id and m.user_id = (select auth.uid())
  )
);

create policy "members read membership" on list_members for select
to authenticated
using (
  exists (
    select 1 from lists l
    where l.id = list_members.list_id and l.owner_id = (select auth.uid())
  )
);
```

Break the cycle with a [security definer function](#use-security-definer-functions). It reads the membership table as its owner, so the second policy never runs and the cycle is broken:

```sql
create schema if not exists private;

create function private.user_list_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select list_id from public.list_members
  where user_id = (select auth.uid())
$$;

revoke execute on function private.user_list_ids() from public;
grant usage on schema private to authenticated;
grant execute on function private.user_list_ids() to authenticated;

create policy "members read lists" on lists for select
to authenticated
using ( id in (select private.user_list_ids()) );

create policy "members read membership" on list_members for select
to authenticated
using ( list_id in (select private.user_list_ids()) );
```

The function filters on `(select auth.uid())`, so it returns only the caller's lists. A member who doesn't own the list still reads it, and a non-member reads nothing.

This works because the function runs as its owner, and a `security definer` function only skips RLS when its owner can. On Supabase the owner is `postgres`, which has `bypassrls`. A function owned by a role without `bypassrls`, or reading a table set to `force row level security`, evaluates the membership policy again and stays recursive.

### Bypassing Row Level Security

Use a [secret key](https://supabase.com/docs/guides/getting-started/api-keys) for administrative tasks that need to bypass RLS. A secret key authorizes access through the `service_role` Postgres role, which has the `bypassrls` attribute. Never use a secret key in the browser or expose it to customers.

The JWT-based `service_role` key is a legacy alternative. Prefer a secret key where possible.

Note: A secret key bypasses RLS only when the request carries no user access token. If the request carries one, it runs under the RLS policies of that signed-in user, even when the client library was initialized with a secret key.

You can also create new [Postgres Roles](https://supabase.com/docs/guides/database/postgres/roles) which can bypass Row Level Security using the "bypass RLS" privilege:

```sql
alter role "role_name" with bypassrls;
```

This can be useful for system-level access. **Never** share login credentials for any Postgres Role with this privilege.

## Related content

- [Row Level Security performance](https://supabase.com/docs/guides/database/postgres/row-level-security-performance): diagnose whether policies are your bottleneck, and tune ones that are already correct.
- [Advanced pgTAP testing](https://supabase.com/docs/guides/local-development/testing/pgtap-extended): schema-wide RLS test helpers and a worked multi-tenant example.
- [Testing your database](https://supabase.com/docs/guides/database/testing): the CLI test workflow that `supabase test db` runs.
- [Securing your API](https://supabase.com/docs/guides/api/securing-your-api): grants, dedicated schemas, and pre-request checks around the Data API.
- [Column Level Security](https://supabase.com/docs/guides/database/postgres/column-level-security): restrict access to individual columns.
- [`supabase-test-helpers`](https://github.com/usebasejump/supabase-test-helpers/tree/main): a community extension that adds user creation and role impersonation helpers to pgTAP.

---

<!-- source: https://supabase.com/docs/guides/database/migrations -->

# Database Migrations

How to manage schema migrations for your Supabase project.

Database migrations are SQL statements that create, update, or delete your existing database schemas. They are a common way of tracking changes to your database over time.

## Schema migrations

For this guide, we'll create a table called `employees` and see how we can make changes to it.

You will need to [install](https://supabase.com/docs/guides/local-development#quickstart) the Supabase CLI and start the local development stack.

Note: If a lock timeout error occurs, in your migration file, consider increasing your [`lock_timeout`](https://postgresqlco.nf/doc/en/param/lock_timeout/) setting.

1. **Create your first migration file**

To get started, generate a [new migration](https://supabase.com/docs/reference/cli/supabase-migration-new) to store the SQL needed to create our `employees` table.

```bash name=Terminal
supabase migration new create_employees_table
```

2. **Add the SQL to your migration file**

This creates a new migration file in supabase/migrations directory.

To that file, add the SQL to create this `employees` table.

```sql name=supabase/migrations/<timestamp>_create_employees_table.sql
create table if not exists employees (
  id bigint primary key generated always as identity,
  name text not null,
  email text,
  created_at timestamptz default now()
);
```

3. **Apply your first migration**

Run this migration to create the `employees` table.

Now you can visit your new `employees` table in the local Dashboard.

```bash name=Terminal
supabase migration up
```

4. **Modify your employees table**

Next, modify your `employees` table by adding a column for `department`.

```bash name=Terminal
supabase migration new add_department_column
```

5. **Add a new column to your table**

To that new migration file, add the SQL to create a new `department` column.

```sql name=supabase/migrations/<timestamp>_add_department_column.sql
alter table if exists public.employees
add department text default 'Hooli';
```

6. **Apply your second migration**

Run this migration to update your existing `employees` table.

```bash name=Terminal
supabase migration up
```

Finally, you should see the `department` column added to your `employees` table in the local Dashboard.

Note: View the [complete code](https://github.com/supabase/supabase/tree/master/examples/database/employees) for this example on GitHub.

### Seeding data

Now that you are managing your database with migrations, it would be great have some seed data to use every time you reset the database.

1. **Populate your table**

Create a seed script in supabase/seed.sql.

To that file, add the SQL to insert data into your `employees` table.

```sql name=supabase/seed.sql
insert into public.employees
  (name)
values
  ('Erlich Bachman'),
  ('Richard Hendricks'),
  ('Monica Hall');
```

2. **Reset your database**

Reset your database to reapply migrations and populate with seed data.

```bash name=Terminal
supabase db reset
```

You should now see the `employees` table, along with your seed data in the Dashboard! All of your database changes are captured in code, and you can reset to a known state at any time, complete with seed data.

### Diffing changes

This workflow is great if you know SQL and are comfortable creating tables and columns. If not, you can still use the Dashboard to create tables and columns, and then use the CLI to diff your changes and create migrations.

The SQL that `db diff` generates depends on your project's diff engine.

Which diff engine your project uses depends on `config.toml`. If it contains an `[experimental.pgdelta]` section with `enabled = true`, your project uses `pg-delta`. If the section is missing or `enabled` is `false`, your project uses the legacy `migra` engine. See [Diff engines](https://supabase.com/docs/guides/local-development/diff-engines) for how the two differ and how to switch.

Note: If you'd rather declare the state you want your database to be in and have migrations generated for you, manage your schema declaratively instead. On `pg-delta`, edit files in `supabase/schemas/` and generate migrations with `supabase db schema declarative sync`. Don't use `db diff` to generate migrations from declarative files on that engine, because it never uses `supabase/schemas/` as its baseline. On the legacy `migra` engine, `db schema declarative sync` won't run and `db diff` does read `supabase/schemas/`, so follow [Declarative schemas on the legacy `migra` engine](https://supabase.com/docs/guides/local-development/declarative-database-schemas#declarative-schemas-on-the-legacy-migra-engine) instead. See [Declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas).

Caution: Only use the Dashboard to make schema changes on your **local** database, then capture them with `supabase db diff`. Making schema changes directly on your **remote** database (via the SQL editor or Table Editor) bypasses the migration history and will cause `db push` to fail with sync errors. Once you're using migrations, all schema changes to your remote database should go through migration files only.

1. **Create your table from the Dashboard**

Create a new table called `cities`, with columns `id`, `name` and `population`.

Then generate a [schema diff](https://supabase.com/docs/reference/cli/supabase-db-diff).

```bash name=Terminal
supabase db diff -f create_cities_table
```

2. **Add schema diff as a migration**

A new migration file is created for you.

Alternately, you can copy the table definitions directly from the Table Editor.

```sql name=supabase/migrations/<timestamp>_create_cities_table.sql
create table "public"."cities" (
  "id" bigint primary key generated always as identity,
  "name" text,
  "population" bigint
);
```

3. **Test your migration**

Test your new migration file by resetting your local database.

```bash name=Terminal
supabase db reset
```

The last step is deploying these changes to a live Supabase project.

## Deploy your project

You've been developing your project locally, making changes to your tables via migrations. It's time to deploy your project to the Supabase Platform and start scaling up to millions of users!

Head over to [Supabase](https://supabase.com/dashboard) and create a new project to deploy to.

1. **Sign in to the Supabase CLI**

[Sign in](https://supabase.com/docs/reference/cli/supabase-login) to the Supabase CLI using an auto-generated Personal Access Token.

```bash name=Terminal
supabase login
```

2. **Link your project**

[Link](https://supabase.com/docs/reference/cli/supabase-link) to your remote project by selecting from the on-screen prompt.

```bash name=Terminal
supabase link
```

3. **Deploy database migrations**

[Push](https://supabase.com/docs/reference/cli/supabase-db-push) your migrations to the remote database.

```bash name=Terminal
supabase db push
```

4. **Deploy database seed data (optional)**

[Push](https://supabase.com/docs/reference/cli/supabase-db-push) your migrations and seed the remote database.

```bash name=Terminal
supabase db push --include-seed
```

Visiting your live project on [Supabase](https://supabase.com/dashboard/project/_), you'll see a new `employees` table, complete with the `department` column you added in the second migration above.

## Working with a team

When multiple developers share a Supabase project, a few rules keep migrations from getting out of sync.

**The golden rule: never change the remote database directly.** Once you're using migrations, all schema changes — even small ones — should go through migration files. Using the Dashboard's SQL editor or Table Editor on your remote database bypasses the migration history, and `db push` will start failing with sync errors.

**The team workflow:**

1. **Create a migration locally**

Each developer creates migration files on their own branch, never touching the remote database directly.

```bash name=Terminal
supabase migration new your_change_description
```

2. **Test and commit**

Reset your local database to apply the migration, then commit the migration file to git.

```bash name=Terminal
supabase db reset
git add supabase/migrations
git commit -m "add migration: your_change_description"
```

3. **Pull and reset when a teammate merges a migration**

After pulling new migration files from git, reset your local database to apply them.

```bash name=Terminal
git pull
supabase db reset
```

4. **One person deploys to remote**

Coordinate so only one person runs `db push` at a time. Migration files are applied in timestamp order, so concurrent pushes from different machines can cause conflicts.

```bash name=Terminal
supabase db push
```

Note: For a more automated deployment approach, consider using [Supabase Branching](https://supabase.com/docs/guides/deployment/branching) or a CI/CD pipeline that runs `supabase db push` on merge to your main branch.

## Diagnosing and fixing sync errors

If `db push` fails with errors suggesting you run `supabase migration repair`, your local migration files and the remote database's migration history are out of sync. Here's how to diagnose and fix it.

### How migration tracking works

Supabase tracks which migrations have been applied on each database in a table called `supabase_migrations.schema_migrations`. When you run `supabase db push`, it compares your local `supabase/migrations` folder against that table and runs only the ones not yet applied, in order.

Git tracks your migration *files*. Supabase tracks what's been *applied to each database*. These are two separate systems that need to stay in sync.

### Step 1: Check what's out of sync

Start by listing the migration status across local and remote:

```bash name=Terminal
supabase migration list
```

This shows which migrations are applied locally, which are applied on the remote, and where they diverge.

### Step 2: If you made changes on the remote database directly

Pull the current remote state into a migration file to get back in sync:

```bash name=Terminal
supabase db pull
```

This creates a new migration file capturing the current remote schema. Commit it to git, then follow the standard workflow going forward.

What `db pull` captures in managed schemas depends on your project's diff engine.

Which diff engine your project uses depends on `config.toml`. If it contains an `[experimental.pgdelta]` section with `enabled = true`, your project uses `pg-delta`. If the section is missing or `enabled` is `false`, your project uses the legacy `migra` engine. See [Diff engines](https://supabase.com/docs/guides/local-development/diff-engines) for how the two differ and how to switch.

On `pg-delta`, a plain `supabase db pull` captures your customizations automatically, such as a trigger on `auth.users` that calls a function in `public`, or RLS policies on `storage.objects`. A trigger whose function lives inside `auth` or `storage` is excluded even if you created it, so deliver it through a versioned migration. On the legacy `migra` engine, the initial pull's `pg_dump` skips those schemas, but the diff pass that follows appends your triggers and RLS policies there to the same migration, and later pulls diff them too. Older CLI versions excluded `auth` and `storage` entirely and printed a message saying so. If you see that message, capture existing customizations once with explicit pulls:

```bash name=Terminal
supabase db pull --schema auth
supabase db pull --schema storage
```

See [Diff engines](https://supabase.com/docs/guides/local-development/diff-engines) for what each engine captures in managed schemas.

### Step 3: If the migration history table is wrong

If a migration shows as missing in the remote history table but the schema change is already there (for example, it was applied manually), you can mark it as applied without re-running it:

```bash name=Terminal
supabase migration repair --status applied <migration-timestamp>
```

Or if a migration is recorded as applied but was never run:

```bash name=Terminal
supabase migration repair --status reverted <migration-timestamp>
```

Caution: `migration repair` updates the tracking table only — it does not apply or revert any SQL. Use it to correct the history record when you know the actual database state is correct.

---

<!-- source: https://supabase.com/docs/guides/cli/getting-started -->

# Supabase CLI

Develop locally, deploy to the Supabase Platform, and set up CI/CD workflows

The Supabase CLI provides tools to develop your project locally, deploy to the Supabase Platform, and set up CI/CD workflows.

The Supabase CLI runs the entire Supabase stack on your own machine or in a CI environment, so you can build and test locally, then connect your project to a hosted one when you're ready to deploy.

- [Quickstart](#quickstart) is the two-command version, if you already have the CLI and a container runtime.
- [Set up a local project](#set-up-a-local-project) installs the CLI and brings the stack up on your machine. Start here if you haven't run it before.
- [Connect to a hosted project](#connect-to-a-hosted-project) links your local directory to a project on the Supabase Platform.
- [Change your CLI version](#change-your-cli-version) updates the CLI and switches between stable and pre-release builds.
- [Telemetry](#telemetry) covers what the CLI collects and how to opt out.

## Quickstart

With two commands, you can set up and start a new local project:

1. Run `supabase init` to create a new local project.
2. Run `supabase start` to launch the Supabase services.

Note: How you run a CLI command depends on how you install it. Homebrew, Scoop, and the Linux packages give you a global `supabase` command. Installing with npm, pnpm, yarn, or bun adds the CLI to one project instead, so you run it through your package runner as `npx supabase <command>`. This page writes every example as `supabase <command>`.

The CLI is project-scoped either way. Most commands, including `start`, expect a directory that `supabase init` has already set up with a `supabase` directory and a `config.toml`. Run `init` first, then the rest from the same directory.

## Set up a local project

Install the CLI, bring the Supabase stack up on your machine, and stop it when you're done.

### Install the Supabase CLI \[#installing-the-supabase-cli]

**npm**

1. Install the CLI as a project dev dependency. This command adds the CLI to a single project rather than installing a global command:

   ```sh
   npm install supabase --save-dev
   # or: pnpm add -D supabase / yarn add -D supabase / bun add -D supabase
   ```

2. Pin the version in `package.json` so your whole team uses the same CLI version.

3. Run the CLI through your package runner:

   ```sh
   npx supabase --help
   # or: pnpm supabase / yarn supabase / bunx supabase
   ```

Caution: The Supabase CLI requires **Node.js 20 or later** when run via `npx` or `npm`. Older Node.js versions, such as 16, are not supported and fail to start the CLI.

**macOS**

Install the CLI with [Homebrew](https://brew.sh):

```sh
brew install supabase/tap/supabase
```

**Windows**

Install the CLI with [Scoop](https://scoop.sh):

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux**

The CLI is available via [Homebrew](https://brew.sh) and Linux packages.

#### Homebrew

```sh
brew install supabase/tap/supabase
```

#### Linux packages

Linux packages are provided in [Releases](https://github.com/supabase/cli/releases).

1. Download the `.apk`, `.deb`, or `.rpm` file for your package manager.
2. Install the package:
   - `sudo apk add --allow-untrusted <...>.apk`
   - `sudo dpkg -i <...>.deb`
   - `sudo rpm -i <...>.rpm`

### Run a local Supabase project \[#running-a-local-supabase-project]

The most common thing you'll do with the CLI is run the full Supabase stack (Postgres, Auth, Storage, and the rest) on your own machine. That stack runs in Docker containers, so you need a container runtime installed first. On Windows and Linux, follow the official guide to install and configure [Docker Desktop](https://docs.docker.com/desktop).

On macOS, we recommend [OrbStack](https://orbstack.dev/) instead of Docker Desktop. It's a drop-in replacement that handles extended file attributes (xattrs) on mounted volumes and container networking more reliably than Docker Desktop. It also starts faster and uses less CPU, memory, and disk, which makes a noticeable difference when running the full Supabase stack.

Alternatively, you can use a different container tool that offers Docker-compatible APIs:

| Tool                                          | Platforms             |
| --------------------------------------------- | --------------------- |
| [Rancher Desktop](https://rancherdesktop.io/) | macOS, Windows, Linux |
| [Podman](https://podman.io/)                  | macOS, Windows, Linux |
| [colima](https://github.com/abiosoft/colima)  | macOS                 |

To bring the stack up:

1. Start your container runtime.

2. Open a terminal in the directory where you want to create your project.

3. Initialize the project:

   ```bash
   supabase init
   ```

   The command creates a `supabase` directory, which is safe to commit to version control. `init` creates local files only: it doesn't sign you in or connect the directory to a project on the Supabase Platform. To connect one, see [Connect to a hosted project](#connect-to-a-hosted-project).

4. Start the Supabase services from the same directory:

   ```bash
   supabase start
   ```

Note: If you installed the CLI as a project dependency with npm, pnpm, yarn, or bun, run `npx supabase init` and `npx supabase start` instead. See [Install the Supabase CLI](#installing-the-supabase-cli).

The first run takes time while the CLI downloads the Docker images. It pulls the entire Supabase stack, plus a few extra images useful for local development, such as a local SMTP server and a database diff tool.

### Access your project's services

After all the Supabase services are running, the CLI prints your local credentials. The output looks like this, with the URLs and keys you use in your local project:

```
Started supabase local development setup.

╭──────────────────────────────────────╮
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54323     │
│ Mailpit │ http://127.0.0.1:54324     │
│ MCP     │ http://127.0.0.1:54321/mcp │
╰─────────┴────────────────────────────╯

╭──────────────────────────────────────────────────────╮
│ 🌐 APIs                                              │
├────────────────┬─────────────────────────────────────┤
│ Project URL    │ http://127.0.0.1:54321              │
│ REST           │ http://127.0.0.1:54321/rest/v1      │
│ GraphQL        │ http://127.0.0.1:54321/graphql/v1   │
│ Edge Functions │ http://127.0.0.1:54321/functions/v1 │
╰────────────────┴─────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────╮
│ ⛁ Database                                                    │
├─────┬─────────────────────────────────────────────────────────┤
│ URL │ postgresql://postgres:postgres@127.0.0.1:54322/postgres │
╰─────┴─────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────╮
│ 🔑 Authentication Keys                                       │
├─────────────┬────────────────────────────────────────────────┤
│ Publishable │ sb_publishable_...                             │
│ Secret      │ sb_secret_...                                  │
╰─────────────┴────────────────────────────────────────────────╯
```

**Studio**

```sh
# Default URL:
http://localhost:54323
```

The local development environment includes Supabase Studio, a graphical interface for querying and editing your database.

![Local Supabase Studio showing the Default Project home page, with a sidebar of section icons, a Client libraries row for JavaScript, Python, and Flutter, and a grid of example project cards.](/docs/img/guides/cli/local-studio.png)

**Postgres**

```sh
# Default URL:
postgresql://postgres:postgres@localhost:54322/postgres
```

Access the local Postgres instance with [`psql`](https://www.postgresql.org/docs/current/app-psql.html) or any other Postgres client, such as [pgAdmin](https://www.pgadmin.org/). For example:

```bash
psql 'postgresql://postgres:postgres@localhost:54322/postgres'
```

Note: To access the database from an edge function in your local Supabase setup, replace `localhost` with `host.docker.internal`.

**API Gateway**

```sh
# Default URL:
http://localhost:54321
```

If you are accessing these services without the client libraries, you might need to pass the client keys as an `Authorization` header. Learn more about [JWT headers](https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts).

```sh
curl 'http://localhost:54321/rest/v1/' \
    -H "apikey: sb_publishable_..."

http://localhost:54321/rest/v1/           # REST (PostgREST)
http://localhost:54321/realtime/v1/       # Realtime
http://localhost:54321/storage/v1/        # Storage
http://localhost:54321/auth/v1/           # Auth (GoTrue)
```

**Analytics**

Local logs rely on the Supabase Analytics Server, which reads the Docker logging driver. On Linux and macOS, mount the `/var/run/docker.sock` domain socket. On Windows, expose the `tcp://localhost:2375` daemon socket. Configure the socket manually after [installing the CLI](#installing-the-supabase-cli).

Note: For advanced logs analysis using the Logs Explorer, use the BigQuery backend instead of the default Postgres backend. See [Using the BigQuery backend](https://supabase.com/docs/reference/self-hosting-analytics/introduction#using-the-bigquery-backend).

All logs are stored in the local database under the `_analytics` schema.

### Stop local services \[#stopping-local-services]

When you finish working, stop the stack. Stopping doesn't reset your local database:

```bash
supabase stop
```

With the default ports, `supabase start` runs one local project per machine, because every project's `config.toml` uses the same ports. To run several local projects or git worktrees at the same time, see [Running multiple local projects](https://supabase.com/docs/guides/local-development/running-multiple-local-projects).

## Connect to a hosted project

The stack you started in [Run a local Supabase project](#running-a-local-supabase-project) runs only on your machine. Nothing reaches a hosted project until you sign in to the CLI and link your local directory to one.

For the steps, see [Pushing to a remote project](https://supabase.com/docs/guides/local-development/cli-workflows#pushing-to-a-remote-project). To run deployments from CI, see [Configure GitHub Actions](https://supabase.com/docs/guides/deployment/managing-environments#configure-github-actions).

## Change your CLI version

These sections cover the CLI itself rather than your local project.

### Use the beta channel \[#beta-channel]

Pre-release CLI builds ship from the development branch and are versioned `X.Y.Z-beta.N`. Use the npm `beta` dist-tag, or install `supabase-beta` with Homebrew or Scoop. `supabase-beta` is a separate package from `supabase`.

**npm**

Install as a dev dependency:

```sh
npm install supabase@beta --save-dev
```

Or run without installing:

```sh
npx supabase@beta --help
```

**macOS**

```sh
brew install supabase/tap/supabase-beta
brew link --overwrite supabase-beta
```

**Windows**

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase-beta
```

**Linux**

#### Homebrew

```sh
brew install supabase/tap/supabase-beta
brew link --overwrite supabase-beta
```

#### Linux packages

Beta builds are attached to [GitHub pre-releases](https://github.com/supabase/cli/releases). Download the `.apk`, `.deb`, or `.rpm` for your platform and install with the same commands as [Linux packages](#linux-packages).

### Update the Supabase CLI \[#updating-the-supabase-cli]

Update the CLI with the same package manager you installed it with. See the [CLI releases page](https://github.com/supabase/cli/releases) for available versions.

**npm**

Update the CLI with [npm](https://www.npmjs.com/package/supabase):

```sh
npm update supabase --save-dev
```

Update to the current beta release, or switch a stable install to the beta channel:

```sh
npm install supabase@beta --save-dev
```

**macOS**

```sh
brew upgrade supabase
```

Beta channel:

```sh
brew upgrade supabase-beta
```

**Windows**

```powershell
scoop update supabase
```

Beta channel:

```powershell
scoop update supabase-beta
```

**Linux**

#### Homebrew

```sh
brew upgrade supabase
```

Beta channel:

```sh
brew upgrade supabase-beta
```

#### Linux packages

1. Download the package from the [Supabase CLI releases page](https://github.com/supabase/cli/releases/latest)
2. Install the package using the same commands as the [initial installation](#linux-packages):
   - `sudo apk add --allow-untrusted <...>.apk`
   - `sudo dpkg -i <...>.deb`
   - `sudo rpm -i <...>.rpm`

If you have any Supabase containers running locally, stop them and delete their data volumes before upgrading. Deleting the volumes lets Supabase managed services apply new migrations on a clean local database.

Caution: `supabase stop --no-backup` deletes your local schema and data changes. Save them first.

1. Save local schema changes as a migration:

   ```sh
   supabase db diff -f my_schema
   ```

2. Dump local data to your seed file:

   ```sh
   supabase db dump --local --data-only > supabase/seed.sql
   ```

3. Stop the containers and delete their data volumes:

   ```sh
   supabase stop --no-backup
   ```

## Telemetry

The Supabase CLI collects telemetry data about general usage. Participating in this program is optional, and you can opt out at any time.

### How to opt out

1. Disable telemetry:

   ```bash
   supabase telemetry disable
   ```

2. Confirm the current setting:

   ```bash
   supabase telemetry status
   ```

To enable telemetry again, run `supabase telemetry enable`.

You can also opt out using the `SUPABASE_TELEMETRY_DISABLED=1` environment variable. The broader `DO_NOT_TRACK=1` convention is also respected.

## Learn more

- [CLI configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [CLI reference](https://supabase.com/docs/reference/cli)

---

<!-- source: https://supabase.com/docs/guides/auth/passwords -->

# Password-based Auth

Allow users to sign in with a password connected to their email or phone number.

Users often expect to sign in to your site with a password. Supabase Auth helps you implement password-based auth safely, using secure configuration options and best practices for storing and verifying passwords.

Users can associate a password with their identity using their [email address](#with-email) or a [phone number](#with-phone).

## With email

### Enabling email and password-based authentication

Email authentication is enabled by default.

You can configure whether users need to verify their email to sign in. On hosted Supabase projects, this is true by default. On self-hosted projects or in local development, this is false by default.

Change this setting on the [Auth Providers page](https://supabase.com/dashboard/project/_/auth/providers) for hosted projects, or in the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.email.enable_confirmations) for self-hosted projects.

### Signing up with an email and password

There are two possible flows for email signup: [implicit flow](https://supabase.com/docs/guides/auth/sessions#implicit-flow) and [PKCE flow](https://supabase.com/docs/guides/auth/sessions#pkce-flow). If you're using SSR, you're using the PKCE flow. If you're using client-only code, the default flow depends upon the client library. The implicit flow is the default in JavaScript and Dart, and the PKCE flow is the default in Swift.

The instructions in this section assume that email confirmations are enabled.

**Implicit flow**

The implicit flow only works for client-only apps. Your site directly receives the access token after the user confirms their email.

**JavaScript**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/javascript/auth-signup) with their email address and password.

You can optionally specify a URL to redirect to after the user clicks the confirmation link. This URL must be configured as a [Redirect URL](https://supabase.com/docs/guides/auth/redirect-urls), which you can do in the [dashboard](https://supabase.com/dashboard/project/_/auth/url-configuration) for hosted projects, or in the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.additional_redirect_urls) for self-hosted projects.

If you don't specify a redirect URL, the user is automatically redirected to your site URL. This defaults to `localhost:3000`, but you can also configure this.

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
    options: {
      emailRedirectTo: 'https://example.com/welcome',
    },
  })
}
```

**Dart**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/dart/auth-signup) with their email address and password:

```dart
Future<void> signUpNewUser() async {
  final AuthResponse res = await supabase.auth.signUp(
    email: 'valid.email@supabase.io',
    password: 'example-password'
  );
}
```

**Swift**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/swift/auth-signup) with their email address and password.

You can optionally specify a URL to redirect to after the user clicks the confirmation link. This URL must be configured as a [Redirect URL](https://supabase.com/docs/guides/auth/redirect-urls), which you can do in the [dashboard](https://supabase.com/dashboard/project/_/auth/url-configuration) for hosted projects, or in the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.additional_redirect_urls) for self-hosted projects.

If you don't specify a redirect URL, the user is automatically redirected to your site URL. This defaults to `localhost:3000`, but you can also configure this.

```swift
let response = try await supabase.auth.signUp(
  email: "valid.email@supabase.io",
  password: "example-password",
  redirectTo: URL(string: "https://example.com/welcome")
)
```

**Kotlin**

To sign up the user, call [signUpWith(Email)](https://supabase.com/docs/reference/kotlin/auth-signup) with their email address and password:

```kotlin
suspend fun signUpNewUser() {
	supabase.auth.signUpWith(Email) {
		email = "valid.email@supabase.io"
		password = "example-password"
	}
}
```

**Python**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/python/auth-signup) with their email address and password.

You can optionally specify a URL to redirect to after the user clicks the confirmation link. This URL must be configured as a [Redirect URL](https://supabase.com/docs/guides/auth/redirect-urls), which you can do in the [dashboard](https://supabase.com/dashboard/project/_/auth/url-configuration) for hosted projects, or in the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.additional_redirect_urls) for self-hosted projects.

If you don't specify a redirect URL, the user is automatically redirected to your site URL. This defaults to `localhost:3000`, but you can also configure this.

```python
data = await supabase.auth.sign_up({
  'email': 'valid.email@supabase.io',
  'password': 'example-password',
  'options': {
    'email_redirect_to': 'https://example.com/welcome',
  },
})
```

**C#**

To sign up the user, call [`SignUp()`](https://supabase.com/docs/reference/csharp/sign-up) with their email address and password. You can optionally specify a URL to redirect to after the user clicks the confirmation link.

```c#
var options = new SignUpOptions { RedirectTo = "https://example.com/welcome" };
var session = await supabase.Auth.SignUp("valid.email@supabase.io", "example-password", options);
```

**PKCE flow**

The PKCE flow allows for server-side authentication. Unlike the implicit flow, which directly provides your app with the access token after the user clicks the confirmation link, the PKCE flow requires an intermediate token exchange step before you can get the access token.

##### Step 1: Update signup confirmation email

Update your signup email template to send the token hash. For detailed instructions on how to configure your email templates, including the use of variables like `{{ .SiteURL }}`, `{{ .TokenHash }}`, and `{{ .RedirectTo }}`, refer to our [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) guide.

Your signup email template should contain the following HTML:

```html
<h2>Confirm your email address</h2>

<p>Follow the link below to confirm this email address and finish signing up.</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
    >Confirm email address</a
  >
</p>
```

##### Step 2: Create token exchange endpoint

Create an API endpoint at `<YOUR_SITE_URL>/auth/confirm` to handle the token exchange.

Note: Make sure you're using the right `supabase` client in the following code.

If you're not using Server-Side Rendering or cookie-based Auth, you can directly use the `createClient` from `@supabase/supabase-js`. If you're using Server-Side Rendering, see the [Server-Side Auth guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) for instructions on creating your Supabase client.

**Next.js**

Create a new file at `app/auth/confirm/route.ts` and populate with the following:

```ts app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/auth/auth-code-error')
}
```

**SvelteKit**

Create a new file at `src/routes/auth/confirm/+server.ts` and populate with the following:

```ts src/routes/auth/confirm/+server.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'

export const GET = async (event) => {
  const {
    url,
    locals: { supabase },
  } = event
  const token_hash = url.searchParams.get('token_hash') as string
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = url.searchParams.get('next') ?? '/'

  /**
   * Clean up the redirect URL by deleting the Auth flow parameters.
   *
   * `next` is preserved for now, because it's needed in the error case.
   */
  const redirectTo = new URL(url)
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      redirectTo.searchParams.delete('next')
      redirect(303, redirectTo)
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/error'
  redirect(303, redirectTo)
}
```

**Astro**

Create a new file at `src/pages/auth/confirm.ts` and populate with the following:

```ts src/pages/auth/confirm.ts
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type APIRoute } from 'astro'

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/'

  if (token_hash && type) {
    const supabase = createServerClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet, _headers) {
            cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return redirect(next)
    }
  }

  // return the user to an error page with some instructions
  return redirect('/auth/auth-code-error')
}
```

**Remix**

Create a new file at `app/routes/auth.confirm.tsx` and populate with the following:

```ts app/routes/auth.confirm.tsx
import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/'
  const headers = new Headers()

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(key, value, options) {
            headers.append('Set-Cookie', serializeCookieHeader(key, value, options))
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return redirect(next, { headers })
    }
  }

  // return the user to an error page with instructions
  return redirect('/auth/auth-code-error', { headers })
}
```

**Express**

Create a new route in your express app and populate with the following:

```js app.js
// The client you created from the Server-Side Auth instructions
const { createClient } = require("./lib/supabase")
...
app.get("/auth/confirm", async function (req, res) {
  const token_hash = req.query.token_hash
  const type = req.query.type
  const next = req.query.next ?? "/"

  if (token_hash && type) {
    const supabase = createClient({ req, res })
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      res.redirect(303, `/${next.slice(1)}`)
    }
  }

  // return the user to an error page with some instructions
  res.redirect(303, '/auth/auth-code-error')
})
```

##### Step 3: Call the sign up function to initiate the flow

**JavaScript**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/javascript/auth-signup) with their email address and password:

You can optionally specify a URL to redirect to after the user clicks the confirmation link. This URL must be configured as a [Redirect URL](https://supabase.com/docs/guides/auth/redirect-urls), which you can do in the [dashboard](https://supabase.com/dashboard/project/_/auth/url-configuration) for hosted projects, or in the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.additional_redirect_urls) for self-hosted projects.

If you don't specify a redirect URL, the user is automatically redirected to your site URL. This defaults to `localhost:3000`, but you can also configure this.

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
    options: {
      emailRedirectTo: 'https://example.com/welcome',
    },
  })
}
```

**Dart**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/dart/auth-signup) with their email address and password:

```dart
Future<void> signUpNewUser() async {
  final AuthResponse res = await supabase.auth.signUp(
    email: 'valid.email@supabase.io',
    password: 'example-password'
  );
}
```

**Swift**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/swift/auth-signup) with their email address and password:

```swift
let response = try await supabase.auth.signUp(
  email: "valid.email@supabase.io",
  password: "example-password",
)
```

**Kotlin**

To sign up the user, call [signUpWith(Email)](https://supabase.com/docs/reference/kotlin/auth-signup) with their email address and password:

```kotlin
suspend fun signUpNewUser() {
	supabase.auth.signUpWith(Email) {
		email = "valid.email@supabase.io"
		password = "example-password"
	}
}
```

**Python**

To sign up the user, call [signUp()](https://supabase.com/docs/reference/python/auth-signup) with their email address and password:

```python
data = supabase.auth.sign_up({
  'email': 'valid.email@supabase.io',
  'password': 'example-password',
})
```

**C#**

To sign up the user, call [`SignUp()`](https://supabase.com/docs/reference/csharp/sign-up) with their email address and password:

```c#
var session = await supabase.Auth.SignUp("valid.email@supabase.io", "example-password");
```

### Signing in with an email and password

**JavaScript**

When your user signs in, call [`signInWithPassword()`](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) with their email address and password:

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
async function signInWithEmail() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })
}
```

**Dart**

When your user signs in, call [`signInWithPassword()`](https://supabase.com/docs/reference/dart/auth-signinwithpassword) with their email address and password:

```dart
Future<void> signInWithEmail() async {
  final AuthResponse res = await supabase.auth.signInWithPassword(
    email: 'valid.email@supabase.io',
    password: 'example-password'
  );
}
```

**Swift**

When your user signs in, call [signIn(email:password:)](https://supabase.com/docs/reference/swift/auth-signinwithpassword) with their email address and password:

```swift
try await supabase.auth.signIn(
  email: "valid.email@supabase.io",
  password: "example-password"
)
```

**Kotlin**

When your user signs in, call [signInWith(Email)](https://supabase.com/docs/reference/kotlin/auth-signinwithpassword) with their email address and password:

```kotlin
suspend fun signInWithEmail() {
	supabase.auth.signInWith(Email) {
		email = "valid.email@supabase.io"
		password = "example-password"
	}
}
```

**Python**

When your user signs in, call [sign\_in\_with\_password()](https://supabase.com/docs/reference/python/auth-signinwithpassword) with their email address and password:

```python
data = client.auth.sign_in_with_password({
  'email': 'valid.email@supabase.io',
  'password': 'example-password',
})
```

**C#**

When your user signs in, call [`SignIn()`](https://supabase.com/docs/reference/csharp/sign-in-with-password) with their email address and password:

```c#
var session = await supabase.Auth.SignIn("valid.email@supabase.io", "example-password");
```

### Resetting a password

Note: To prevent user enumeration, `resetPasswordForEmail()` doesn't reveal whether an account exists for the given email address.

When no user is associated with the address, Supabase Auth won't send an email, though the method still returns without an error.

**Implicit flow**

#### Step 1: Create a reset password page

Create a **reset password** page. This page should be publicly accessible.

Collect the user's email address and request a password reset email. Specify the redirect URL, which should point to the URL of a **change password** page. This URL needs to be configured in your [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

**JavaScript**

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
await supabase.auth.resetPasswordForEmail('valid.email@supabase.io', {
  redirectTo: 'http://example.com/account/update-password',
})
```

**Swift**

```swift
try await supabase.auth.resetPasswordForEmail(
   "valid.email@supabase.io",
   redirectTo: URL(string: "http://example.com/account/update-password")
)
```

**Kotlin**

```kotlin
supabase.auth.resetPasswordForEmail(
    email = "valid.email@supabase.io",
    redirectUrl = "http://example.com/account/update-password"
)
```

If you are on one of the Kotlin targets that have built-in support for redirect URL handling, such as Android, see [OAuth and OTP link verification](https://supabase.com/docs/reference/kotlin/initializing).

**Python**

```python
client.auth.reset_password_email(
  'valid.email@supabase.io',
  {'redirect_to':'http://example.com/account/update-password'}
)
```

**Dart**

```dart
await supabase.auth.resetPasswordForEmail(
  'valid.email@supabase.io',
  redirectTo: 'http://example.com/account/update-password',
);
```

**C#**

```c#
var options = new ResetPasswordForEmailOptions("valid.email@supabase.io")
{
    RedirectTo = "http://example.com/account/update-password",
};
await supabase.Auth.ResetPasswordForEmail(options);
```

#### Step 2: Create a change password page

Create a **change password** page at the URL you specified in the previous step. This page should be accessible only to authenticated users.

Collect the user's new password and call `updateUser` to update their password.

**PKCE flow**

The PKCE flow allows for server-side authentication. Unlike the implicit flow, which directly provides your app with the access token after the user clicks the confirmation link, the PKCE flow requires an intermediate token exchange step before you can get the access token.

##### Step 1: Update reset password email

Update your reset password email template to send the token hash. See [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) for how to configure your email templates.

Your reset password email template should contain the following HTML:

```html
<h2>Reset your password</h2>

<p>We received a request to reset your password. Follow the link below to choose a new one.</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/account/update-password"
    >Reset password</a
  >
</p>
```

##### Step 2: Create token exchange endpoint

Create an API endpoint at `<YOUR_SITE_URL>/auth/confirm` to handle the token exchange.

Note: Make sure you're using the right `supabase` client in the following code.

If you're not using Server-Side Rendering or cookie-based Auth, you can directly use the `createClient` from `@supabase/supabase-js`. If you're using Server-Side Rendering, see the [Server-Side Auth guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) for instructions on creating your Supabase client.

**Next.js**

Create a new file at `app/auth/confirm/route.ts` and populate with the following:

```ts app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/auth-code-error'
  return NextResponse.redirect(redirectTo)
}
```

**SvelteKit**

Create a new file at `src/routes/auth/confirm/+server.ts` and populate with the following:

```ts src/routes/auth/confirm/+server.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'

export const GET = async (event) => {
  const {
    url,
    locals: { supabase },
  } = event
  const token_hash = url.searchParams.get('token_hash') as string
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = url.searchParams.get('next') ?? '/'

  /**
   * Clean up the redirect URL by deleting the Auth flow parameters.
   *
   * `next` is preserved for now, because it's needed in the error case.
   */
  const redirectTo = new URL(url)
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      redirectTo.searchParams.delete('next')
      redirect(303, redirectTo)
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/error'
  redirect(303, redirectTo)
}
```

**Astro**

Create a new file at `src/pages/auth/confirm.ts` and populate with the following:

```ts src/pages/auth/confirm.ts
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type APIRoute } from 'astro'

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/'

  if (token_hash && type) {
    const supabase = createServerClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet, _headers) {
            cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return redirect(next)
    }
  }

  // return the user to an error page with some instructions
  return redirect('/auth/auth-code-error')
}
```

**Remix**

Create a new file at `app/routes/auth.confirm.tsx` and populate with the following:

```ts app/routes/auth.confirm.tsx
import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/'
  const headers = new Headers()

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(key, value, options) {
            headers.append('Set-Cookie', serializeCookieHeader(key, value, options))
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return redirect(next, { headers })
    }
  }

  // return the user to an error page with instructions
  return redirect('/auth/auth-code-error', { headers })
}
```

**Express**

Create a new route in your express app and populate with the following:

```js app.js
// The client you created from the Server-Side Auth instructions
const { createClient } = require("./lib/supabase")
...
app.get("/auth/confirm", async function (req, res) {
  const token_hash = req.query.token_hash
  const type = req.query.type
  const next = req.query.next ?? "/"

  if (token_hash && type) {
    const supabase = createClient({ req, res })
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      res.redirect(303, `/${next.slice(1)}`)
    }
  }

  // return the user to an error page with some instructions
  res.redirect(303, '/auth/auth-code-error')
})
```

##### Step 3: Call the reset password by email function to initiate the flow

**JavaScript**

```js
async function resetPassword() {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
}
```

**Swift**

```swift
try await supabase.auth.resetPasswordForEmail("valid.email@supabase.io")
```

**Kotlin**

```kotlin
supabase.gotrue.sendRecoveryEmail(
    email = "valid.email@supabase.io",
)
```

**Python**

```python
supabase.auth.reset_password_email('valid.email@supabase.io')
```

**Dart**

```dart
await supabase.auth.resetPasswordForEmail('valid.email@supabase.io');
```

**C#**

```c#
await supabase.Auth.ResetPasswordForEmail("valid.email@supabase.io");
```

Once you have a session, collect the user's new password and call `updateUser` to update their password.

**JavaScript**

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
await supabase.auth.updateUser({ password: 'new_password' })
```

**Swift**

```swift
try await supabase.auth.updateUser(user: UserAttributes(password: newPassword))
```

**Kotlin**

```kotlin
supabase.auth.updateUser {
    password = "new_password"
}
```

**Python**

```python
supabase.auth.update_user({'password': 'new_password'})
```

**Dart**

```dart
final UserResponse res = await supabase.auth.updateUser(
  UserAttributes(password: 'new_password'),
);
```

**C#**

```c#
await supabase.Auth.Update(new UserAttributes { Password = "new_password" });
```

#### Verifying the current password

If your app requires users to confirm their current password before setting a new one, you can pass `current_password` (available in `supabase-js` v2.102.0+ and `supabase-kt` 3.5.0+):

**JavaScript**

```js
await supabase.auth.updateUser({
  password: 'new_password',
  current_password: 'old_password',
})
```

**Kotlin**

```kotlin
supabase.auth.updateUser {
    password = "new_password"
    currentPassword = "old_password"
}
```

### Email sending

The signup confirmation and password reset flows require an SMTP server to send emails.

The Supabase platform comes with a default email-sending service for you to try out. The service has a rate limit of 2 emails per hour, and availability is on a best-effort basis. For production use, you should consider configuring a custom SMTP server.

Note: Consider configuring a custom SMTP server for production.

See the [Custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp) for instructions.

#### Local development with Mailpit

You can test email flows on your local machine. The Supabase CLI automatically captures emails sent locally by using [Mailpit](https://github.com/axllent/mailpit).

In your terminal, run `supabase status` to get the Mailpit URL. Go to this URL in your browser, and follow the instructions to find your emails.

## With phone

You can use a user's mobile phone number as an identifier, instead of an email address, when they sign up with a password.

This practice is usually discouraged because phone networks recycle mobile phone numbers. Anyone receiving a recycled phone number gets access to the original user's account. To mitigate this risk, [implement MFA](https://supabase.com/docs/guides/auth/auth-mfa).

Danger: Protect users who use a phone number as a password-based auth identifier by enabling MFA.

### Enabling phone and password-based authentication

Enable phone authentication on the [Auth Providers page](https://supabase.com/dashboard/project/_/auth/providers) for hosted Supabase projects.

For self-hosted projects or local development, use the [configuration file](https://supabase.com/docs/guides/local-development/cli/config#auth.sms.enable_signup). See the configuration variables namespaced under `auth.sms`.

If you want users to confirm their phone number on signup, you need to set up an SMS provider. Each provider has its own configuration. Supported providers include MessageBird, Twilio, Vonage, and TextLocal (community-supported).



Caution: To keep SMS sending costs under control, make sure you adjust your project's rate limits and [configure CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha). See the [Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod) to learn more.

Some countries have special regulations for services that send SMS messages to users, (e.g India's TRAI DLT regulations). Remember to look up and follow the regulations of countries where you operate.

### Signing up with a phone number and password

To sign up the user, call [`signUp()`](https://supabase.com/docs/reference/javascript/auth-signup) with their phone number and password:

**JavaScript**

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
const { data, error } = await supabase.auth.signUp({
  phone: '+13334445555',
  password: 'some-password',
})
```

**Swift**

```swift
try await supabase.auth.signUp(
  phone: "+13334445555",
  password: "some-password"
)
```

**Kotlin**

```kotlin
supabase.auth.signUpWith(Phone) {
    phone = "+13334445555"
    password = "some-password"
}
```

**Python**

```python
supabase.auth.sign_up({
  'phone': "+13334445555",
  'password': "some-password"
})
```

**Dart**

```dart
final AuthResponse res = await supabase.auth.signUp(
  phone: '+13334445555',
  password: 'some-password',
);
```

**C#**

```c#
var session = await supabase.Auth.SignUp(SignUpType.Phone, "+13334445555", "some-password");
```

**HTTP**

```bash
curl -X POST 'https://cvwawazfelidkloqmbma.supabase.co/auth/v1/signup' \
-H "apikey: SUPABASE_KEY" \
-H "Content-Type: application/json" \
-d '{
  "phone": "+13334445555",
  "password": "some-password"
}'
```

If you have phone verification turned on, the user receives an SMS with a 6-digit pin that you must verify within 60 seconds:

**JavaScript**

You should present a form to the user so they can input the 6 digit pin, then send it along with the phone number to `verifyOtp`:

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
const {
  data: { session },
  error,
} = await supabase.auth.verifyOtp({
  phone: '+13334445555',
  token: '123456',
  type: 'sms',
})
```

**Swift**

You should present a form to the user so they can input the 6 digit pin, then send it along with the phone number to `verifyOTP`:

```swift
try await supabase.auth.verifyOTP(
  phone: "+13334445555",
  token: "123456",
  type: .sms
)
```

**Kotlin**

You should present a form to the user so they can input the 6 digit pin, then send it along with the phone number to `verifyPhoneOtp`:

```kotlin
supabase.auth.verifyPhoneOtp(
    type = OtpType.Phone.SMS,
    phone = "+13334445555",
    token = "123456"
)
```

**Python**

You should present a form to the user so they can input the 6 digit pin, then send it along with the phone number to `verify_otp`:

```python
supabase.auth.verify_otp({
  'phone': "+13334445555",
  'token': "123456",
  'type': "sms"
})
```

**Dart**

You should present a form to the user so they can input the 6 digit pin, then send it along with the phone number to `verifyOTP`:

```dart
final AuthResponse res = await supabase.auth.verifyOTP(
  phone: '+13334445555',
  token: '123456',
  type: OtpType.sms,
);
```

**C#**

```c#
var session = await supabase.Auth.VerifyOTP("+13334445555", "123456", MobileOtpType.SMS);
```

**HTTP**

```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/auth/v1/verify' \
-H "apikey: <SUPABASE_KEY>" \
-H "Content-Type: application/json" \
-d '{
  "type": "sms",
  "phone": "+13334445555",
  "token": "123456"
}'
```

### Signing in a with a phone number and password

Call the function to sign in with the user's phone number and password:

**JavaScript**

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
const { data, error } = await supabase.auth.signInWithPassword({
  phone: '+13334445555',
  password: 'some-password',
})
```

**Swift**

```swift
try await supabase.auth.signIn(
  phone: "+13334445555",
  password: "some-password"
)
```

**Kotlin**

```kotlin
supabase.auth.signInWith(Phone) {
    phone = "+13334445555"
    password = "some-password"
}
```

**Python**

```python
supabase.auth.sign_in_with_password({
  'phone': "+13334445555",
  'password': "some-password"
})
```

**Dart**

```dart
final AuthResponse res = await supabase.auth.signInWithPassword(
  phone: '+13334445555',
  password: 'some-password',
);
```

**C#**

```c#
var session = await supabase.Auth.SignIn(SignInType.Phone, "+13334445555", "some-password");
```

**HTTP**

```bash
curl -X POST 'https://cvwawazfelidkloqmbma.supabase.co/auth/v1/token?grant_type=password' \
-H "apikey: SUPABASE_KEY" \
-H "Content-Type: application/json" \
-d '{
  "phone": "+13334445555",
  "password": "some-password"
}'
```
