/**
 * JSON-LD builders.
 * Every builder returns a plain object that gets stringified into <script type="application/ld+json">.
 * Keeping these untyped (Record<string, unknown>) avoids dragging schema-dts as a dep;
 * we validate with Google's Rich Results Test in CI instead.
 */

import { SITE } from "./site";
import { SERVICES, INDUSTRIES } from "./services";

const orgId = `${SITE.url}/#org`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    foundingDate: String(SITE.foundingYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postal,
      addressCountry: SITE.address.country,
    },
    areaServed: [...SITE.areaServed],
    sameAs: SITE.socials.map((s) => s.url),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": orgId },
    // No Sitelinks Searchbox until an on-site /search endpoint ships (Phase 2).
    // Emitting a SearchAction that points at a 404 is invalid markup.
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/locations/atlanta#localbusiness`,
    name: `${SITE.legalName} — Atlanta`,
    url: `${SITE.url}/locations/atlanta`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    address: organizationSchema().address,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SITE.hours.days,
      opens: SITE.hours.open,
      closes: SITE.hours.close,
    },
    parentOrganization: { "@id": orgId },
  };
}

export interface ServiceSchemaInput {
  name: string;
  url: string;
  description: string;
  serviceType: string;
}

export function serviceSchema(s: ServiceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    url: s.url,
    description: s.description,
    serviceType: s.serviceType,
    provider: { "@id": orgId },
    areaServed: [...SITE.areaServed],
  };
}

export interface ItemListInput {
  name: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}

/**
 * ItemList for pages that present a curated set of links (e.g. an industry page
 * listing the services it recombines). Gives crawlers explicit structure where
 * a bare page would otherwise be the thinnest structured data on the site.
 */
export function itemListSchema(input: ItemListInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: input.url,
    itemListElement: input.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

export interface BreadcrumbInput {
  items: Array<{ name: string; url: string }>;
}

export function breadcrumbSchema(input: BreadcrumbInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: input.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface FaqInput {
  items: Array<{ q: string; a: string }>;
}

export function faqSchema(input: FaqInput) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: input.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export interface ArticleInput {
  title: string;
  url: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}

export function articleSchema(a: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    url: a.url,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: { "@type": "Person", name: a.authorName ?? "Comet National" },
    publisher: { "@id": orgId },
    ...(a.image ? { image: a.image } : {}),
  };
}

/**
 * Path → display-title map for breadcrumb JSON-LD, so structured data reads
 * "Flatbed LTL" / "Machinery & Equipment" (matching the visible crumbs and page
 * H1s) instead of the naive title-cased slug ("Flatbed Ltl" / "Machinery
 * Equipment"). Keyed by the accumulated path segment used in breadcrumbsFromPath.
 */
export function crumbTitles(): Record<string, string> {
  const map: Record<string, string> = {
    "/services": "Services",
    "/industries": "Industries",
    "/why-comet": "Why Comet",
    "/blog": "Blog",
    "/get-a-quote": "Get a Quote",
    "/contact": "Contact",
    "/carriers": "Carriers",
    "/privacy": "Privacy Policy",
    "/terms": "Terms of Use",
    "/locations": "Locations",
    "/locations/atlanta": "Atlanta",
  };
  for (const s of SERVICES) map[`/services/${s.slug}`] = s.title;
  for (const i of INDUSTRIES) map[`/industries/${i.slug}`] = i.title;
  return map;
}

export function breadcrumbsFromPath(pathname: string, titles: Record<string, string> = {}) {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbInput["items"] = [{ name: "Home", url: SITE.url }];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    items.push({
      name: titles[acc] ?? toTitle(p),
      url: `${SITE.url}${acc}`,
    });
  }
  return items;
}

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
