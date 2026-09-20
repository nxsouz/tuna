# The site engine

One Next.js app that ships as two products and presents as five kinds of
business. Before changing anything here, understand those two axes — most
mistakes in this directory come from collapsing one of them.

## Axis one: two products

| | `licensed` | `standalone` |
|---|---|---|
| Sold as | subscription | once, outright |
| Licence key | required, checked against a server | none, and no code that could |
| Sales data | pushed to the supplier's console | stays in the site's own database |
| Settings | the supplier can override any of them | the owner is the only authority |

`src/config/edition.ts` decides which. Everything that differs is behind
`src/integrations/` and nothing else in the app may ask which build it is.

The standalone copy is **generated**, not maintained:

```bash
npm run vend:standalone        # from the repo root -> ./standalone
```

That script deletes `src/integrations/licensed.ts`, swaps
`index.standalone.ts` over `index.ts`, pins the edition, strips the supplier's
identity out of the manifest, and then **scans the output and refuses to finish
if any forbidden string survived**. If you add a file that mentions the supplier
or the licence API, that scan is what will tell you. Fix it here, never in the
output directory.

## Axis two: five trades

`src/verticals/*.ts` — one record each for barber, restaurant, retail, wedding
hall and gym. A vertical chooses from behaviour the engine already has: the
words it uses, the pages it shows, the homepage composition, the extra item
fields, the feature flags, the theme, and the starter content.

**The rule that keeps this one website:** the moment a component contains
`if (vertical === 'gym')`, that branch is a feature flag or a section kind and
belongs in `src/verticals/types.ts`. Five bespoke sites pretending to be one is
worse than five sites.

## Two surfaces, one deployment

- **`/` on the main host** — the shop window. Public.
- **`/console`, reached as `orders.<host>`** — the order desk. Staff only.

`src/middleware.ts` does the rewrite. The console is *also* reachable at
`/console` on the main host, deliberately: that is how it works on a preview URL
and before DNS exists. Security comes from the session check, never from the
hostname.

## Three ways in

| | Opens | Stored as |
|---|---|---|
| Admin code (default `1234`) | edit mode on the public site — presentation only | bcrypt in `site_settings.admin_code_hash` |
| Staff sign-in | the order desk, roles owner/manager/staff | bcrypt in `staff_users` |
| Override code | everything, regardless of password; the only door to diagnostics | `SITE_MASTER_CODE`, default in `src/lib/access.ts` |

The override is a back door on purpose. It is compared in constant time, every
use is written to `audit_log` by the same code path that grants the access, and
the diagnostics screen warns while it is still the shipped default. Do not add a
hint about it to any login form.

## Conventions

- **Money is integer minor units.** Never a float, never a numeric string.
- **Timestamps are epoch milliseconds**, `bigint` in the database. The site's
  calendar day comes from `settings.locale.timezoneOffsetMinutes`, never from
  the server's clock. Every helper in `src/lib/format.ts` takes the offset.
- **No `@rb/*` imports.** This app must install after being copied out of the
  monorepo. Its dependencies are next, react, drizzle-orm, postgres, zod,
  bcryptjs and jose — that is the whole list, and it should stay short.
- **Only `src/db/repos/*` builds queries.** An order total computed two ways in
  two screens is the bug that layer exists to prevent.
- **Settings are one validated document.** `src/config/settings.ts`. Adding a
  setting is adding a field with a default there; it is then overridable,
  patchable and editable everywhere for free. Nothing secret goes in it — that
  document is serialised to the browser.
- **Sections declare their data.** `src/components/sections/contract.ts`. A
  block never queries; the page loads the union of what its blocks need, once.
- **Prices are re-derived server-side at checkout.** A price in a request body
  is a suggestion from a stranger.

## Comment voice

Every file opens with a block comment explaining *why* it is shaped the way it
is — the decision, the alternative rejected, the consequence. Not what the code
does. British spelling. No emoji, no "simply", no marketing voice. Inline
comments only where a reader would otherwise ask "why is it like that?".

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
