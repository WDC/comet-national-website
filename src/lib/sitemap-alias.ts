/**
 * sitemap-alias
 *
 * `@astrojs/sitemap` writes `sitemap-index.xml` (the index) plus one or more
 * `sitemap-0.xml`-style URL sets. It never writes `/sitemap.xml` — the path
 * every crawler, Search Console operator, and human actually tries first. Left
 * alone, https://cometnational.com/sitemap.xml is a 404.
 *
 * This integration copies the generated index to `sitemap.xml` at the end of
 * the build, so the alias is a real static file served by Vercel's filesystem
 * handler. Doing it as a file (rather than a `vercel.json` rewrite) keeps it
 * independent of route-matching order — the adapter's build output ends with a
 * catch-all that sends unmatched paths to /404.html.
 *
 * Copying the *index* rather than the URL set means the alias keeps working if
 * the site ever outgrows one 45,000-URL file: the index lists whatever
 * `sitemap-N.xml` files the build produced.
 *
 * Must be registered AFTER `sitemap()` in `integrations` — Astro runs
 * `astro:build:done` hooks in declaration order, and this one reads the file
 * that hook writes. It throws (failing the build) if the index is missing,
 * rather than shipping a deploy whose sitemap silently 404s again.
 */
import { copyFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";

const INDEX = "sitemap-index.xml";
const ALIAS = "sitemap.xml";

export function sitemapAlias(): AstroIntegration {
  return {
    name: "comet:sitemap-alias",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const from = new URL(INDEX, dir);
        const to = new URL(ALIAS, dir);
        try {
          await copyFile(from, to);
        } catch (cause) {
          throw new Error(
            `Could not create \`${ALIAS}\` from \`${INDEX}\`. Is \`sitemap()\` still ` +
              `registered before \`sitemapAlias()\` in astro.config.mjs?`,
            { cause },
          );
        }
        logger.info(`\`${ALIAS}\` created (copy of \`${INDEX}\`)`);
      },
    },
  };
}
