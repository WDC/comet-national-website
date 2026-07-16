import type { APIRoute } from "astro";
import { renderOgCard } from "@lib/og/card";
import { OG_PAGES, OG_META, type OgPage } from "@lib/og/pages";

export const prerender = true;

export async function getStaticPaths() {
  return OG_PAGES.map((page) => ({ params: { key: page.key }, props: { page } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { page } = props as { page: OgPage };
  const png = await renderOgCard({
    title: page.title,
    eyebrow: page.eyebrow,
    meta: OG_META,
  });
  const body = new Uint8Array(png);
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
