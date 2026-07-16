#!/usr/bin/env tsx
/**
 * Guard: every `.astro` route under src/pages must opt into static prerendering
 * with `export const prerender = true`.
 *
 * The site runs `output: "server"` (SSR adapter), so only prerendered routes
 * emit static HTML — and only static HTML shows up in the generated sitemap. A
 * page that forgets the flag would build fine and then silently vanish from the
 * sitemap. This check fails the build/CI before that can ship.
 *
 * Usage:
 *   pnpm prerender:verify
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PAGES = resolve(ROOT, "src/pages");
const FLAG = /export\s+const\s+prerender\s*=\s*true/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".astro")) out.push(full);
  }
  return out;
}

const offenders = walk(PAGES).filter((f) => !FLAG.test(readFileSync(f, "utf8")));

if (offenders.length > 0) {
  console.error(
    `\n✗ ${offenders.length} page(s) missing \`export const prerender = true\` — ` +
      `they would SSR and drop out of the sitemap:\n`,
  );
  for (const f of offenders) console.error(`  - ${f.replace(ROOT + "/", "")}`);
  console.error("");
  process.exit(1);
}

const count = walk(PAGES).length;
console.log(`✓ prerender guard: all ${count} .astro page routes are prerendered.`);
