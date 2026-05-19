# Comet National — Sanity Studio

The content backend for cometnational.com. Phase 1 ships the Astro site with hard-coded service data in `src/lib/services.ts`. Phase 2 swaps that for live Sanity queries — the schemas here mirror that shape.

## First-time setup

```bash
cd sanity
pnpm install
pnpm sanity init
# answer the prompts:
#   - Create new project: "Comet National"
#   - Dataset: "production"
#   - Use the existing config: yes
```

`sanity init` writes a project ID. Set it in two places:

1. `sanity/.env` (gitignored)
   ```
   SANITY_STUDIO_PROJECT_ID=<your-id>
   SANITY_STUDIO_DATASET=production
   ```

2. Astro `.env`
   ```
   PUBLIC_SANITY_PROJECT_ID=<your-id>
   PUBLIC_SANITY_DATASET=production
   ```

## Develop locally

```bash
cd sanity
pnpm dev           # studio at http://localhost:3333
```

## Deploy the studio

```bash
cd sanity
pnpm deploy
# pick a hostname: cometnational (→ cometnational.sanity.studio)
```

## Schemas

| Document   | Purpose |
|------------|---------|
| `service`  | One per `/services/*` page — 12 in Phase 1 taxonomy |
| `industry` | Industry-vertical landing pages |
| `insight`  | Blog posts (includes migrated legacy posts via `legacyUrl`) |
| `testimonial` | Customer quotes, optionally pinned to a service |
| `settings` | Singleton: NAP, hero copy, stats placeholders, defaults |
| `person`   | Author records for insights |

| Object     | Used in |
|------------|---------|
| `seo`      | Reusable SEO field group on every document |
| `faqItem`  | Q/A pairs for service-page FAQ JSON-LD |

## Phase 2 migration path

After deploying the studio:

1. Seed `settings` with the real NAP (already pre-filled with defaults).
2. Import the 12 services from `src/lib/services.ts` (script TBD).
3. Migrate legacy blog posts → `insight` documents, populating `legacyUrl`.
4. Swap `src/lib/services.ts` for a GROQ query in `src/lib/sanity.ts`.
5. Generate per-post 301s by reading `legacyUrl` from each insight and appending to `migration/redirects.csv`.

The Astro app already has `cdn.sanity.io` whitelisted in `astro.config.mjs` image domains.
