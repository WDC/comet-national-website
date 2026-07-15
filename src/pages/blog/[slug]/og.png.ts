import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgCard } from "@lib/og/card";
import { postMetaLine, type Post } from "@lib/posts";

export const prerender = true;

export async function getStaticPaths() {
  const includeDrafts = import.meta.env.DEV;
  const posts = await getCollection("posts", (p) => includeDrafts || !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post };
  const png = await renderOgCard({
    title: post.data.title,
    eyebrow: post.data.category ?? "Blog",
    meta: postMetaLine(post),
  });
  const body = new Uint8Array(png);
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
