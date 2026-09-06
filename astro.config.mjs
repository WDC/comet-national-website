// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkSmartypants from "remark-smartypants";
import { rehypeSmallCaps } from "./src/lib/rehype-smallcaps";
import { sitemapAlias } from "./src/lib/sitemap-alias";
import { blogLastmod } from "./src/lib/sitemap-lastmod";

// Canonical host. Mirrors SITE.url in src/lib/site.ts — keep both in step
// (astro.config can't import the TS singleton at config-load time).
const SITE = "https://www.cometnational.com";

export default defineConfig({
  site: SITE,
  output: "server",
  trailingSlash: "never",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  markdown: {
    // Smart quotes, ellipses, and dashes for editorial-grade punctuation in
    // Markdown post bodies. "oldschool" maps -- to en dash and --- to em dash,
    // matching the hand-authored .astro copy (which uses real em dashes).
    remarkPlugins: [[/** @type {any} */ (remarkSmartypants), { dashes: "oldschool" }]],
    // Small-cap acronyms (LTL, FTL, RGN) the same way <Caps> does elsewhere.
    rehypePlugins: [/** @type {any} */ (rehypeSmallCaps)],
  },
  integrations: [
    mdx(),
    // No global lastmod: stamping every URL with the build time would signal
    // "everything changed" on each deploy. Blog posts carry a real lastmod
    // from their frontmatter dates (see src/lib/sitemap-lastmod.ts).
    sitemap({
      serialize: blogLastmod,
    }),
    // Serves the generated index at /sitemap.xml too — must stay after sitemap().
    sitemapAlias(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
    devImageService: "sharp",
  }),
  image: {
    domains: ["cdn.sanity.io"],
  },
  experimental: {
    contentIntellisense: true,
  },
});
