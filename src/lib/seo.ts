import { SITE } from "./site";

/**
 * Page-level SEO props. `pathname` is auto-injected by BaseHead from Astro.url.
 */
export interface PageSeo {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
}

export interface SeoInput extends PageSeo {
  pathname: string;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType: "website" | "article";
  robots: string;
}

export function resolveSeo(input: SeoInput): ResolvedSeo {
  const path = normalizePath(input.pathname);
  const canonical = `${SITE.url}${path}`;
  const titleWithBrand = input.title.includes(SITE.name)
    ? input.title
    : `${input.title} | ${SITE.name}`;
  return {
    title: titleWithBrand,
    description: input.description,
    canonical,
    ogImage: input.ogImage
      ? input.ogImage.startsWith("http")
        ? input.ogImage
        : `${SITE.url}${input.ogImage}`
      : `${SITE.url}${SITE.defaultOgImage}`,
    ogType: input.ogType ?? "website",
    robots: input.noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large",
  };
}

function normalizePath(p: string): string {
  if (!p || p === "/") return "/";
  return p.replace(/\/+$/, "");
}
