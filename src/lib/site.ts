/**
 * Site-wide config singleton.
 * Authoritative NAP, brand strings, and shared values.
 * Phase 1 lives in code; Phase 2+ this becomes a Sanity `settings` document
 * and this file re-exports the typed query result.
 */

export const SITE = {
  url: "https://www.cometnational.com",
  name: "Comet National",
  legalName: "Comet National Shipping Company",
  tagline: "We ship anything to anywhere.",
  subline:
    "Flatbed LTL, dry van, reefer, full truckload, transloading, and warehousing — managed by one team out of Atlanta since 1995. You make one call. We solve the whole problem.",
  trustLine: "One Atlanta team. Every mode since 1995.",
  foundingYear: 1995,
  phone: "(800) 831-5376",
  phoneE164: "+18008315376",
  email: "sales@cometnational.com",
  address: {
    street: "4138 Arcadia Industrial Circle",
    locality: "Lilburn",
    region: "GA",
    postal: "30047",
    country: "US",
  },
  areaServed: ["US", "CA"] as const,
  hours: { open: "08:00", close: "17:00", days: ["Mo", "Tu", "We", "Th", "Fr"] },
  socials: [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/company/comet-national-shipping-corporation",
    },
  ],
  defaultOgImage: "/og-default.jpg",
} as const;

export type SiteConfig = typeof SITE;
