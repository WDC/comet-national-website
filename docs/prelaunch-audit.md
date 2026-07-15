# Comet National — Pre-Launch Audit & Improvement Plan

_Read-only sweep of the full site (code review + rendered screenshots at 390px / 768px / 1440px on 10 routes). No code was changed. July 2026._

**Overall:** this is an unusually strong foundation — disciplined token system, fluid type, real brand voice, healthy heading structure, self-hosted fonts with metric-matched fallbacks, working redirect migration, and no horizontal overflow found on any page at any viewport. The issues below are concentrated in a handful of launch blockers (one real rendering bug, factual contradictions, links to pages that don't exist) plus systematic polish opportunities.

---

## P0 — Launch blockers

### 1. The quote form submit button renders as unstyled text (verified in browser)
`src/styles/base.css:91-95` has a global reset:

```css
button { cursor: pointer; background: none; border: none; padding: 0; }
```

This is **unlayered** CSS, and Tailwind v4 emits utilities inside `@layer utilities` — unlayered author styles beat layered ones regardless of source order. So every real `<button>` loses its `bg-accent` background and padding. Computed style of the quote form submit at 390px: `background: transparent`, ink-colored text. The single most important button on the site ("Send the quote request", `QuoteForm.astro:91`) looks like a plain line of text. Link-styled CTAs (`<a>` via `Button.astro`) are unaffected, which is why the bug is invisible everywhere else.

**Fix:** wrap the base.css resets in `@layer base { … }` (or scope the button reset away from `.btn-type`).

### 2. Founding-story contradictions on the trust page
- Site-wide: **1995** (`src/lib/site.ts:16`, header/footer logo "Est. 1995", Hero eyebrow, 8+ service pages).
- `src/pages/why-comet.astro:88,102,197`: **1992** ("began in September 1992", big "1992 · Founded" stat, "Atlanta-dispatched since 1992") — on the page whose whole job is credibility, under a header that says "Est. 1995".
- "**Five decades**" of experience appears in `industries/machinery-equipment.astro:9`, `lib/services.ts:298`, `industries/construction.astro:42` — it's ~31–34 years from either founding date, and `StatCountUp.astro:16` literally renders "31+ years in business" on the same homepage.
- Origin story says the company started in **Snellville** (`why-comet.astro:94`), NAP address is **Lilburn** (`site.ts:20-26`), marketing voice is **Atlanta**. Reconcile explicitly (e.g. "founded in Snellville, now shipping from our Lilburn dock in metro Atlanta").
- `site.ts:11` legal name "Comet National Shipping **Company**" vs LinkedIn slug "…shipping-**corporation**" (`site.ts:32`).

**Fix:** pick the real year, derive every mention from `SITE.foundingYear`, kill "five decades," and reconcile the geography and legal name.

### 3. Navigation and metadata point at pages that don't exist
All verified against `src/pages/` — these 404 today:

| Target | Referenced from | Severity |
|---|---|---|
| `/insights` | **Primary nav** `Header.astro:11`, `Footer.astro:52` | Header link 404s on every page |
| `/insights/rss.xml` | `<link rel="alternate">` on every page, `BaseHead.astro:68` | Crawler-facing |
| `/locations/atlanta` | `Footer.astro:53` + LocalBusiness schema `@id` (`schema.ts:57-59`) | Footer + structured data |
| `/carriers` | `Footer.astro:54` | Footer 404 |
| `/search?q=` | WebSite `SearchAction` JSON-LD (`schema.ts:47`) | Invalid Sitelinks-Searchbox markup |
| `/why-comet/coverage-map` | Homepage CTA `CoverageMap.astro:20` | Homepage CTA 404s |
| `/why-comet/everyone-wins` | `services/volume-ltl.astro:57` | In-body CTA 404s |
| `/insights/:slug` | Legacy `/blog/:slug` 301s in `vercel.json` (both legacy domains) | Old blog links 301 → 404 |

**Fix:** either ship minimal versions of `/insights`, `/carriers`, `/locations/atlanta` or remove the links/schema/RSS tag until Phase 2. Point legacy `/blog/*` redirects somewhere real.

### 4. Content is invisible without JavaScript, and stats server-render as "0"
- `.reveal { opacity: 0 }` is unconditional (`motion.css:8-15`). No-JS users (and any crawler that doesn't execute JS) get blank sections; the rendered-screenshot sweep showed exactly this failure mode — whole bands (mode cards, difference cards, industries grid, testimonials, footer columns, related services) as empty slabs until IntersectionObserver fires.
- The stat band SSRs literal `0` for every number (`StatCountUp.astro:25` — confirmed in served HTML: `>0</span>` × 4). "0 years in business, 0 loads moved" is what a no-JS visitor reads.

**Fix:** gate the hidden state on a JS flag (e.g. set `document.documentElement.classList.add('js')` inline in `<head>`, scope `.reveal` under `html.js`), and SSR the final stat values (animate *from* 0 client-side by reading `data-count`, but ship the real number in HTML).

### 5. Legal / compliance gaps while collecting PII
The quote form collects name/phone/email/company, but the footer (`Footer.astro:60-69`) has **no Privacy Policy or Terms links** anywhere on the site. Also missing for a carrier/brokerage: **MC / USDOT numbers** and insurance/cargo-liability statements — baseline trust signals in freight (ironically, `freight-brokerage.astro:61` demands partner carriers be "FMCSA-current, insured to your standards"). Add privacy policy + terms pages and put authority numbers in the footer.

---

## P1 — Quick wins (high impact, low effort)

1. **Brass text on cream fails contrast.** `--c-accent #c29237` on `--c-bg #f7f6ee` ≈ 2.5:1 — fails WCAG AA even for large text. The token file already defines the fix: `--c-accent-deep #8a6a1f` ("brass as text/outline on light grounds", `tokens.css:25`) ≈ 4.4:1. Swap it in: `Hero.astro:71` (the word "anything"), `QuoteCTA.astro:37`, `HowItWorks.astro:33`, and the 14px CTA links `CoverageMap.astro:73`, `ModeSelector.astro:131`, `IndustriesBand.astro:159`. (Brass on pine-deep passes ~4.65:1 — dark sections are fine as-is.)
2. **Meta descriptions: 19 of 21 indexable pages exceed 160 chars** (up to 220). Trim site-wide. The homepage one also says "since 1995" twice (`index.astro:18` appends it to `SITE.subline`, which already ends with it).
3. **14 title tags exceed 60 chars** — the `Primary | Secondary | Comet National` triple-segment pattern on all service/industry pages. Drop the middle segment on the worst (63–80 char) offenders.
4. **Breadcrumb JSON-LD casing bug:** `breadcrumbsFromPath()` is called without a titles map (`BaseHead.astro:23`) so structured data says "Flatbed Ltl" / "Machinery Equipment" while visible crumbs say "Flatbed LTL". Pass the real titles.
5. **Emit the LocalBusiness schema** — fully built in `schema.ts:53-71` but never rendered anywhere. Significant local-SEO miss for a location-based freight business (fix its `/locations/atlanta` URL first).
6. **Wire up FAQs** — `faqSchema()` (`schema.ts:114`) and the `ServiceSchema` `faq` prop exist but no page uses them. 3–5 real questions per service page (accessorials, transit times, liftgate, insurance, minimums) is both a rich-result and a conversion win.
7. **QuoteForm token drift:** focus glow is `rgba(245,166,35,…)` = `#f5a623`, a legacy orange that isn't the brand brass (`QuoteForm.astro:211`); status colors don't match `--c-warn`/`--c-success` either. Point them at tokens.
8. **Hero lede bypasses its own token** (`Hero.astro:95` hardcodes `1.125rem` instead of `--t-lede`) so it never scales up on wide screens.
9. **ModeSelector silently shows 9 of 12 services** (`ModeSelector.astro:7` — `SERVICES.slice(0, 9)`) while the copy above says "twelve services." Add a "See all 12 services →" affordance or show all 12.
10. **Substantiate or cut "50,000+ loads moved"** — flagged as placeholder in source (`StatCountUp.astro:7-8`) but renders as fact. Also note `new Date().getFullYear()` on a prerendered page freezes "years in business" at build time.
11. **Sticky mobile call bar on `/get-a-quote`** includes a "Get a Quote" button linking to the page you're already on, and overlays the form. Hide the bar (or swap its CTA) on that route. Also `BaseLayout.astro:48-50` reserves a flat 64px for it, which can be less than the bar's real height on notched phones (safe-area inset) — footer content can be covered.

---

## P2 — Visual appeal, section by section

**Homepage flow (top → bottom):**
- **Hero (mobile/tablet):** `order: -1` puts the HeroNetwork map *above* the headline (`Hero.astro:149`), and at small sizes the pale line-art reads as a near-blank cream block — the first screenful is mostly empty before the H1. Either keep copy first on small screens or increase the visual's stroke contrast/density.
- **TrustStrip:** client "logos" are plain text names at 65% opacity (`TrustStrip.astro`) — easily mistaken for placeholder. Real monochrome logos (or a deliberate "trusted by" typographic treatment with more weight) would add instant credibility.
- **CometDifference / ModeSelector / IndustriesBand / Testimonials use three different card languages** (seamless hairline grid vs collapsed borders vs separated bordered cards) and two padding scales (24px vs 32px). Unify one card system; the CometDifference/IndustriesBand line-art treatment is the strongest and worth extending.
- **QuoteCTA** — the final conversion moment — is plain centered text on the default cream ground, while the equivalent CTA on service pages goes pine-deep inverse. Give it the `.section-inverse` treatment for weight and consistency.
- **StatBand / HowItWorks** are flat type on `bg-elevated`; candidates for a subtle texture or the coverage-map motif.
- **Testimonials** are attributed to initials + vague descriptors ("B. Waite · Industrial supplier, Southeast") — the component's own comment says "replace with full attribution." Named people + companies (with permission) or drop the section; anonymous quotes can read as fabricated.

**Service pages:** 6 of 12 still have the `art-placeholder` SVG with `TODO: replace with custom animation` (`dry-van-ltl`, `flatbed-open-deck`, `refrigerated`, `hotshot`, `warehousing-fulfillment`, `freight-brokerage` — each at line 18) while the other six get real animations. Visible inconsistency; the flatbed-LTL "cost trap" comparison table is the best section on the site and a model for the rest. Consider labeling its $500→$3,500 example as illustrative.

---

## P3 — Viewport / responsive polish

No horizontal overflow anywhere (verified programmatically at 390/768/1440) and `100dvh` is used correctly. Remaining issues are in the middle range:

1. **Nine ad-hoc breakpoints** (560–1080px) with no shared scale; near-duplicates 880/900/960 should collapse into tokens.
2. **3→1 column jumps with no tablet step:** CometDifference (≤880px), Testimonials (≤900px), ServicePillar related-services (≤880px) go straight to full-width single column — the whole 600–900px range shows overly wide stacked cards. ModeSelector and IndustriesBand already do 3→2→1 correctly; copy that pattern.
3. **StatBand stays 4-across until 760px** — cramped at ~768px portrait with `clamp(2.5rem,5vw,4rem)` numerals.
4. **900–960px dead zone:** desktop nav is visible but MegaMenu opens only on hover/focus (`Header.astro:106-112`) — a tap navigates instead of opening the menu on touch tablets.
5. **Mobile nav hygiene:** no Escape-to-close, no outside-click close, no focus trap (`Header.astro:118-128`); hamburger is 40×40px (guideline 44px).

---

## P4 — Copy improvements (beyond the P0 contradictions)

The voice is strong; these are the weak spots:

- **`why-comet.astro:62` hero: "Your trusted transportation solutions provider."** — the most generic line on the site, on the page that most needs voice. The page's own body copy ("Not a marketplace…") is better; promote that. Same for the vision statement at `:141` ("highly-trusted solutions provider and advisor").
- **`why-comet.astro:54` meta:** "Atlanta's most trusted transportation partner" — unprovable superlative; rephrase defensibly.
- **`CoverageMap.astro:12-14`:** "Our 4138 Arcadia Industrial Circle facility is the hub" — a raw street address as a name; "our Lilburn dock, just off I-85" reads better.
- **Templated closers:** all 11 service pages end with the identical "Tell us about the load" block (`ServicePillarLayout.astro:97-99`); vary by category. "Quote. Schedule. Rest easy." appears 3×; keep only if intentional as a motif.
- **`hotshot.astro:70`:** "Show-must-go-on freight" sits oddly in a concrete cargo list; replace with a real example.
- **Unbacked SLAs** stated as promises ("replies within one business hour", "driver rolling within 2 hours"): keep only if operationally true; they're strong differentiators if so.
- **Service → industry links are missing** (industry pages link to services but not vice versa). Add a "Common industries" strip to service pages — internal-linking and relevance win.
- **Contact page is thin** for a "pick up the phone" brand: no map, no named humans, no form. Even one named dispatcher with a direct line would reinforce the positioning.

---

## P5 — SEO / performance / motion plan

**Already good:** every page is `prerender = true` so the sitemap works despite SSR output (add a config `filter`/CI guard so a future non-prerendered page doesn't silently vanish); robots.txt correct; canonicals consistent with `trailingSlash: "never"`; www→apex redirect in place; one H1 per page; unique titles/descriptions; `og-default.jpg` and logo exist; fonts preloaded with swap + metric-matched fallbacks; LCP is text.

**Do:**
- Per-page OG images eventually (every page shares one image today; the `ogImage` prop exists and is never used). Add `og:image:width/height/alt`.
- Emit LocalBusiness + FAQPage (above); consider `ItemList`/Service schema on industry pages (currently the thinnest structured data).
- **GSAP hero:** `HeroNetwork.astro:112-120` boots immediately (no idle defer, no mobile gate) and runs a `repeat: -1` timeline with no ScrollTrigger — it animates forever even when scrolled off-screen. The lib already supports `opts.scrollTrigger` (`networkCycle.ts:31,102`); pass it, defer to idle, and consider skipping on small screens. Same for the always-running CSS loops (TrustStrip pulse, TrailerMorph cycle): pause when off-screen.
- Reduced-motion support is genuinely excellent (global kill + per-component static states) — keep it.

---

## Suggested sequencing

| Phase | Scope |
|---|---|
| **Now (blockers)** | Button-reset cascade fix · 1992/1995 + "five decades" + Snellville/Lilburn · remove/ship the 8 dead links & schema targets · no-JS reveal fallback + SSR stat values · privacy/terms + MC/DOT in footer |
| **Pre-launch week** | Contrast swap to `--c-accent-deep` · meta description/title trims · breadcrumb titles map · LocalBusiness + FAQ schema · QuoteForm token drift · sticky-bar behavior on quote page · ModeSelector "see all 12" |
| **Fast follow** | Tablet grid steps + breakpoint tokens · card-language unification · QuoteCTA inverse treatment · real testimonial attribution + client logos · six placeholder service heroes · GSAP gating · service→industry links · contact page depth · per-page OG images |

## Open questions for the team

1. **Which founding year is true — 1992 or 1995?** Everything else about the origin story hangs on this.
2. **Is Insights (blog) shipping at launch?** It's in the primary nav, the RSS tag, and the legacy-blog redirect targets. If not, all three should come out until it ships.
3. **Can we get real numbers for the stat band** (loads moved) **and named testimonial attributions / client logo permissions?** Both are flagged placeholder in source.
4. **What are the MC/USDOT numbers and insurance coverage** to put in the footer, and are the "one business hour" / "2 hours rolling" SLAs operationally committed?
5. **Are `/carriers` and `/locations/atlanta` planned pages** (carrier recruitment is a real audience) or should the footer links go?
