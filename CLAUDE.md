# Comet National — working notes for Claude

Marketing site for Comet National (freight brokerage, Atlanta, since 1995).
Astro 5 + Tailwind 4, deployed on Vercel. `PLAN.md` and `BUILD_PLAN.md` hold the
original strategy and phase plan; this file is the operating manual.

## Commands

```bash
pnpm dev                # local dev server
pnpm build              # production build (writes dist/ and .vercel/output/)
pnpm check              # astro check — types + template diagnostics
pnpm prerender:verify   # every .astro route opts into static prerendering
pnpm sitemap:verify     # run AFTER a build: /sitemap.xml exists and lists every page
pnpm redirects:build    # migration/redirects.csv → vercel.json redirects block
pnpm redirects:verify   # legacy-host redirect coverage
```

There is no CI workflow. Before pushing anything that touches routes, run:
`pnpm check && pnpm prerender:verify && pnpm build && pnpm sitemap:verify`.

## Layout

```
src/pages/          file-based routes; every .astro page sets `prerender = true`
src/layouts/        BaseLayout, BlogPostLayout, ServicePillarLayout, IndustryLayout
src/components/     layout/ sections/ ui/ seo/ animations/
src/content/posts/  blog posts as Markdown (schema in src/content.config.ts)
src/lib/            data + logic singletons (see below)
src/styles/         tokens.css, base.css, fonts.css, motion.css, flourish.css
public/             fonts, logos, icons, robots.txt — copied verbatim
scripts/            build + verification scripts (tsx)
sanity/             Phase 2 CMS studio, not yet wired to the site
migration/          legacy-host redirect source data
```

Path aliases (tsconfig): `@/*`, `@components/*`, `@layouts/*`, `@lib/*`,
`@styles/*`, `@content/*`. Use them; relative `../../` imports are the exception.

### Data singletons — change these, not the pages

- `src/lib/site.ts` — NAP, phone, brand strings, `SITE.url`. One source of truth.
- `src/lib/services.ts` — the service taxonomy. Feeds the service pages, the
  mega-menu (`src/lib/nav.ts`), and the OG card registry. Add a mode here first.
- `src/lib/og/pages.ts` — per-page OG card registry rendered at `/og/<key>.png`.
- `src/lib/seo.ts` / `src/lib/schema.ts` — canonical URLs, robots, JSON-LD.

Duplicating a phone number, service blurb, or nav label into a page is a bug.

## Rendering model — read before touching routes

`astro.config.mjs` sets `output: "server"` with the Vercel adapter, but the site
is effectively static: **every `.astro` route carries `export const prerender = true`**
as its first line. Only `src/pages/api/quote.ts` is SSR (`prerender = false`).

This matters because only prerendered routes emit static HTML, and **only static
HTML lands in the sitemap**. A page that forgets the flag builds fine, renders
fine, and is silently invisible to search. `pnpm prerender:verify` fails the
build on that; keep it that way.

Also site-wide: `trailingSlash: "never"` (canonical URLs have no trailing slash)
and `build.format: "directory"`.

## Sitemap — keep this current as pages change

**How it works.** `@astrojs/sitemap` runs at build time and writes
`sitemap-index.xml` (an index) plus `sitemap-0.xml` (the URL set) into
`dist/client`, which the adapter copies to `.vercel/output/static`. It does
**not** write `/sitemap.xml` — the path crawlers, Search Console, and people
actually try first, which is why that URL used to 404.

`src/lib/sitemap-alias.ts` closes that gap: a small integration whose
`astro:build:done` hook copies the generated index to `sitemap.xml`, so the
alias is a real static file served by Vercel's filesystem handler. It is
registered **after** `sitemap()` in `astro.config.mjs` — hooks run in
declaration order and it reads what `sitemap()` writes. Do not reorder them.
A file alias is deliberate over a `vercel.json` rewrite: the adapter's generated
routes end in a catch-all to `/404.html`, so file-first is the safe path.

What ships, and what each URL is for:

| URL | What it is |
| --- | --- |
| `/sitemap.xml` | The canonical entry point. Copy of the index. Listed in `robots.txt`. |
| `/sitemap-index.xml` | Same content, original name. Kept so old submissions keep resolving. |
| `/sitemap-0.xml` | The URL set. A second file appears only past 45,000 URLs. |

`public/robots.txt` points at `https://cometnational.com/sitemap.xml`. If
`SITE.url` ever changes, that absolute URL and `astro.config.mjs`'s `site` both
have to move with it.

**When you add, rename, or remove a page — every time:**

1. Give the new `.astro` route `export const prerender = true` on line 1.
2. `pnpm build && pnpm sitemap:verify`. The guard fails if a built page is
   missing from the sitemap, if a sitemap URL has no page behind it, or if
   `/sitemap.xml` didn't make it into the deploy artifact.
3. Renamed or removed a live URL? Add a 301 to `vercel.json` (via
   `migration/redirects.csv` + `pnpm redirects:build`) so the old path doesn't
   become a 404 in someone's index.
4. New top-level marketing page? It probably also wants an OG card entry in
   `src/lib/og/pages.ts` and a nav slot via `src/lib/services.ts` / `nav.ts`.

No `lastmod` is emitted anywhere, on purpose: stamping every URL with the build
time tells crawlers the whole site changed on every deploy. Don't add a global
one. Per-URL `lastmod` from real post dates would be a legitimate improvement.

`/404` is excluded automatically. Non-HTML endpoints (`/og/*.png`,
`/blog/rss.xml`, `/api/quote`) are correctly absent — the sitemap is for
indexable pages.

## Blog posts

Markdown in `src/content/posts/<YYYY-MM-DD>-<slug>.md`; frontmatter is validated
by the Zod schema in `src/content.config.ts` (`title`, `summary`,
`publishedDate` required; `draft: true` hides a post). The slug is the filename,
so the date prefix is part of the public URL — renaming a published post needs a
redirect. Posts get an auto-generated OG card at `/blog/<slug>/og.png` and feed
`/blog/rss.xml`. Body Markdown runs through smartypants and the small-caps
rehype plugin, so write plain `LTL` and let the build style it.

## Content and voice

Plain, concrete, operator-to-operator. No hype, no invented statistics, no
capabilities the company hasn't confirmed. Acronyms use the `<Caps>` component
(or plain text in Markdown, handled by the rehype plugin). Em dashes are real
em dashes in `.astro` copy.

## Deploy notes

- `vercel.json` holds legacy-host redirects (flatbedltl.com, transload911.com,
  www → apex) and security/cache headers. Edit `migration/redirects.csv` and run
  `pnpm redirects:build` rather than hand-editing the redirects block.
- The quote form posts to `POST /api/quote` and sends via AWS SES. Credentials
  use `SES_*` names because Vercel reserves `AWS_*`. See `README.md` and
  `.env.example`.
- Sanity is scaffolded but not driving the site yet; `src/lib/services.ts` and
  `site.ts` are written to be swapped for GROQ queries returning the same shape.
