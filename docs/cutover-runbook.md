# Cutover runbook — cometnational.com → www.cometnational.com on Vercel

_Operating checklist for moving the live domain from the legacy SiteGround/WordPress
host to this Astro site on Vercel, with **www.cometnational.com** as the one
canonical host. Written September 2026. Do the steps in order; each one is
cheap to verify and expensive to skip._

## What the code already does (nothing to configure)

| Concern | Where | State |
| --- | --- | --- |
| Canonical host | `src/lib/site.ts` (`SITE.url`), `astro.config.mjs` (`site`) | `https://www.cometnational.com` |
| Self-referencing canonicals, `og:url`, JSON-LD `@id`s | `src/components/layout/BaseHead.astro`, `src/lib/schema.ts` | derive from `SITE.url` |
| Sitemap | `/sitemap.xml` (+ `sitemap-index.xml`, `sitemap-0.xml`) | lists www URLs; blog posts carry `lastmod` |
| `robots.txt` | `public/robots.txt` | `Sitemap: https://www.cometnational.com/sitemap.xml` |
| Apex → www | `vercel.json` (from `migration/redirects.csv`) | `cometnational.com/*` → `www.cometnational.com/*`, 308, path preserved |
| Legacy WordPress paths | `vercel.json` | `/shipping-services`, `/about`, `/carrier-services`, `/contact-agents`, dated `/2021/…` posts, `/author|category|tag/*`, `/feed` → mapped 1:1 where a match exists |
| flatbedltl.com, transload911.com (apex + www) | `vercel.json` | every known page mapped; per-host catch-all to the matching service pillar |
| Trailing slashes | `vercel.json` `trailingSlash: false` | `/services/` → `/services` (308) so one URL serves each page |
| Staging hosts | `vercel.json` headers | `comet.delcoe.com`, `*.vercel.app` send `X-Robots-Tag: noindex, nofollow` |
| HSTS | `vercel.json` headers | `max-age=63072000; includeSubDomains; preload` |

Regenerate after any redirect change: `pnpm redirects:build` (never hand-edit
`vercel.json`). Verify against production after DNS flips:
`PROD=1 pnpm redirects:verify`.

## 1. Before DNS — capture the legacy baseline (1 hour)

1. **Search Console.** Add a **Domain property** for `cometnational.com` (DNS TXT
   verification). A Domain property covers apex, www, http, https and every
   subdomain in one report, so you never lose the pre-cutover history. Keep the
   existing URL-prefix properties too if any exist.
2. Export from the legacy property: Performance → last 16 months (queries and
   pages), Coverage → indexed pages list, Links → top linked pages. This is the
   list you check redirects against and the baseline you compare traffic to.
3. Export the legacy sitemap / crawl if you can get past the SiteGround challenge
   page from an office IP: `https://cometnational.com/sitemap.xml` (WordPress:
   also `wp-sitemap.xml`). Diff every indexed URL against
   `migration/redirects.csv`; add rows for anything that isn't a same-path URL
   or a 1:1 match already, then `pnpm redirects:build`.
4. Note the subdomains. `promos.cometnational.com` is a separate site; leave
   its DNS record alone (only the apex `A`/`ALIAS` and `www` `CNAME` move).
   Any legacy mail records (MX, SPF, DKIM, DMARC) stay exactly as they are.
5. Deploy this branch to production on Vercel and confirm it is green:
   `pnpm check && pnpm prerender:verify && pnpm build && pnpm sitemap:verify`.

## 2. Vercel — attach the domains (15 minutes)

Project: **comet-national-website** (team Delcoe Marketing). Settings → Domains.

1. Add `www.cometnational.com`. Vercel shows the CNAME target
   (`cname.vercel-dns.com`).
2. Add `cometnational.com`. When prompted, choose **Redirect to
   `www.cometnational.com`** (308). Vercel then handles apex → www at the
   edge before any `vercel.json` rule runs; the `vercel.json` apex rules stay
   as belt-and-braces and for the mapped legacy paths.
3. Add `flatbedltl.com`, `www.flatbedltl.com`, `transload911.com`,
   `www.transload911.com` to the same project (they need to resolve to Vercel
   for the `has: host` redirects to fire). Do **not** set a Vercel-level
   redirect on them — the per-path rules in `vercel.json` do the mapping.
