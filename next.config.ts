/**
 * The build, and the five front doors onto one catalogue page.
 *
 * There is one catalogue in this app and it lives at `/menu`. There is no
 * chance of one URL satisfying five trades: a barber sends people to
 * /services, a grocer to /shop, a hall to /packages and a gym to /memberships,
 * and each of them will type their own word into a poster, a WhatsApp status
 * and an Instagram bio long before they look at the site. A URL that does not
 * match what the owner tells people is a 404 the owner never sees and every
 * customer does.
 *
 * Three ways to do it were on the table.
 *
 *   • Five route folders, each re-exporting the page. Five copies of every
 *     `generateMetadata`, and the first one somebody forgets to update is the
 *     one their customers are on.
 *   • A dynamic `[section]` segment that accepts a whitelist. It swallows every
 *     unknown top-level path, so a typo at /gallry renders the catalogue
 *     instead of the not-found page.
 *   • A rewrite per alias, which is what is here. The path stays in the address
 *     bar, the page is rendered once from one file, an unknown path is still a
 *     404, and `usePathname()` in the filters returns the alias — so a search
 *     submitted from /shop comes back to /shop.
 *
 * `/catalogue` is in the list and is not decoration: `pagePath()` in
 * components/sections/contact-actions.ts derives every internal link to the
 * catalogue from the PageId, which spells it `/catalogue`. That is the link the
 * homepage, the hero button and the footer all use, so it has to land
 * somewhere. The trade-specific four are what a customer types or taps from
 * outside the site.
 *
 * Rewrites are returned as a plain array, which Next checks *after* the file
 * system. An alias can therefore never shadow a real route — if somebody adds a
 * genuine /packages page later, it wins, silently and correctly.
 */

import type { NextConfig } from 'next';

/** Every path that means "show me what this business sells". */
const CATALOGUE_ALIASES = [
  '/catalogue',
  '/services',
  '/shop',
  '/memberships',
  '/packages',
] as const;

const nextConfig: NextConfig = {
  /*
   * Hosts allowed to fetch dev-only assets.
   *
   * In development Next serves its client chunks and the HMR socket only to the
   * hostname the server was started with. Open the same site on any other name
   * and the server-rendered HTML arrives, every chunk 403s, the socket fails,
   * and React never hydrates — a page that looks almost right, does nothing
   * when clicked, and reports no error the owner would recognise.
   *
   * That is not a theoretical arrangement for this product. The buyer runs
   * `npm run dev`, gets `localhost`, and then wants to see the site on their
   * phone — so they type the machine's LAN address, and the setup wizard sits
   * there dead. `127.0.0.1` fails the same way, which is how this was found.
   *
   * Private ranges are listed rather than a wildcard: this only ever applies to
   * `next dev`, and a developer testing on their own network is the whole case.
   * It has no effect on a deployed site.
   */
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.local',
    '192.168.0.0/16',
    '10.0.0.0/8',
    '172.16.0.0/12',
  ],

  // The engine is copied out of the monorepo and installed by a buyer, so the
  // build must fail here rather than in their deployment: a type error shipped
  // behind `ignoreBuildErrors` becomes a runtime fault on somebody else's
  // checkout, at the hour they are busiest.
  //
  // There is deliberately no `eslint` key beside this one. Next 16 took ESLint
  // out of the build and out of NextConfig, so setting it is a type error
  // rather than a no-op; linting is a separate step now, and this build's job
  // is the type check above.
  typescript: { ignoreBuildErrors: false },

  async rewrites() {
    return CATALOGUE_ALIASES.map((source) => ({ source, destination: '/menu' }));
  },
};

export default nextConfig;
