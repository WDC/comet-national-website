/**
 * Per-page Open Graph card registry.
 *
 * Single source of truth for the branded 1200×630 share images generated at
 * /og/<key>.png by src/pages/og/[key].png.ts and referenced as each page's
 * og:image in BaseHead. Headlines mirror the page H1s; service/industry cards
 * are derived from the taxonomy so a new mode gets a card for free.
 *
 * Blog posts have their own generator (src/pages/blog/[slug]/og.png.ts); this
 * covers the hand-built marketing pages, which otherwise all shared one image.
 */
import { SERVICES, INDUSTRIES, SERVICE_CATEGORY_LABEL } from "../services";

export interface OgPage {
  /** Slug used in the image URL: /og/<key>.png */
  key: string;
  /** Canonical site path this card represents (no trailing slash; "/" for home). */
  path: string;
  /** Card headline — mirrors the page H1. */
  title: string;
  /** Top-right kicker, upper-cased by the renderer. */
  eyebrow: string;
}

/** Shared bottom-left brand line (upper-cased by the renderer). */
export const OG_META = "Atlanta · every mode since 1995";

const STATIC_PAGES: OgPage[] = [
  { key: "home", path: "/", title: "We ship anything to anywhere.", eyebrow: "Atlanta · since 1995" },
  { key: "services", path: "/services", title: "Every mode. One team.", eyebrow: "Services" },
  { key: "industries", path: "/industries", title: "Built around how you buy freight.", eyebrow: "Industries" },
  { key: "why-comet", path: "/why-comet", title: "Not a marketplace. A team that answers.", eyebrow: "Why Comet" },
  { key: "contact", path: "/contact", title: "Pick up the phone or pick up the form.", eyebrow: "Contact" },
  { key: "get-a-quote", path: "/get-a-quote", title: "Get a quote.", eyebrow: "Quote" },
  { key: "carriers", path: "/carriers", title: "Run with a broker that picks up the phone.", eyebrow: "Carriers" },
  { key: "blog", path: "/blog", title: "Freight, plain-spoken.", eyebrow: "Blog" },
  { key: "locations-atlanta", path: "/locations/atlanta", title: "Our metro-Atlanta dock, just off I-85.", eyebrow: "Atlanta" },
  { key: "privacy", path: "/privacy", title: "Privacy Policy", eyebrow: "Legal" },
  { key: "terms", path: "/terms", title: "Terms of Use", eyebrow: "Legal" },
];

const SERVICE_PAGES: OgPage[] = SERVICES.map((s) => ({
  key: `services-${s.slug}`,
  path: `/services/${s.slug}`,
  title: `${s.title}.`,
  eyebrow: `Service · ${SERVICE_CATEGORY_LABEL[s.category]}`,
}));

const INDUSTRY_PAGES: OgPage[] = INDUSTRIES.map((i) => ({
  key: `industries-${i.slug}`,
  path: `/industries/${i.slug}`,
  title: `${i.title} freight.`,
  eyebrow: "Industry",
}));

export const OG_PAGES: OgPage[] = [...STATIC_PAGES, ...SERVICE_PAGES, ...INDUSTRY_PAGES];

const BY_PATH = new Map(OG_PAGES.map((p) => [p.path, p]));

/** Normalize a pathname to the registry's form ("/" for home, no trailing slash). */
function normalize(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** The OG page record for a pathname, if one exists. */
export function ogPageForPath(pathname: string): OgPage | undefined {
  return BY_PATH.get(normalize(pathname));
}

/** The site-relative og:image URL for a pathname, or undefined if none is generated. */
export function ogImageForPath(pathname: string): string | undefined {
  const page = ogPageForPath(pathname);
  return page ? `/og/${page.key}.png` : undefined;
}
