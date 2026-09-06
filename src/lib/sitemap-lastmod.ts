/**
 * Per-URL `lastmod` for blog posts in the sitemap.
 *
 * `@astrojs/sitemap` runs at config time, outside the content layer, so this
 * reads what it needs straight from the post files: the date prefix in the
 * filename is the publish date, and an optional `updatedDate:` line in the
 * frontmatter supersedes it. Marketing pages get no lastmod on purpose — a
 * build-time stamp would tell crawlers the whole site changed on every deploy.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SitemapItem } from "@astrojs/sitemap";

const POSTS_DIR = resolve(process.cwd(), "src/content/posts");
const POST_URL = /\/blog\/((\d{4}-\d{2}-\d{2})-[^/]+)$/;

export function blogLastmod(item: SitemapItem): SitemapItem {
  const m = POST_URL.exec(item.url.replace(/\/+$/, ""));
  if (!m) return item;
  const [, slug, published] = m;
  let lastmod = published!;
  for (const ext of ["md", "mdx"]) {
    const file = resolve(POSTS_DIR, `${slug}.${ext}`);
    if (!existsSync(file)) continue;
    const updated = /^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(file, "utf8"));
    if (updated?.[1]) lastmod = updated[1];
    break;
  }
  return { ...item, lastmod };
}
