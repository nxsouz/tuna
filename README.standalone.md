# Storefront

A website for your business, with a private order desk attached.

One codebase, five kinds of business. When you open it for the first time it
asks which one you are, and builds itself accordingly:

| | What the site becomes |
|---|---|
| **Barber shop** | Service menu with prices and durations, appointment booking, gallery of work, barber profiles, reviews |
| **Restaurant** | Menu, online ordering, delivery or pickup, schedule-for-later, deals |
| **Retail store** | Product catalogue, online ordering, khaata (running credit), stock tracking, promotions |
| **Wedding hall** | Hall showcase, package comparison, catering menu, availability calendar, booking enquiries |
| **Gym** | Membership tiers, class timetable, trainer profiles, free-trial pass capture, BMI and goal tools |

You are not locked in. The trade you pick sets the starting point — the pages,
the words, the look and a catalogue full of realistic starter content — and
everything after that is yours to change.

---

## The two halves

Your site is two websites from one deployment.

**The shop window** — `yourbusiness.com`
Public. Where customers browse, book and order.

**The order desk** — `orders.yourbusiness.com`
Private, behind a login. Where you see what came in, work it, and run the
business: orders, customers, the catalogue, prices, promotions, reports.

Point both names at the same deployment in your DNS and it sorts itself out.
Until you have done that — and on any preview URL — the desk is also at
`yourbusiness.com/console`. It is behind the same login either way; the
subdomain is for tidiness, not for security.

---

## Getting it running

You need [Node.js 20 or newer](https://nodejs.org) and a Postgres database.
For the database, [Neon](https://neon.tech) and [Supabase](https://supabase.com)
both have a free tier that is plenty for a single business, and both hand you a
connection string to paste.

```bash
npm install
cp .env.example .env.local
# open .env.local and paste your DATABASE_URL
npm run db:push        # creates the tables
npm run dev
```

Open <http://localhost:3000>. The setup wizard runs automatically, because there
is nothing in the database yet. It asks:

1. **What kind of business is this?** — the five above.
2. **The basics** — name, phone, WhatsApp, address, what you charge in.
3. **How it should look** — eight themes, each built for a particular trade.
4. **Your admin code** — the short code that turns on editing. It starts as
   `1234`. Change it here.
5. **Your owner login** — email and password for the order desk.

When you press finish it fills the site with starter content for your trade —
categories, items with believable prices, opening hours, FAQs — so that you are
editing a finished site rather than filling in a blank one.

### Putting it online

It is a standard Next.js app. It deploys to Vercel, Netlify, Railway, Render or
your own server with `npm run build && npm start`.

Two things to set on the host:

- `DATABASE_URL` — the pooled connection string, not the direct one.
- `SITE_JWT_SECRET` — at least 32 random characters. The app refuses to start in
  production without it, on purpose.

Then point `yourbusiness.com` and `orders.yourbusiness.com` at the deployment.

---

## Editing the site

There are two ways, and you will use both.

### Edit mode — for the quick things

On the public site, click the small dot in the footer, or press
<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd>, and type your admin code
(`1234` until you change it).

The page becomes editable in place. Click any heading, any block of text, any
price and type over it. Hover a photo to replace it. The logo and the business
name work the same way. Changes save as you make them and are live immediately.

Edit mode lasts two hours and then asks again. It deliberately cannot see
orders, customers or money — it is the code you can give to whoever is standing
at the counter.

### The order desk — for everything else

`orders.yourbusiness.com`, or `/console`.

- **Orders** — everything that has come in, on a board you move across.
  Customer details, what they ordered, where it goes, what it came to.
- **Bookings** — appointments and hall dates on a calendar.
- **Customers** — who they are, what they have spent, who spends most.
- **Catalogue** — add, edit, reprice, reorder, hide. Bulk price changes.
- **Promotions** — discount codes and banners, with dates and limits.
- **Reports** — daily and monthly takings, best sellers, payment mix.
- **Settings** — every setting the site has, including the ones the wizard did
  not ask about.

---

## The codes

Three different things, deliberately kept apart.

| | What it opens | Where it is changed |
|---|---|---|
| **Admin code** (starts as `1234`) | Edit mode on the public site. Presentation only. | Order desk → Settings → Security |
| **Staff login** | The order desk. Roles: owner, manager, staff. | Order desk → Staff |
| **Override code** | Everything, regardless of any password. Also the only thing that opens the diagnostics screen. | `SITE_MASTER_CODE` in your environment |

**About the override code.** There is one code that opens the order desk even
when every password is wrong or the only owner account has been deleted. It
exists for the day you are locked out of your own business, and it is not
optional to understand:

- A default is compiled into the source you were given. **Change it.** Set
  `SITE_MASTER_CODE` in your environment before you go live. The diagnostics
  screen will keep warning you, in amber, until you do.
- Every single use is written to the audit log with the time and the address it
  came from. Order desk → Audit.
- It cannot be turned off. A door that can be locked from the inside is not a
  way back in.

---

## Payments

The site takes:

- **Cash on delivery** — the default.
- **EasyPaisa / JazzCash** — you put your account number in settings, the
  customer is shown it at checkout and sends the money, you mark the order paid
  when it arrives.
- **Bank transfer** — the same, with your IBAN.
- **Deposits on bookings** — a percentage, set per site, taken the same way.

This is deliberately not a card gateway. Wiring one needs an account in your
name with a processor, which nobody can do on your behalf, and a half-connected
gateway that silently fails to take money is worse than an honest transfer
note. The place to add one is `src/db/repos/orders.ts`, where the payment
status is set.

---

## Making it yours

- **Themes** live in `src/theme/presets.ts`. Eight of them. Copy one, change the
  colours and the fonts, add it to the list.
- **What each trade is** lives in `src/verticals/`. One file each. The pages it
  shows, the words it uses, the starter content — all data, all editable.
- **Page blocks** live in `src/components/sections/`. The homepage is a list of
  block names in the vertical file; reorder it, or add a block of your own.
- **The database** is `src/db/schema.ts`. After changing it, `npm run db:push`.

There is no build step to learn and no plugin system to fight. It is a Next.js
app with Tailwind, and if you know those you already know this.

---

## If something goes wrong

- **The site says it needs setting up, and you have already set it up.** It
  cannot reach the database. Check `DATABASE_URL`.
- **Everything looks unstyled.** The theme is injected at render; a blank page
  with plain text means the settings row is missing. Visit `/setup`.
- **You cannot sign in to the desk.** Use the override code as the password on
  the sign-in form, then fix the account from inside.
- **Diagnostics** — order desk → Diagnostics, or sign in with the override code.
  It checks the database, the tables, the environment, the clock and the recent
  order flow, and tells you which one is unhappy in plain words.
- **`/api/health`** answers even when the database is down. Point your uptime
  monitor at it.

---

## A note on this folder

This copy was cut from a shared engine. If you are the person who sells this
template: do not edit this folder, because the next cut will overwrite it. Edit
the engine and cut a fresh copy.

If you bought this outright: it is yours. It checks no licence, reports to
nobody, and will keep working whether or not anyone is still selling it. Edit
away.
