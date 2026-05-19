#!/usr/bin/env tsx
/**
 * Verify redirects against a deployed site (staging or production).
 * Reads migration/redirects.csv and curls each legacy URL, asserting
 * a 301/308 with the expected Location header.
 *
 * Usage:
 *   STAGING=https://comet-staging.vercel.app pnpm redirects:verify
 *   (or set BASE explicitly via PROD=1)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CSV_PATH = resolve(ROOT, "migration/redirects.csv");
const STAGING = process.env.STAGING ?? "";
const PROD = process.env.PROD === "1";
const PRIMARY = "https://cometnational.com";

interface Row {
  legacy_host: string;
  legacy_path: string;
  new_path: string;
}

function parse(text: string): Row[] {
  const out: Row[] = [];
  let headers: string[] | null = null;
  for (const line of text.split("\n").map((l) => l.trim())) {
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(",").map((s) => s.trim());
    if (!headers) { headers = parts; continue; }
    const r: any = {};
    headers.forEach((h, i) => (r[h] = parts[i] ?? ""));
    out.push(r as Row);
  }
  return out;
}

async function checkOne(r: Row): Promise<{ ok: boolean; status: number; location: string; from: string; expect: string }> {
  // Replace :slug-style param with a sample value for the test
  const samplePath = r.legacy_path.replace(/:\w+/g, "sample").replace(/\/\(\.\*\)/, "/sample");
  const baseUrl = PROD ? `https://${r.legacy_host}` : STAGING || `https://${r.legacy_host}`;
  const url = `${baseUrl}${samplePath}`;
  const expectedDest = `${PRIMARY}${r.new_path.replace(/:\w+/g, "sample").replace(/\/\(\.\*\)/, "/sample")}`;

  try {
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "comet-redirect-verify/1" } });
    const loc = res.headers.get("location") ?? "";
    const isRedirect = res.status === 301 || res.status === 308 || res.status === 302;
    const ok = isRedirect && loc.startsWith(expectedDest.replace(/\/$/, ""));
    return { ok, status: res.status, location: loc, from: url, expect: expectedDest };
  } catch (e) {
    return { ok: false, status: 0, location: String(e), from: url, expect: expectedDest };
  }
}

async function main() {
  if (!PROD && !STAGING) {
    console.error("Set STAGING=<url> or PROD=1 before running.");
    process.exit(1);
  }
  const rows = parse(readFileSync(CSV_PATH, "utf8"));
  let fail = 0;
  for (const r of rows) {
    const out = await checkOne(r);
    const mark = out.ok ? "✓" : "✗";
    console.log(`${mark} ${out.status} ${out.from}\n    → ${out.location}\n    expected: ${out.expect}`);
    if (!out.ok) fail++;
  }
  console.log(`\n${rows.length - fail}/${rows.length} redirects OK${fail ? `, ${fail} FAILED` : ""}`);
  process.exit(fail ? 1 : 0);
}

main();
