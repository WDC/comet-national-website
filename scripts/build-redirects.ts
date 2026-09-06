#!/usr/bin/env tsx
/**
 * Read migration/redirects.csv → generate vercel.json (`redirects`, `headers`,
 * `trailingSlash`).
 *
 * CSV columns: legacy_host, legacy_path, new_path, status, notes
 *   - Lines starting with # are comments.
 *   - legacy_path may use `:param` syntax (matches Vercel) — e.g. `/blog/:slug`,
 *     including regex constraints such as `/:year(\d{4})`.
 *   - legacy_path of `/(.*)` becomes a catch-all (keep it the LAST row per host;
 *     Vercel takes the first matching rule).
 *   - new_path is joined onto SITE.url (the canonical host), so every legacy URL
 *     lands on www in one hop instead of chaining through the apex.
 *
 * Expansion rules (so the CSV stays readable):
 *   - Every non-canonical legacy host gets a `www.` twin (FlatbedLTL canonicaled
 *     to www; Transload911 to the apex — both forms are in people's bookmarks).
 *     The canonical host's own apex gets no twin: www IS the destination.
 *   - Every literal path (no params, no catch-all) gets a trailing-slash twin so
 *     WordPress-style `/about/` URLs match too.
 *
 * Also emitted:
 *   - `trailingSlash: false` — `/services/` 308s to `/services` on every host,
 *     matching Astro's `trailingSlash: "never"` so one URL serves each page.
 *   - `X-Robots-Tag: noindex` on the staging/preview hosts (comet.delcoe.com,
 *     *.vercel.app) so the review copy never competes with www in the index.
 *
 * Run: pnpm redirects:build
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE } from "../src/lib/site";

const ROOT = resolve(import.meta.dirname, "..");
const CSV_PATH = resolve(ROOT, "migration/redirects.csv");
const VERCEL_JSON = resolve(ROOT, "vercel.json");
const PRIMARY = SITE.url;
const PRIMARY_HOST = new URL(PRIMARY).host; // www.cometnational.com
const PRIMARY_APEX = PRIMARY_HOST.replace(/^www\./, "");

/** Hosts that serve the site for review and must never be indexed. */
const NON_CANONICAL_HOSTS = ["comet.delcoe.com", "(.*)\\.vercel\\.app"];

type Row = {
  legacy_host: string;
  legacy_path: string;
  new_path: string;
  status: string;
  notes: string;
};

function parseCsv(text: string): Row[] {
  const lines = text.split("\n").map((l) => l.trim());
  const rows: Row[] = [];
  let headers: string[] | null = null;
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const parts = parseCsvLine(line);
    if (!headers) {
      headers = parts;
      continue;
    }
    const r: any = {};
    headers.forEach((h, i) => (r[h] = parts[i] ?? ""));
    rows.push(r as Row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  // Minimal CSV parser — handles unquoted simple commas. Our rows don't need quotes.
  return line.split(",").map((s) => s.trim());
}

function hostVariants(host: string): string[] {
  if (host === PRIMARY_HOST) {
    throw new Error(`redirects.csv: ${host} is the canonical host and cannot be a redirect source.`);
  }
  if (host === PRIMARY_APEX || host.startsWith("www.")) return [host];
  return [host, `www.${host}`];
}

function pathVariants(path: string): string[] {
  const isCatchAll = /\(\.\*\)$/.test(path);
  const hasParams = path.includes(":");
  if (path === "/" || isCatchAll || hasParams) return [path];
  return [path, `${path}/`];
}

function toRedirects(r: Row) {
  const destination = `${PRIMARY}${r.new_path}`;
  const permanent = r.status === "301" || r.status === "" || r.status === undefined;
  const out = [];
  for (const host of hostVariants(r.legacy_host)) {
    for (const source of pathVariants(r.legacy_path)) {
      out.push({
        source,
        has: [{ type: "host" as const, value: host }],
        destination,
        permanent,
      });
    }
  }
  return out;
}

function buildVercelJson(rows: Row[]) {
  const redirects = rows.flatMap(toRedirects);
  return {
    $schema: "https://openapi.vercel.sh/vercel.json",
    trailingSlash: false,
    redirects,
    headers: [
      {
        source: "/(.*)\\.(woff2|avif|webp|jpg|png|svg|css|js)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      ...NON_CANONICAL_HOSTS.map((host) => ({
        source: "/(.*)",
        has: [{ type: "host" as const, value: host }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ],
  };
}

function main() {
  const csv = readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(csv);
  const json = buildVercelJson(rows);
  writeFileSync(VERCEL_JSON, JSON.stringify(json, null, 2) + "\n");
  console.log(`✓ wrote ${json.redirects.length} redirect rules (from ${rows.length} CSV rows) to vercel.json → ${PRIMARY}`);
}

main();
