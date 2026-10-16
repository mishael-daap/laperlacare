# Resend (Node.js SDK)

Snapshot of the official docs for `resend@6.33.0`, saved before first use, per the rule in `ai/workflow.md`.
Sources: <https://resend.com/docs/send-with-nodejs> and the package readme (`resend/resend-node`, `readme.md`), plus the shipped type definitions in `node_modules/resend/dist/index.d.mts`.

## Install

```bash
pnpm add resend
```

## Setup

An API key from <https://resend.com/api-keys>.

```js
import { Resend } from "resend";

const resend = new Resend("re_xxxx...xxxxxx");
```

The key is server-only. It must never reach the browser bundle.

## Sending

```js
const { data, error } = await resend.emails.send({
  from: "you@example.com",
  to: "user@gmail.com",
  replyTo: "you@example.com",
  subject: "hello world",
  text: "it works!",
});
```

`send` resolves to `CreateEmailResponse`, which is `Response<CreateEmailResponseSuccess>` — i.e. it **does not throw on an API error**. It returns `{ data, error }`, so the caller has to check `error` itself. `data.id` is the message id.

Every method takes request options as its final argument, supporting `signal` (cancel or timeout) and `headers`.

### Body

Exactly one of `text`, `html`, or `react` content is required.

- `text` — plain text.
- `html` — an HTML string.
- `react` — a React element. From a `.ts` file without JSX transpilation, use `jsx(Template, props)` from `react/jsx-runtime` instead.

### Fields

- `from` — required. **Must be on a domain verified in the Resend dashboard.** `onboarding@resend.dev` works without a verified domain but can only deliver to the Resend account's own address.
- `to` — required. A string or an array of strings.
- `replyTo` — a string or an array. What a reply in the recipient's mail client goes to.
- `subject` — required.
- `cc`, `bcc`, `attachments`, `headers`, `tags`, `scheduledAt` — also available.

## Error handling

Because errors come back in the result rather than as a throw, the shape to use is:

```js
const { error } = await resend.emails.send({ ... });

if (error) {
  // error.name, error.message
}
```

A network failure or a malformed request can still throw, so a `try`/`catch` around the call is not wasted.

## Constraints

- The API key can be scoped to **sending only**. A send-only key returns `401 restricted_api_key` from management endpoints such as `GET /domains`, so it cannot be used to inspect configuration.
- Domains must be verified before the address in `from` can be used.
