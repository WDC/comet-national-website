# Comet National — Astro + Vercel Implementation Plan

## Context

`PLAN.md` defines the **strategy** (consolidate three fractured domains onto `cometnational.com`, build a deep service taxonomy, retain proven conversion copy, ship 9 signature animations). This document defines **how to build it** — the concrete Astro architecture, hosting setup, content model, animation approach, SEO instrumentation, and migration mechanics.

Decisions already locked with the user:
- **Hosting:** Vercel (per the prompt)
- **Framework:** Astro (per PLAN.md §7 and the prompt)
- **Form backend:** Resend → email to `sales@cometnational.com` (no CRM in v1)
- **Content management:** Headless CMS — **recommending Sanity** over Decap (see §4 for reasoning)
- **Animation scope:** All 9 PLAN.md prompts in v1

The "lightning-fast and ranks well" mandate translates to a concrete budget: **LCP < 1.8s on 4G mobile**, **CLS < 0.05**, **INP < 200ms**, **per-route JS < 30 kB gzipped** (most routes 0 JS, leveraging Astro Islands).

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5** (Content Layer API) | Zero-JS by default, MDX-native, islands for animation only, top-tier Core Web Vitals out of the box |
| Output mode | `hybrid` via `@astrojs/vercel` | Static for all content pages; one server route for the quote form |
| Language | TypeScript everywhere | Type-safe content schemas, Sanity GROQ types, Zod validation |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` + a thin `tokens.css` for CSS custom properties | Tokens drive the industrial palette; Tailwind handles layout/utility. v4 has dramatically smaller output than v3. |
| Content | **Sanity** (hosted CMS) + Astro Content Layer loader (`@sanity/astro`) | Structured schemas for the 12+ service taxonomy; image CDN for real fleet photography; non-dev edits; free tier generous |
| MDX | `@astrojs/mdx` | Long-form Insights posts can embed animation components inline |
| Images | Astro `<Image>` + Sanity's image pipeline (`@sanity/image-url`) | Build-time AVIF/WebP for local assets; CDN-served responsive Sanity images for CMS content |
| Fonts | Self-hosted variable woff2 (Archivo + Inter + JetBrains Mono) via Fontsource | No third-party connection, `font-display: swap`, subset to Latin |
| Animation | **Motion One** (~4 kB) + CSS `animation-timeline: scroll()` with polyfill fallback | Far lighter than GSAP; Web Animations API native; covers scroll-driven and looping needs |
| Forms | Native HTML + Zod server validation, **Cloudflare Turnstile** for spam | No form library bloat |
| Email | **Resend** (`resend` npm package) via Vercel function | Modern transactional email, React Email templates if desired |
| Sitemap | `@astrojs/sitemap` | Auto-generated, multi-page index |
| SEO meta | Custom `<BaseHead>` component + per-page frontmatter | No bloated wrappers; full control over OG/Twitter/canonical |
| Site search | **Pagefind** (build-time static index) | Zero runtime cost, perfect for 404 and Insights |
| Analytics | **Vercel Analytics** + **Vercel Speed Insights** + (optional) Microsoft Clarity for heatmaps | First-party, no GDPR cookie banner needed |
| Spam protection | Cloudflare Turnstile | Free, lighter than reCAPTCHA, no Google reliance |
| View transitions | Astro built-in `<ViewTransitions />` | Instant-feeling navigation, no SPA overhead |

**Rejected explicitly:**
- GSAP (~30 kB minimum, commercial license, overkill for these animations)
- Lottie (heavy runtime, hurts LCP)
- Next.js (overkill — we don't need React, RSC, or server components for a content site)
- Decap CMS (git-backed and free, but Sanity's structured schemas + image CDN are a better fit for the deep service taxonomy and image-heavy design)
- Google Fonts CDN (third-party connection cost; self-host is faster and private)
- reCAPTCHA (Google bloat)

---

## 2. Project Structure

```
comet-national/
├── PLAN.md                           # Existing strategy doc (untouched)
├── BUILD_PLAN.md                     # This doc, copied here post-approval
├── astro.config.mjs
├── tailwind.config.ts                # Theme tokens mirror tokens.css
├── content.config.ts                 # Sanity collection wiring
├── tsconfig.json
├── package.json
├── vercel.json                       # 301 redirect map + per-host rules
├── migration/
│   ├── redirects.csv                 # SOURCE OF TRUTH for legacy → new URLs
│   └── crawl-exports/                # Screaming Frog CSVs per legacy domain
├── scripts/
│   ├── build-redirects.ts            # Reads redirects.csv → vercel.json
│   ├── verify-redirects.ts           # curl matrix against staging
│   └── sanity-seed.ts                # Bootstraps Sanity schemas with PLAN.md content
├── sanity/                           # Sanity Studio (deployed separately)
│   ├── sanity.config.ts
│   └── schemas/
│       ├── service.ts
│       ├── industry.ts
│       ├── insight.ts
│       ├── testimonial.ts
│       ├── settings.ts               # Singletons: nav, footer, contact NAP
│       └── fields/                   # Reusable field groups (seo, cta, faq)
├── public/
│   ├── fonts/                        # Self-hosted variable woff2
│   ├── favicon.svg
│   ├── icon-*.png
│   ├── og-default.jpg
│   └── robots.txt
└── src/
    ├── components/
    │   ├── layout/
    │   │   ├── BaseHead.astro        # Meta, canonical, OG, fonts, Org JSON-LD
    │   │   ├── Header.astro
    │   │   ├── MegaMenu.astro
    │   │   ├── Footer.astro
    │   │   └── StickyMobileCallBar.astro
    │   ├── sections/
    │   │   ├── Hero.astro
    │   │   ├── TrustStrip.astro
    │   │   ├── ModeSelector.astro
    │   │   ├── CometDifference.astro
    │   │   ├── IndustriesBand.astro
    │   │   ├── HowItWorks.astro
    │   │   ├── CoverageMap.astro
    │   │   ├── Testimonials.astro
    │   │   ├── StatBand.astro
    │   │   └── QuoteCTA.astro
    │   ├── animations/               # The 9 PLAN.md prompts, one per file
    │   │   ├── FreightNetwork.astro
    │   │   ├── CoverageReveal.astro
    │   │   ├── HowItWorksFlow.astro
    │   │   ├── TrailerMorph.astro
    │   │   ├── FlatbedLTLViz.astro
    │   │   ├── TransloadFlow.astro
    │   │   ├── CrossDockFlow.astro
    │   │   ├── DistressedRecovery.astro
    │   │   └── StatCountUp.astro
    │   ├── seo/
    │   │   ├── JsonLd.astro          # Generic schema renderer
    │   │   ├── Organization.astro
    │   │   ├── Service.astro
    │   │   ├── LocalBusiness.astro
    │   │   ├── BreadcrumbList.astro
    │   │   ├── FAQPage.astro
    │   │   └── Article.astro
    │   └── ui/
    │       ├── Button.astro
    │       ├── Card.astro
    │       ├── QuoteForm.astro
    │       └── ServiceLink.astro
    ├── content/
    │   └── config.ts                 # Astro Content Layer + Sanity loader bindings
    ├── layouts/
    │   ├── BaseLayout.astro
    │   ├── ServicePillarLayout.astro
    │   ├── IndustryLayout.astro
    │   └── ArticleLayout.astro
    ├── pages/
    │   ├── index.astro
    │   ├── services/
    │   │   ├── index.astro
    │   │   └── [slug].astro          # Dynamic from Sanity
    │   ├── industries/
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   ├── why-comet/
    │   │   ├── index.astro
    │   │   ├── everyone-wins.astro
    │   │   ├── about.astro
    │   │   └── coverage-map.astro
    │   ├── insights/
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   ├── locations/
    │   │   └── atlanta.astro
    │   ├── get-a-quote.astro
    │   ├── contact.astro
    │   ├── carriers.astro
    │   ├── 404.astro
    │   └── api/
    │       └── quote.ts              # POST handler → Resend
    ├── lib/
    │   ├── sanity.ts                 # Client + image URL builder
    │   ├── schema.ts                 # JSON-LD builders (Organization, Service, etc.)
    │   ├── seo.ts                    # canonical/og helpers
    │   └── motion.ts                 # Motion One helpers + reduced-motion guard
    └── styles/
        ├── tokens.css                # CSS custom properties (single source)
        ├── base.css                  # Resets, typography base
        └── motion.css                # @keyframes for non-JS animations