4. Confirm `www.cometnational.com` is marked the **production** domain.
5. Certificates issue automatically once DNS resolves; nothing to upload.

## 3. DNS — flip (10 minutes, then wait)

At the registrar / DNS host for each domain, using Vercel's recommended
records (shown on the Domains screen):

| Host | Record | Value |
| --- | --- | --- |
| `cometnational.com` (apex) | `A` (or `ALIAS`/`ANAME` if supported) | Vercel's apex IP shown in the dashboard |
| `www.cometnational.com` | `CNAME` | `cname.vercel-dns.com` |
| `flatbedltl.com`, `transload911.com` | `A` | same Vercel apex IP |
| `www.flatbedltl.com`, `www.transload911.com` | `CNAME` | `cname.vercel-dns.com` |

Lower the TTLs to 300 s a day ahead if they are long. Leave MX/TXT untouched.

## 4. Verify within the first hour

```bash
# canonical host serves 200, apex and staging redirect/noindex
curl -sI https://www.cometnational.com/ | head -5
curl -sI https://cometnational.com/services/flatbed-ltl | grep -i '^location'   # → https://www.cometnational.com/services/flatbed-ltl
curl -sI https://www.cometnational.com/services/ | grep -i '^location'          # → /services
curl -sI https://comet.delcoe.com/ | grep -i x-robots                          # → noindex, nofollow

# every row in migration/redirects.csv, live
PROD=1 pnpm redirects:verify

# sitemap and robots on the canonical host
curl -s https://www.cometnational.com/robots.txt
curl -s https://www.cometnational.com/sitemap.xml | head
```

Then in a browser: view-source on the homepage and one service page and check
`<link rel="canonical">`, `og:url` and the JSON-LD `url` all say `https://www.`.

## 5. Search Console — the day of

1. In the Domain property, **Sitemaps → submit `https://www.cometnational.com/sitemap.xml`**.
   If a legacy `sitemap.xml` was previously submitted under a URL-prefix
   property, leave it; it now 308s to the new one and Google follows it.
2. **URL Inspection → Request indexing** for the homepage, `/services`,
   `/services/flatbed-ltl`, `/services/transloading`, `/get-a-quote`.
3. **Do not use the Change of Address tool.** It is for moving between
   different domains; www ↔ non-www on the same registrable domain is handled
   purely by the redirects and canonicals above. (Use it only for
   `flatbedltl.com` and `transload911.com` if those have their own verified
   properties: Change of Address → new site `cometnational.com`.)
4. Add the site to **Bing Webmaster Tools** (import from Search Console) and
   submit the same sitemap.

## 6. First 30 days — watch

- Search Console → Pages: the "Page with redirect" count should rise and
  "Not found (404)" should stay flat. Any 404 that carries impressions gets a
  row in `migration/redirects.csv`.
- Performance: compare clicks/impressions to the exported baseline. A dip of
  10–20 % for two to four weeks is normal for a host+platform move; a
  sustained drop past that means a missed redirect or a canonical pointing the
  wrong way.
- Vercel → Analytics: confirm traffic on the legacy hosts is all 308s.
- Keep `flatbedltl.com` and `transload911.com` registered and redirecting
  indefinitely — they hold backlinks (PLAN.md §1).

## 7. Decommission the legacy host (after 30 clean days)

Cancel the SiteGround plan only after the 30-day watch. Before cancelling, pull
a final copy of the WordPress media library (real load photos, if any) — the
new site's photography is currently licensed stock (see `src/lib/photos.ts`),
and real fleet/dock photos should replace it as they become available.

## Open items the client must supply before launch

- **MC # / USDOT #** and a cargo + auto-liability insurance statement for the
  footer (`src/components/layout/Footer.astro`). The public FMCSA SAFER records
  found under "Comet …" names belong to other companies; the numbers must come
  from the company's own authority letter.
- Confirmation of the AWS SES credentials (`SES_*`) and `QUOTE_*` env vars in
  the Vercel project so `/api/quote` sends mail in production.
- Optional: Cloudflare Turnstile keys (`PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`) to add bot protection to the quote form.
