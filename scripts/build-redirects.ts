#!/usr/bin/env tsx
/**
 * Read migration/redirects.csv → generate vercel.json `redirects` block.
 *
 * CSV columns: legacy_host, legacy_path, new_path, status, notes
 *   - Lines starting with # are comments.
 *   - legacy_path may use `:param` syntax (matches Vercel) — e.g. `/blog/:slug`.
 *   - legacy_path of `/(.*)` becomes a catch-all (use cautiously as the LAST row per host).
 *
 * Run: pnpm redirects:build
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CSV_PATH = resolve(ROOT, "migration/redirects.csv");
const VERCEL_JSON = resolve(ROOT, "vercel.json");
const PRIMARY = "https://cometnational.com";

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

function toRedirect(r: Row) {
  // `:slug` in legacy_path is preserved; Vercel matches & passes to destination
  const destination = `${PRIMARY}${r.new_path}`;
  return {
    source: r.legacy_path,
    has: [{ type: "host" as const, value: r.legacy_host }],
    destination,
    permanent: r.status === "301" || r.status === "" || r.status === undefined,
  };
}

function buildVercelJson(rows: Row[]) {
  const redirects = rows.map(toRedirect);
  return {
    $schema: "https://openapi.vercel.sh/vercel.json",
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
    ],
  };
}

function main() {
  const csv = readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(csv);
  const json = buildVercelJson(rows);
  writeFileSync(VERCEL_JSON, JSON.stringify(json, null, 2) + "\n");
  console.log(`✓ wrote ${rows.length} redirect rules to vercel.json`);
}

main();
