/**
 * Blog data helpers.
 *
 * One place to load, filter, sort, and decorate posts so the index page, the
 * post page, the RSS feed, and the OG endpoint all agree on what "the posts"
 * are (drafts hidden in production, newest first) and on derived fields like
 * the URL, the OG image, and the reading time.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "./site";

export type Post = CollectionEntry<"posts">;

/** Drafts are visible while developing, hidden in the built site. */
const includeDrafts = import.meta.env.DEV;

/** All publishable posts, newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", (p) => includeDrafts || !p.data.draft);
  return posts.sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
  );
}

/** Site-relative path for a post. */
export function postPath(post: Post): string {
  return `/blog/${post.id}`;
}

/** Absolute canonical URL for a post. */
export function postUrl(post: Post): string {
  return `${SITE.url}${postPath(post)}`;
}

/**
 * OG image for a post: an author-supplied `ogImage`/`heroImage` wins, otherwise
 * the generated card at /blog/<slug>/og.png.
 */
export function postOgImage(post: Post): string {
  const custom = post.data.ogImage;
  if (custom) return custom.startsWith("http") ? custom : `${SITE.url}${custom}`;
  const hero = post.data.heroImage;
  if (hero) return hero.src.startsWith("http") ? hero.src : `${SITE.url}${hero.src}`;
  return `${SITE.url}${postPath(post)}/og.png`;
}

const WORDS_PER_MINUTE = 220;

/** Whole-minute reading estimate from the raw markdown body. */
export function readingMinutes(post: Post): number {
  const words = (post.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "June 14, 2026" */
export function formatDate(d: Date): string {
  return DATE_FMT.format(d);
}

/** "2026-06-14" for <time datetime>. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "June 14, 2026 · 6 min read" — the line the OG card and post meta share. */
export function postMetaLine(post: Post): string {
  return `${formatDate(post.data.publishedDate)} · ${readingMinutes(post)} min read`;
}
