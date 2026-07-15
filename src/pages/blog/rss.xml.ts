import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE } from "@lib/site";
import { getPublishedPosts, postPath } from "@lib/posts";

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  return rss({
    title: `${SITE.name} — Blog`,
    description:
      "Freight, plain-spoken. Flatbed and open-deck, LTL accessorials, transloading, and moving the loads other carriers bounce.",
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      link: postPath(post),
      pubDate: post.data.publishedDate,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
};
