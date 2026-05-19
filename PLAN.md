# Comet National — Unified Website Plan

**The branding problem, stated plainly:** Three domains, three design languages, three copyright years (2021, 2021, 2025), and one phone number. The freight is unified; the internet presence is fractured. A construction GM who finds FlatbedLTL.com for a steel haul has no idea the same company can transload his distressed pallet or warehouse his overflow. Every brand split is a referral leak.

**The solution:** Fold everything under **cometnational.com** — the legacy name with the most equity — and convert FlatbedLTL.com and Transload911.com into **301-redirected service pillars** inside one site. Keep the *language* that already converts (FlatbedLTL's "you only pay for the space you use," Transload911's "when disaster strikes") as page-level messaging, not separate brands.

This is the trust play: a 30-year-old freight name with one deep, modern site beats three thin microsites every time for industrial buyers who vet vendors before they call.

---

## 1. Brand Consolidation Strategy

### Domain & redirect map

| Old asset                         | Disposition                       | Target                     |
| --------------------------------- | --------------------------------- | -------------------------- |
| cometnational.com                 | **Primary domain — rebuild here** | —                          |
| flatbedltl.com                    | 301 redirect, keep registered     | `/services/flatbed-ltl`    |
| flatbedltl.com/what-we-do         | 301                               | `/services/flatbed-ltl`    |
| flatbedltl.com/how-everybody-wins | 301                               | `/why-comet/everyone-wins` |
| flatbedltl.com/blog/*             | 301 (per-post mapping)            | `/insights/{slug}`         |
| transload911.com                  | 301 redirect, keep registered     | `/services/transloading`   |
| transload911.com/services         | 301                               | `/services`                |
| transload911.com/blog/*           | 301 (per-post mapping)            | `/insights/{slug}`         |

**Keep both secondary domains registered and redirecting indefinitely** — they hold backlinks and may still be typed by long-time customers. Do not let them lapse.

### Positioning line

> **Comet National — One freight partner. Every mode. Anything to anywhere.**

Subline that does the heavy lifting for industrial buyers:

> Flatbed LTL, dry van, reefer, full truckload, transloading, and warehousing — managed by one team out of Atlanta since [founding year]. You make one call. We solve the whole problem.

Pull the strongest existing equity phrases into the new site as section headers (not brand names):

- "We ship anything to anywhere" (Comet) → hero tagline
- "You only pay for the space you use" (FlatbedLTL) → Flatbed LTL pillar hero
- "When disaster strikes" (Transload911) → Distressed Load Recovery section

### Migration sequencing

1. Build new cometnational.com in staging.
2. Crawl all three sites; export every indexed URL (Screaming Frog or `sitemap.xml`).
3. Build the per-URL 301 map (above table is the skeleton; blog posts need 1:1 rows).
4. Launch new site → implement 301s same day → submit new sitemap in Google Search Console for all three properties → use GSC "Change of Address" where applicable.
5. Keep Search Console verified on all three domains for 12 months to monitor decay/recovery.

---

## 2. Information Architecture

A clean two-tier structure. Industrial buyers want to self-qualify fast, then talk to a human. Every service page ends in the same quote CTA.

```
/                              Home
/services                      Services overview (the hub)
  /services/flatbed-ltl        ← absorbs flatbedltl.com
  /services/dry-van-ltl
  /services/volume-ltl         (partial / shared truckload)
  /services/full-truckload     (FTL — dry van)
  /services/flatbed-open-deck  (full flatbed, oversized, specialty)
  /services/refrigerated       (reefer, frozen, temp-controlled)
  /services/hotshot            (expedited / urgent)
  /services/transloading       ← absorbs transload911.com
  /services/cross-docking
  /services/distressed-load-recovery
  /services/warehousing-fulfillment
  /services/freight-brokerage
/industries                    Industries overview
  /industries/construction
  /industries/manufacturing-industrial
  /industries/building-materials
  /industries/machinery-equipment
/why-comet                     The trust pillar
  /why-comet/everyone-wins     ← absorbs how-everybody-wins
  /why-comet/coverage-map
  /why-comet/about
/insights                      Blog / resource center (merged from 2 blogs)
  /insights/{slug}
/get-a-quote                   Primary conversion page
/contact
/carriers                      Carrier sign-up (keep mycarrierpackets link)
/locations/atlanta             Local SEO anchor (Lilburn/Atlanta facility)
```

**Why this works for the audience:** A construction buyer lands on `/industries/construction`, sees flatbed LTL + full flatbed + jobsite delivery in one place, and never has to know there were ever three websites. The service taxonomy is broad enough to fill a deep site while every page has a clear job.

### Global navigation

Primary nav (desktop): **Services ▾ | Industries ▾ | Why Comet | Insights | Get a Quote** (button) — with phone number `(800) 831-5376` always visible top-right and a sticky mobile call bar.

Services mega-menu groups by how buyers think:

- **By trailer:** Flatbed LTL · Dry Van LTL · Volume LTL · Full Truckload · Flatbed/Open Deck · Refrigerated · Hotshot
- **By facility:** Transloading · Cross-Docking · Distressed Load Recovery · Warehousing & Fulfillment
- **Managed:** Freight Brokerage

---

## 3. Page-by-Page Content Plan

### Home

| Section              | Content                                                      | Notes                                             |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Hero                 | "We ship anything to anywhere." + subline + dual CTA (Get a Quote / Call) | Animated freight network line draw (see Prompt 1) |
| Trust strip          | "One Atlanta team. Every mode since [year]." + client logos (Sika, etc.) | Pull real testimonial sources already on sites    |
| Mode selector        | Interactive grid: pick your freight type → routes to service | Core IA device; see Prompt 4                      |
| The Comet difference | 3 cards: Pay for space you use · One call, every mode · Distressed-load rescue | Reuses proven copy from all 3 sites               |
| Industries band      | Construction / Manufacturing / Building Materials / Machinery | Photo-forward                                     |
| How it works         | Quote → Schedule → Rest Easy (3 steps)                       | Animated; see Prompt 3                            |
| Coverage             | US + Canada map, Atlanta facility pinned                     | Animated; see Prompt 2                            |
| Testimonials         | The 3 real quotes already in use (Waite/Villalobos/Cabello)  | Keep verbatim — they're authentic                 |
| Final CTA            | Quote form + phone                                           | —                                                 |

### Service pillar template (every `/services/*`)

1. **Hero** — service-specific headline + the inherited equity line where one exists
2. **What it is / who it's for** — plain language, industrial buyer framing
3. **What we haul** — bulleted cargo list (Flatbed LTL already has a great one: pumps, construction equipment, big iron, generators, transformers, tanks, raw materials)
4. **How it works** — 3–4 step animated flow specific to that service
5. **Why Comet for this** — differentiators, the cost-trap education content (FlatbedLTL's Density Minimum Charge / Linear Foot Charge explainer is excellent — keep and expand it)
6. **Related services** — internal links (e.g., Flatbed LTL → Full Flatbed → Transloading)
7. **Quote CTA** — same component sitewide

**Priority page — Flatbed LTL** (`/services/flatbed-ltl`): This is the strongest existing asset. Migrate the full "What We Do" content including the LTL Volume cost-trap education ("A $500 freight bill can quickly escalate to $3,500"). This kind of buyer-educating content is rare in freight and builds enormous trust — expand it into a standalone Insights piece too.

**Priority page — Transloading** (`/services/transloading`): Carry over the concrete mode-change language: "Container to van, flatbed to pup, or van to hotshot." Pair with Distressed Load Recovery and Cross-Docking as the "facility services" cluster.

### Industries pages

Each industry page recombines services into the buyer's mental model:

- **Construction:** Flatbed LTL + Full Flatbed/Open Deck + jobsite delivery + building materials hauls (reinforced concrete, steel, lumber, scaffolding — language already on FlatbedLTL)
- **Manufacturing/Industrial:** Volume LTL + FTL + warehousing + cross-docking
- **Building Materials:** Flatbed + LTL consolidation + storage
- **Machinery & Equipment:** Open deck + oversized + distressed load recovery

### Insights (merged blog)

Consolidate both existing blogs. Editorial pillars: freight cost education (the LTL accessorial-charge content is gold), shipping guides by industry, "anatomy of a transload," seasonal capacity. This is the long-tail SEO engine.

---

## 4. Visual Design Direction

**Aesthetic:** Industrial-modern, not tech-startup. The audience respects competence and durability, not trendiness. Think weathered steel, freight yard at golden hour, precise grid systems — confident, not flashy.

- **Palette:** Deep navy/charcoal base, a single high-visibility accent (safety amber or signal orange — echoes existing Comet/Transload gold and reads as freight/industrial), generous white space, near-black text.
- **Type:** A strong industrial-geometric sans for headlines (condensed, confident), a highly legible humanist sans for body. Optional mono for data/specs labels (weights, dimensions, lane data) — industrial buyers trust spec sheets.
- **Photography:** Real equipment, real loads. FlatbedLTL already has authentic load photos ("Actual FlatbedLTL load") — use real fleet/yard/jobsite imagery, never generic stock trucks. Big, full-bleed, slightly desaturated with the accent color as the only saturation.
- **Layout:** Strong horizontal grid, oversized section numbers, visible structure. Cards with crisp edges, not soft rounded SaaS bubbles.
- **Motion principle:** Animation should communicate *flow and logistics* — things moving from A to B, consolidation, mode changes. Every animation maps to a real freight concept. Subtle, scroll-driven, never autoplaying carousels.

### Signature interactions

- **Scroll-driven freight network draw** on the hero — lines connecting cities animate in as the page loads.
- **Pinned "How It Works"** — steps lock in viewport and advance as the user scrolls (scrollytelling).
- **Mode selector** — hover/tap a trailer type, the illustration reconfigures (flatbed → van → reefer) to show range.
- **Coverage map reveal** — lanes draw across the US/Canada on scroll into view, Atlanta facility pulses.
- **Number count-ups** — loads moved, lanes, years in business, on scroll into stat band.

Performance budget: animations must be CSS/SVG/lightweight JS, respect `prefers-reduced-motion`, and never block the quote CTA or mobile call button.

---

## 5. Animation Prompts (for feeding into an animation/SVG generation tool)

Each prompt is self-contained and describes one simple, loopable or scroll-triggered animation. Keep them flat/2D, brand-colored (navy + amber accent on light ground), and lightweight.

> **Prompt 1 — Hero freight network**
> "Animated 2D SVG of a stylized United States outline in thin navy lines on a near-white background. 6–8 amber dots represent freight hubs, with Atlanta as a larger pulsing dot. Thin amber connecting lines draw themselves outward from Atlanta to the other hubs over 2.5 seconds with an ease-out, then a small dot travels along each line repeatedly to suggest active shipments. Subtle, professional, loops infinitely. Respect reduced-motion: static drawn state with no traveling dots."

> **Prompt 2 — Coverage map reveal (scroll-triggered)**
> "Scroll-triggered 2D SVG: a simplified US + southern Canada map outline. As it enters the viewport, regional lane lines sweep on left-to-right over 1.8s, an Atlanta facility marker drops in and pulses twice, then settles. Navy lines, amber markers, white ground. One-shot on scroll-in, does not loop."

> **Prompt 3 — How It Works, 3 steps**
> "Horizontal 3-node process animation: 'Get a Quote' → 'Schedule Shipment' → 'Rest Easy'. Each node is a simple line icon in a circle. A connecting line draws from node to node sequentially; the active node scales up 10% and fills amber, previous nodes stay navy outline. Triggered step-by-step on scroll. Clean, flat, no gradients."

> **Prompt 4 — Mode selector / trailer morph**
> "Looping 2D SVG of a side-profile semi truck where the trailer morphs smoothly between four states every 2s: open flatbed with a crate, enclosed dry van, refrigerated van (with small snowflake), and a short hotshot trailer. Cab stays fixed; only the trailer geometry tweens. Thin navy linework, amber fill on the active cargo. Smooth ease-in-out, infinite loop."

> **Prompt 5 — Flatbed LTL 'pay for the space you use'**
> "2D SVG of a flatbed trailer top-down view. It starts empty, then 3 differently-sized amber freight blocks slide in from the right and snap into place, filling only ~60% of the deck. A bracket and label animate in over the used portion reading 'you pay for this' while the empty portion dims. Loops every 4s with a 1s pause. Communicates partial/LTL flatbed economics."

> **Prompt 6 — Transload mode change**
> "2D SVG showing a shipping container on the left and a dry van trailer on the right with a small dock between them. Amber pallets animate one at a time from the container, across the dock, into the van. After 4 pallets, the container fades and a flatbed slides in to repeat the transfer, illustrating 'container to van to flatbed.' Continuous loop, thin navy linework, amber pallets."

> **Prompt 7 — Cross-dock consolidation/deconsolidation**
> "2D SVG: three small amber trucks arrive from the left into a central rectangular dock; their cargo blocks merge into one large block; one large truck departs right. Then reverse: one large truck in, splits into three small trucks out. Alternates consolidation/deconsolidation each cycle. Flat, navy + amber, loops every 6s."

> **Prompt 8 — Distressed load recovery**
> "2D SVG of a flatbed deck with a stack of pallets tilted/shifted at an unstable angle and a small amber warning triangle pulsing above it. Over 2s the pallets straighten, re-stack neatly, and a wrap line animates around them; the warning triangle fades and a checkmark fades in. One-shot on scroll-in, with a replay-on-loop option every 5s. Conveys rescue/rework."

> **Prompt 9 — Stat count-up band**
> "Scroll-triggered SVG/numeric animation: four stats count up from 0 to their final values over 1.5s with ease-out ('Years in business', 'Lanes served', 'Loads moved', 'States + Canada'). Thin amber underline draws beneath each number as it finishes. Navy numerals, no loop, fires once per viewport entry."

Each prompt is intentionally a *single concept* so the downstream tool produces clean, reusable scenes. Reuse a shared visual spec line in every batch: *"Flat 2D, navy (#1a2332-ish) linework, amber (#F5A623-ish) accent, near-white ground, no gradients, no 3D, respects prefers-reduced-motion."* — tune exact hex to final brand palette.

---

## 6. SEO & Technical Foundation

### The migration is the #1 SEO priority

Mishandled, consolidating three domains tanks rankings. Done right (clean 1:1 301s, retained content, Search Console change-of-address), authority *concentrates* and the legacy domain gets stronger. **Do not drop the FlatbedLTL cost-education content or the Transloading service language** — that's ranking, converting content. Migrate it, don't rewrite it from scratch.

### On-page

- One H1 per page, descriptive titles: `Flatbed LTL Shipping | Partial Flatbed Carrier | Comet National`
- Unique meta descriptions per page (the old sites reuse "ship anything to anywhere" everywhere — differentiate)
- Service + location pages target "flatbed LTL," "partial flatbed," "Atlanta transloading," "cross-docking Atlanta," "volume LTL / partial truckload"
- Internal linking: every service page links to 3+ related services and 1+ industry page
- Image alt text on real load photos (currently mostly empty on existing sites)

### JSON-LD structured data

Implement these schema types (one block per applicable page):

- **Organization / LocalBusiness** (sitewide, in footer or `<head>`): legal name *Comet National Shipping Company*, the Lilburn GA address (4138 Arcadia Industrial Circle / P.O. Box 2249), phone `(800) 831-5376`, email, LinkedIn `sameAs`, `MovingCompany` or `Organization` type, opening hours Mon–Fri 8–5.
- **Service** schema on every `/services/*` page — `serviceType`, `provider` (→Organization), `areaServed` (US + CA).
- **BreadcrumbList** on all deep pages.
- **FAQPage** on service pages and a dedicated FAQ (Transload911 already has a FAQ — migrate and expand it; great for rich results).
- **Article / BlogPosting** on every Insights post (author, datePublished, dateModified).
- **WebSite** + `SearchAction` if site search is added.

Skeleton example (Organization):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Comet National Shipping Company",
  "url": "https://cometnational.com",
  "logo": "https://cometnational.com/logo.png",
  "telephone": "+1-800-831-5376",
  "email": "sales@cometnational.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4138 Arcadia Industrial Circle",
    "addressLocality": "Lilburn",
    "addressRegion": "GA",
    "postalCode": "30047",
    "addressCountry": "US"
  },
  "areaServed": ["US", "CA"],
  "sameAs": ["https://www.linkedin.com/company/comet-national-shipping-corporation"]
}
```

### Technical checklist

- Server-rendered or static-generated for crawlability and speed (heavy client-side rendering hurts industrial-site SEO and Core Web Vitals)
- Single XML sitemap, submitted to GSC for cometnational.com; legacy sitemaps kept live during transition
- Canonical tags self-referencing; fix the old `www` vs non-`www` inconsistency (FlatbedLTL canonicaled to `www`, Comet to non-`www` — pick one, enforce sitewide)
- HTTPS, HSTS, fast TTFB (the audience often browses from job sites on poor connections — performance is conversion)
- Accessibility: WCAG AA, keyboard nav, `prefers-reduced-motion` honored by every animation
- Persistent quote CTA + click-to-call; the quote form is the primary conversion — instrument it with analytics events
- 404 page that routes to Services + search
- Consolidate the contact info discrepancies across old sites (P.O. Box vs Arcadia Industrial Circle; sales@ vs info@) into one authoritative NAP used everywhere (critical for local SEO consistency)

---

## 7. Recommended Build Approach & Phasing

**Stack fit:** A static-site/SSG approach (Astro or similar) suits this perfectly — content-driven, fast, excellent SEO, easy to layer SVG/scroll animations, cheap to host. Content can live in Markdown/MDX so the service taxonomy is maintainable without a heavy CMS.

| Phase | Scope                                                        | Outcome                                             |
| ----- | ------------------------------------------------------------ | --------------------------------------------------- |
| 0     | URL crawl + 301 map + content inventory of all 3 sites       | Nothing lost in migration                           |
| 1     | Home, Services hub, 4 priority service pillars (Flatbed LTL, Transloading, Volume LTL, FTL), Get a Quote, Contact, Org JSON-LD | Launchable core; redirect FlatbedLTL + Transload911 |
| 2     | Remaining service pages, Industries section, Why Comet, Insights migration with per-post 301s | Full IA live, blogs merged                          |
| 3     | Signature animations (Prompts 1–9), coverage map, scrollytelling | Visual differentiation                              |
| 4     | FAQ schema, location page, performance/accessibility hardening, GSC monitoring | SEO consolidation locked in                         |

**The one thing not to get wrong:** the 301 map and content retention. The visual rebuild is the exciting part, but the business value is in concentrating three fractured presences into one authoritative legacy domain *without* losing the proven, trust-building content already ranking and converting on the old sites.
