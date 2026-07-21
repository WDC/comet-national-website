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
  /** OG article metadata, emitted as `article:*` tags when ogType is "article". */
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  /** Display title for the final breadcrumb segment when the route isn't in the
   * static crumb-titles map (e.g. a blog post's real title instead of its slug). */
  breadcrumbTitle?: string;
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
    // noindex still follows: the 404 page's recovery links stay crawlable.
    robots: input.noindex ? "noindex,follow" : "index,follow,max-image-preview:large",
  };
}

function normalizePath(p: string): string {
  if (!p || p === "/") return "/";
  return p.replace(/\/+$/, "");
}
