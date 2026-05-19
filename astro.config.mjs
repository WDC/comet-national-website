// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://cometnational.com";

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
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
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
