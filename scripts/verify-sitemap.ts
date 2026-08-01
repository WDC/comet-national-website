#!/usr/bin/env tsx
/**
 * Guard: the built site actually serves a sitemap, and that sitemap lists every
 * page it shipped.
 *
 * Three things have gone wrong here before (or nearly did):
 *   1. `/sitemap.xml` 404s — `@astrojs/sitemap` only writes `sitemap-index.xml`,
 *      so the path every crawler tries first was missing until `sitemapAlias()`
 *      (src/lib/sitemap-alias.ts) started copying it.
 *   2. The alias exists in `dist/client` but never reaches the deployed
 *      artifact in `.vercel/output/static`.
 *   3. A page builds fine but is absent from the URL set (an SSR route, a
 *      `filter`ed entry) and quietly stops being indexed.
 *
 * Run AFTER `pnpm build`:
 *   pnpm build && pnpm sitemap:verify
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CLIENT = resolve(ROOT, "dist/client");
const DEPLOYED = resolve(ROOT, ".vercel/output/static");
const SITE = "https://cometnational.com";

const errors: string[] = [];

if (!existsSync(CLIENT)) {
  console.error(`✗ ${relative(ROOT, CLIENT)} not found — run \`pnpm build\` first.`);
  process.exit(1);
}

/** Every `<loc>` in an XML document, in order. */
function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => (m[1] ?? "").trim());
}

/** Recursively collect files under `dir` matching `name`. */
function walk(dir: string, name: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, name));
    else if (entry === name) out.push(full);
  }
  return out;
}

// 1. The alias exists, is a sitemap index, and points at files that shipped.
const aliasPath = join(CLIENT, "sitemap.xml");
if (!existsSync(aliasPath)) {
  errors.push(
    "`sitemap.xml` is missing from the build — /sitemap.xml would 404. " +
      "Check that `sitemapAlias()` still runs after `sitemap()` in astro.config.mjs.",
  );
}

const urlsetLocs = new Set<string>();
if (existsSync(aliasPath)) {
  const alias = readFileSync(aliasPath, "utf8");
  if (!alias.includes("<sitemapindex")) {
    errors.push("`sitemap.xml` is not a <sitemapindex> document.");
  }
  const children = locs(alias);
  if (children.length === 0) errors.push("`sitemap.xml` lists no child sitemaps.");
  for (const child of children) {
    if (!child.startsWith(SITE)) {
      errors.push(`Child sitemap is off-site: ${child} (expected ${SITE}/…).`);
      continue;
    }
    const file = join(CLIENT, child.slice(SITE.length));
    if (!existsSync(file)) {
      errors.push(`\`sitemap.xml\` references ${child}, but ${relative(ROOT, file)} was not built.`);
      continue;
    }
    for (const loc of locs(readFileSync(file, "utf8"))) urlsetLocs.add(loc);
  }
}

// 2. The alias survived the copy into the deployed artifact.
if (existsSync(DEPLOYED) && !existsSync(join(DEPLOYED, "sitemap.xml"))) {
  errors.push(
    "`sitemap.xml` exists in dist/client but not in .vercel/output/static — " +
      "the adapter copied static files before the alias was written.",
  );
}

// 3. Every prerendered page is in the URL set. `404.html` is not an index.html,
//    so it drops out naturally — as do non-HTML endpoints (og images, rss.xml).
const pages = walk(CLIENT, "index.html")
  .map((f) => relative(CLIENT, f).replace(/index\.html$/, "").replace(/\/$/, ""))
  .map((p) => (p === "" ? SITE : `${SITE}/${p}`));

const missing = pages.filter((p) => !urlsetLocs.has(p));
if (missing.length > 0) {
  errors.push(
    `${missing.length} built page(s) missing from the sitemap:\n` +
      missing.map((p) => `    - ${p}`).join("\n"),
  );
}

// Stale entries point crawlers at 404s.
const stale = [...urlsetLocs].filter((l) => !pages.includes(l));
if (stale.length > 0) {
  errors.push(
    `${stale.length} sitemap URL(s) have no built page:\n` +
      stale.map((l) => `    - ${l}`).join("\n"),
  );
}

if (errors.length > 0) {
  console.error("\n✗ sitemap guard failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ sitemap guard: /sitemap.xml serves ${urlsetLocs.size} URLs, all ${pages.length} built pages listed.`);