```

---

## 3. Content Model (Sanity Schemas)

Each schema lives in `sanity/schemas/` and is mirrored as a Zod type in `src/content/config.ts` for compile-time safety.

**`service`** (12+ documents — one per `/services/*` URL)
- `title` (string, required)
- `slug` (unique, required)
- `category` (enum: trailer | facility | managed) — drives mega-menu grouping
- `equityLine` (string, optional) — e.g. "You only pay for the space you use"
- `heroHeadline`, `heroSubline`
- `heroAnimationKey` (enum referencing the 9 animation component slugs)
- `heroImage` (Sanity image with hotspot)
- `whatItIs` (Portable Text)
- `whoItsFor` (Portable Text)
- `cargoList` (array of strings) — for the bulleted cargo grids
- `howItWorks` (array of {step, title, body, icon})
- `whyComet` (Portable Text) — keep FlatbedLTL's cost-trap content here
- `relatedServices` (array of references → `service`)
- `relatedIndustries` (array of references → `industry`)
- `faq` (array of {q, a}) — drives FAQPage JSON-LD
- `seo` (object: title, description, ogImage)
- `schemaServiceType` (string) — for Service JSON-LD's `serviceType`

**`industry`** — Construction, Manufacturing, Building Materials, Machinery
- `title`, `slug`, `heroImage`
- `intro` (Portable Text)
- `relevantServices` (array of references → `service`) — recombines services into buyer mental model
- `cargoExamples` (array of strings)
- `seo` (object)

**`insight`** (blog posts, includes migrated legacy posts)
- `title`, `slug`, `excerpt`
- `author` (reference → `person`)
- `publishedAt`, `updatedAt` (datetimes)
- `legacyUrl` (string, optional) — for redirect map traceability
- `body` (Portable Text with custom blocks: pull-quote, animation embed, cost-trap table, callout)
- `heroImage`
- `tags` (array)
- `seo` (object)

**`testimonial`**
- `quote` (text)
- `attribution` (name, role, company)
- `featured` (bool) — for the home page band

**`settings`** (singleton)
- `phone`, `email`, `address` (street, city, region, postal, country)
- `hours`
- `socials` (array of {platform, url})
- `foundingYear` (number) — resolves the PLAN.md placeholder
- `navItems` (array)

**Why Sanity over Decap (since the question came up):** Service pages have ~12 structured fields with cross-references (`relatedServices`, `relatedIndustries`) and arrays of objects (`howItWorks`, `faq`). Decap handles flat markdown well but struggles with this structure. Sanity also gives a CDN image pipeline — critical since PLAN.md §4 demands real, full-bleed, slightly-desaturated load photography. Sanity Studio can be deployed for free at a `*.sanity.studio` subdomain or self-hosted at `studio.cometnational.com`.

---

## 4. Design System

### Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Color */
  --c-navy:        #1a2332;
  --c-charcoal:    #2a2f3a;
  --c-ink:         #0d1117;        /* near-black body text */
  --c-ink-muted:   #4b5563;
  --c-line:        #d4d8de;
  --c-bg:          #fafafa;        /* near-white ground */
  --c-bg-elevated: #ffffff;
  --c-accent:      #f5a623;        /* safety amber */
  --c-accent-ink:  #1a1206;        /* text on amber */
  --c-warn:        #c8331a;        /* distressed-load red, sparingly */

  /* Type — fluid scale, clamp(min, preferred, max) */
  --t-display:  clamp(2.75rem, 5vw + 1rem, 5.25rem);   /* Hero headline */
  --t-h1:       clamp(2.25rem, 3vw + 1rem, 3.75rem);
  --t-h2:       clamp(1.625rem, 2vw + 0.75rem, 2.5rem);
  --t-h3:       clamp(1.25rem, 1vw + 0.75rem, 1.625rem);
  --t-body:     1.0625rem;
  --t-small:    0.875rem;
  --t-mono:     0.875rem;

  /* Type families */
  --ff-display: "Archivo", system-ui, sans-serif;       /* industrial-geometric, variable */
  --ff-body:    "Inter", system-ui, sans-serif;         /* humanist, variable */
  --ff-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Space — 4px base */
  --s-1: 0.25rem; --s-2: 0.5rem; --s-3: 0.75rem; --s-4: 1rem;
  --s-6: 1.5rem;  --s-8: 2rem;   --s-12: 3rem;   --s-16: 4rem;
  --s-24: 6rem;   --s-32: 8rem;

  /* Radii — sharp, industrial */
  --r-sm: 2px; --r-md: 4px; --r-lg: 6px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --d-fast: 200ms; --d-base: 400ms; --d-slow: 800ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0ms !important; transition-duration: 0ms !important; }
}
```

Tailwind v4's `@theme` directive maps these into utilities (`bg-bg`, `text-ink`, `border-line`, `text-accent`, etc.) — single source of truth.

### Typography
- **Display:** Archivo (variable, 100–900) — free, condensed weights read as industrial signage
- **Body:** Inter (variable) — workhorse humanist sans, extreme legibility
- **Mono:** JetBrains Mono — spec labels (weights, dimensions, lane data) — visual cue that *we know our numbers*
- All three subset to Latin, self-hosted from `public/fonts/`, declared in `base.css` with `font-display: swap`, preloaded in `BaseHead.astro`

### Layout
- 12-col grid, max-width 1280px content, full-bleed hero sections
- Oversized section numbers (`01 · Services`, `02 · Industries`) in mono — visible structure
- Cards: 1px line border, 2px radius, no shadow by default; hover lifts with a 1px amber underline animation, never a drop shadow
- Generous whitespace (industrial buyers parse fast — clutter signals amateur)

### Visual language anchors
- Single saturation: only the amber accent is saturated; photography is desaturated 15–25%, navy text everywhere else
- No gradients, no glassmorphism, no soft shadows — every flourish would dilute the industrial-confidence read
- Photography rules: full-bleed, slight grain texture overlay (~3% opacity) on hero images to keep them from feeling "stock"

---

## 5. Animation Architecture

The 9 PLAN.md prompts each become a self-contained `.astro` component in `src/components/animations/`. Implementation rules:

1. **Pure inline SVG** — no `<img>`, no Lottie, no external loaders. Hand-author each scene as inline `<svg>` markup so it's crawlable, themeable via CSS, and zero network cost beyond the HTML.
2. **CSS-first** — Looping animations (Prompts 1, 4, 5, 6, 7) use pure `@keyframes` in `motion.css`. No JS needed.
3. **Scroll-triggered via `IntersectionObserver` + class toggle** — Prompts 2, 3, 8, 9. The observer is a single shared utility in `lib/motion.ts`, loaded once per page via `client:visible`.
4. **Modern scroll-driven CSS** — Where supported, use `animation-timeline: scroll()` and `view()` natively (Chrome, Edge). Provide `scroll-timeline-polyfill` for Safari/older browsers via dynamic import only when needed.
5. **`prefers-reduced-motion` honored at the @media level** — automatic via tokens.css block above; each animation's keyframes have a static end-state default.
6. **Each animation is an island:** `<TrailerMorph client:visible />` so the JS (if any) only ships and runs when actually scrolled near.
7. **Per-animation JS ceiling: 2 kB gzipped**.

### Animation → page mapping

| Prompt | Component | Used on |
|---|---|---|
| 1. Hero freight network | `FreightNetwork.astro` | `/` hero |
| 2. Coverage map reveal | `CoverageReveal.astro` | `/`, `/why-comet/coverage-map`, `/locations/atlanta` |
| 3. How It Works 3 steps | `HowItWorksFlow.astro` | `/`, every `/services/*` (variant per service) |
| 4. Trailer morph | `TrailerMorph.astro` | `/` Mode Selector, `/services` hub |
| 5. Flatbed LTL "pay for space" | `FlatbedLTLViz.astro` | `/services/flatbed-ltl` |
| 6. Transload mode change | `TransloadFlow.astro` | `/services/transloading` |
| 7. Cross-dock consolidation | `CrossDockFlow.astro` | `/services/cross-docking` |
| 8. Distressed load recovery | `DistressedRecovery.astro` | `/services/distressed-load-recovery` |
| 9. Stat count-up band | `StatCountUp.astro` | `/`, `/why-comet/about`, `/locations/atlanta` |

Hand-authored SVG draft for each will be checked into the repo as a starting point in Phase 3; iteration happens in code, not in After Effects.

---

## 6. Performance Plan

### Budgets (enforced via Lighthouse CI in GitHub Actions)
- **LCP** < 1.8s mobile 4G, < 1.2s desktop
- **CLS** < 0.05
- **INP** < 200ms
- **TBT** < 150ms
- **JS per route** < 30 kB gzip (most routes: 0 kB)
- **CSS per route** < 20 kB gzip
- **Total transfer per route** < 250 kB
- **Lighthouse Performance** ≥ 95 on all key pages, **SEO** = 100, **Accessibility** ≥ 95

### Techniques
- **Astro Islands:** Animation components shipped with `client:visible` only — JS executes when scrolled near, not on page load
- **No client framework runtime** — no React/Vue/Svelte unless absolutely required (currently: not required)
- **Sanity image pipeline:** every CMS image rendered at 5 widths (`320, 640, 960, 1280, 1920`) via `srcset` with AVIF preferred, WebP fallback, JPEG floor
- **Astro `<Image>`** for local assets — build-time AVIF/WebP, explicit `width`/`height` to lock CLS
- **Self-hosted variable fonts** — one HTTP/2 request per family, preloaded for Archivo (display) and Inter regular
- **Critical CSS inlined automatically** by Astro
- **`<ViewTransitions />`** for instant nav between service pages; pairs with `<link rel="prefetch">` on hover for mega-menu items
- **Pagefind static search index** — search works without a server, no DB
- **Vercel Edge Network** — Brotli, HTTP/3, smart caching of static assets with hashed filenames (`Cache-Control: public, max-age=31536000, immutable`)

### Build-time checks (CI)
- `astro check` — type errors fail the build
- `@axe-core/cli` against built `dist/` — accessibility regressions fail the build
- `lighthouse-ci` against preview deploy — perf budgets enforced per PR
- `pa11y-ci` for WCAG AA
- `link-checker` for internal/external broken links (catches stale legacy URL references)

---

## 7. SEO Implementation

### Per-page meta (driven by Sanity `seo` field, with sensible fallbacks)
`BaseHead.astro` always emits:
- `<title>` (page-specific, ~55–60 chars)
- `<meta name="description">` (~155 chars, unique per page — fixes the legacy "ship anything to anywhere" duplication noted in PLAN.md §6)
- `<link rel="canonical">` — always `https://cometnational.com{pathname}`, no www, no trailing slash
- `<meta property="og:...">` and `<meta name="twitter:...">` — title, description, image (Sanity-served OG image with type-set overlay where missing)
- `<meta name="robots" content="index,follow">`

### JSON-LD components (typed builders in `lib/schema.ts`)
- **Organization** — emitted in `BaseHead` sitewide. NAP from `settings` singleton, single authoritative source.
- **LocalBusiness** — `/locations/atlanta` only. Includes geo coordinates, opening hours.
- **Service** — every `/services/*` page. `serviceType`, `provider` → Organization, `areaServed`: ["US", "CA"].
- **BreadcrumbList** — auto-generated from URL on all pages 2+ levels deep.
- **FAQPage** — driven from service `faq` field; emitted only when ≥1 item.
- **Article / BlogPosting** — every `/insights/*` post; `dateModified` honored.
- **WebSite** + `SearchAction` — sitewide, references Pagefind-backed `/search?q=...`.

All builders are typed and tested with [`schema-dts`](https://github.com/google/schema-dts) for compile-time correctness.

### Sitemap & robots
- `@astrojs/sitemap` generates a multi-file index at `/sitemap-index.xml`
- `public/robots.txt`: `User-agent: * / Allow: / / Disallow: /api/ / Sitemap: https://cometnational.com/sitemap-index.xml`

### Internal linking discipline
- Every service page links to ≥3 related services and ≥1 industry page (mechanically enforced via Sanity's `relatedServices` and `relatedIndustries` reference fields — Studio can warn editors)
- Every industry page links to its `relevantServices`
- Mega-menu structure mirrors the IA so crawl depth stays shallow (every page ≤2 clicks from home)

### Image alt text
- Sanity requires `alt` on every image (validation rule in schema)
- Migrated legacy load photos get authored alts — PLAN.md §6 flags this as currently broken

---

## 8. Vercel Configuration

### Adapter
```ts
// astro.config.mjs
import vercel from "@astrojs/vercel";
export default defineConfig({
  output: "hybrid",
  adapter: vercel({
    imageService: true,           // Vercel Image Optimization for dynamic Sanity URLs
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
  site: "https://cometnational.com",
});
```

### Domains attached to the Vercel project
| Domain | Behavior |
|---|---|
| `cometnational.com` | **Primary**, serves site |
| `www.cometnational.com` | 301 → apex (Vercel built-in redirect) |
| `flatbedltl.com` | 301 → `cometnational.com` per `vercel.json` map |
| `www.flatbedltl.com` | 301 → apex `flatbedltl.com` → final destination |
| `transload911.com` | 301 → `cometnational.com` per `vercel.json` map |
| `www.transload911.com` | 301 → apex `transload911.com` → final destination |

### `vercel.json` redirect strategy
- Per-host redirect rules using the `has: [{ type: "host", value: "flatbedltl.com" }]` matcher
- Skeleton from PLAN.md table is the seed; per-post blog redirects appended after Phase 0 crawl
- File is **generated** by `scripts/build-redirects.ts` from `migration/redirects.csv` — never hand-edited, so the CSV remains source of truth and we can re-run after crawl deltas

```jsonc
// vercel.json (excerpt, after generation)
{
  "redirects": [
    { "source": "/what-we-do",           "has": [{"type":"host","value":"flatbedltl.com"}],
      "destination": "https://cometnational.com/services/flatbed-ltl", "permanent": true },
    { "source": "/how-everybody-wins",   "has": [{"type":"host","value":"flatbedltl.com"}],
      "destination": "https://cometnational.com/why-comet/everyone-wins", "permanent": true },
    { "source": "/blog/:slug",           "has": [{"type":"host","value":"flatbedltl.com"}],
      "destination": "https://cometnational.com/insights/:slug", "permanent": true },
    { "source": "/services",             "has": [{"type":"host","value":"transload911.com"}],
      "destination": "https://cometnational.com/services", "permanent": true },
    { "source": "/(.*)",                 "has": [{"type":"host","value":"flatbedltl.com"}],
      "destination": "https://cometnational.com/services/flatbed-ltl", "permanent": true },
    { "source": "/(.*)",                 "has": [{"type":"host","value":"transload911.com"}],
      "destination": "https://cometnational.com/services/transloading", "permanent": true }
  ],
  "headers": [
    { "source": "/(.*)\\.(woff2|avif|webp|jpg|png|svg|css|js)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

### Quote form API route
`src/pages/api/quote.ts` — Zod validates input → Turnstile token verified → Resend sends formatted email to `sales@cometnational.com` with a confirmation email back to the lead. Rate-limited via Vercel's edge config (10/min per IP).

---

## 9. Migration Mechanics (the #1 SEO risk per PLAN.md §6)

### Phase 0 deliverables (before any production code)
1. **Crawl all three legacy sites** with Screaming Frog → export `internal_html.csv`
2. **Pull GSC Performance data** for each property (12-month window) → top 200 URLs by clicks + impressions per domain
3. **Build `migration/redirects.csv`** with columns: `legacy_host, legacy_path, new_path, status, notes`
4. **Manually verify**: every URL that has ranked in the last 12 months gets an explicit row (not a catch-all)
5. **Inventory content**: for every legacy URL with retained content (Flatbed LTL cost-trap, Transloading service language, all blog posts), confirm it will be ported into Sanity before redirect goes live

### Launch checklist (Phase 1 cutover)
- T-7 days: lower DNS TTL on all three apex records to 300s
- T-1 day: stage final preview on Vercel; run `scripts/verify-redirects.ts` against staging URLs
- T-0:
  1. Switch DNS for `cometnational.com` → Vercel
  2. Switch DNS for `flatbedltl.com` and `transload911.com` → Vercel
  3. Confirm SSL certs issued for all three domains in Vercel
  4. Run full redirect verification matrix
  5. Submit new sitemap to GSC for `cometnational.com`
  6. Initiate Change of Address in GSC for `flatbedltl.com` and `transload911.com`
  7. Keep all three GSC properties verified for 12+ months
- T+1 day: smoke-test top 50 redirects, monitor 404 logs in Vercel
- T+7 days: GSC coverage report — chase any URLs newly marked as "Excluded"

---

## 10. Phased Delivery (mirrors PLAN.md §7, with concrete tasks)

### Phase 0 — Migration map & content inventory (~1 week, doc-only)
- Crawl exports committed under `migration/crawl-exports/`
- `migration/redirects.csv` complete and reviewed
- Sanity content schemas designed (no Studio deploy yet)

### Phase 1 — Foundation + launchable core (~3–4 weeks)
- Astro + Vercel scaffolding, Tailwind v4 + tokens
- Sanity project + Studio deployed; settings, service, industry, insight, testimonial schemas live
- Seed Sanity with PLAN.md content for the 4 priority pages
- `BaseLayout`, `Header`, `Footer`, `MegaMenu`, `StickyMobileCallBar`
- All SEO components in `src/components/seo/`
- Home page (all sections, static placeholder for the 3 home-page animations)
- Services hub page
- 4 priority service pillars: Flatbed LTL, Transloading, Volume LTL, Full Truckload
- `/get-a-quote` page + `/api/quote.ts` (Resend wired, Turnstile installed)
- `/contact` page
- `vercel.json` generated from `redirects.csv`
- DNS cutover for all three domains
- **Outcome:** legacy sites redirected, new site live with the highest-value content

### Phase 2 — Full IA + content migration (~2–3 weeks)
- Remaining 8 service pages
- Industries section (4 pages)
- Why Comet section (3 pages incl. `everyone-wins` migration)
- Insights index + post template
- Migrate every legacy blog post into Sanity with original `publishedAt` preserved
- Per-post 301s added to `redirects.csv` → regenerate `vercel.json`
- **Outcome:** full IA live, both blogs merged, all known legacy URLs redirected

### Phase 3 — Signature animations + scrollytelling (~2 weeks)
- Build all 9 animation components (one PR per animation)
- Wire into target pages per §5 mapping table
- Pinned scrollytelling on Home "How It Works"
- Coverage map reveal on home + dedicated page + `/locations/atlanta`
- Lighthouse CI re-run; confirm budgets still green
- **Outcome:** visually differentiated, on-brand site

### Phase 4 — SEO hardening + monitoring (~1 week)
- `/locations/atlanta` page with LocalBusiness JSON-LD
- FAQ JSON-LD wired across service pages with FAQs
- Final accessibility audit (manual + axe)
- Pagefind site search wired into `/404` and header
- GSC monitoring dashboards (week-over-week impressions for top-200 legacy URLs)
- **Outcome:** consolidation locked in, ranking signals concentrated

---

## 11. Verification

### Local dev
```bash
pnpm install
pnpm dev                              # Astro dev server at :4321
cd sanity && pnpm dev                 # Sanity Studio at :3333
```

### Build & preview
```bash
pnpm build                            # outputs to .vercel/output
pnpm preview                          # serves the production build locally
```

### Per-PR CI (GitHub Actions → Vercel preview)
1. `astro check` — type errors fail
2. `lighthouse-ci autorun` against preview URL — perf budgets enforced
3. `pa11y-ci` against preview URL — accessibility regressions fail
4. `pnpm test` — Vitest unit tests for `lib/schema.ts` JSON-LD builders and `lib/seo.ts` helpers
5. `axe-core` against built dist
6. Link checker — internal links + external links in Insights

### Pre-launch (Phase 1 cutover) verification
- `scripts/verify-redirects.ts` runs the full `redirects.csv` against staging URLs and asserts every row returns a `301` with the expected `Location` header
- Schema validation: run every emitted JSON-LD through Google's [Rich Results Test](https://search.google.com/test/rich-results) for the top 10 page types
- Visual regression: Percy or Chromatic snapshots of every page template on mobile + desktop
- Manual: top 50 legacy URLs hit with curl, verify 301 chain length is exactly 1

### Post-launch monitoring (first 90 days)
- GSC Coverage report — daily check for new "Excluded" URLs
- GSC Performance — weekly impressions comparison vs. pre-cutover baseline
- Vercel Speed Insights — Core Web Vitals real-user metrics
- Vercel Analytics — quote form submission count, page-level conversion rates
- 404 log review — anything legacy that's getting hit but isn't in the redirect map

---

## 12. Resolved inputs & deferred items

**Resolved (locked):**
1. **Founding year:** **1970** — used in trust line ("One Atlanta team. Every mode since 1970.") and Organization JSON-LD `foundingDate: "1970"`.
2. **Photography:** Existing asset library will be supplied; pipeline plans build-time AVIF/WebP via Astro `<Image>` and Sanity image pipeline. No shoot needed for v1.
3. **Brand fonts:** Archivo (display) + Inter (body) + JetBrains Mono (spec) — confirmed.
4. **Resend domain:** `cometnational.com` already SPF/DKIM-configured — no DNS buffer needed.
5. **Sanity Studio hosting:** Sanity-hosted at `cometnational.sanity.studio` (free, zero ops).

**Deferred to later (not blocking v1):**
6. **Stat Count-Up values:** Use placeholders in v1 (e.g., "55+ Years," "Lanes coast-to-coast," etc.) — flagged in Sanity `settings` with `tbd: true` so we can backfill without touching code.
7. **GSC + GA4 access:** Defer access provisioning to Phase 4 (post-launch monitoring window). Phase 0 crawl baseline can be approximated from Screaming Frog + public ranking tools (Ahrefs/SEMrush) if GSC isn't available at kickoff.

---

## 13. Critical files to be created (Phase 1)

These are the load-bearing files the implementation hangs on; everything else is a leaf component.

- `astro.config.mjs` — adapter, integrations, site
- `vercel.json` — generated, committed
- `migration/redirects.csv` — source of truth, hand-authored from crawl
- `scripts/build-redirects.ts` — CSV → vercel.json
- `sanity/sanity.config.ts` + `sanity/schemas/*.ts` — content model
- `src/content/config.ts` — Sanity collection loader
- `src/lib/sanity.ts` — typed client + image helpers
- `src/lib/schema.ts` — JSON-LD builders
- `src/components/layout/BaseHead.astro` — every page's `<head>`, the SEO linchpin
- `src/layouts/BaseLayout.astro` + `ServicePillarLayout.astro` — the two layouts that drive 80% of pages
- `src/pages/api/quote.ts` — only server route; conversion event lives here
- `src/styles/tokens.css` — design system source of truth
