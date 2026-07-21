/**
 * Primary-navigation taxonomy — the single source of truth for the enhanced
 * navbar. Each top-level section carries a "slab" of grouped sub-pages that
 * renders as a mega panel on wide viewports and as an expanding slab inside
 * the mobile drawer, so every viewport gets the same two-dimensional nav.
 *
 * Derived from the same data that powers the pages themselves
 * (src/lib/services.ts), so the nav can never drift from the site.
 */

import {
  SERVICES_BY_CATEGORY,
  SERVICE_CATEGORY_LABEL,
  INDUSTRIES,
  type ServiceCategory,
} from "@lib/services";
import { SITE } from "@lib/site";

export interface NavSubItem {
  title: string;
  href: string;
  /** One-line supporting copy shown under the title in the slab. */
  blurb?: string;
}

export interface NavGroup {
  label: string;
  items: NavSubItem[];
}

export interface NavCta {
  eyebrow: string;
  line: string;
  label: string;
  href: string;
}

export interface NavSection {
  /** Stable id used for element ids / aria wiring. */
  id: string;
  label: string;
  /** Section landing page. The trigger navigates here; also used for the "view all" link. */
  href: string;
  /** Label for the explicit landing-page link inside the slab. */
  overviewLabel: string;
  groups: NavGroup[];
  cta: NavCta;
}

/** A plain top-level nav entry with no mega-menu slab — just a link. */
export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export type NavItem = NavSection | NavLink;

export function isNavSection(item: NavItem): item is NavSection {
  return "groups" in item;
}

const serviceCategories: ServiceCategory[] = ["trailer", "facility", "managed"];

export const NAV_ITEMS: NavItem[] = [
  {
    id: "services",
    label: "Services",
    href: "/services",
    overviewLabel: "All services",
    groups: serviceCategories.map((c) => ({
      label: SERVICE_CATEGORY_LABEL[c],
      items: SERVICES_BY_CATEGORY[c].map((s) => ({
        title: s.title,
        href: `/services/${s.slug}`,
        blurb: s.blurb,
      })),
    })),
    cta: {
      eyebrow: "Need a partner?",
      line: "One call, every mode. We solve the whole problem.",
      label: "Get a Quote",
      href: "/get-a-quote",
    },
  },
  {
    id: "industries",
    label: "Industries",
    href: "/industries",
    overviewLabel: "All industries",
    groups: [
      {
        label: "Who we ship for",
        items: INDUSTRIES.map((i) => ({
          title: i.title,
          href: `/industries/${i.slug}`,
          blurb: i.blurb,
        })),
      },
    ],
    cta: {
      eyebrow: "Don't see yours?",
      line: `${SITE.tagline} Tell us the freight and we'll build the lane.`,
      label: "Get a Quote",
      href: "/get-a-quote",
    },
  },
  {
    id: "company",
    label: "Company",
    href: "/why-comet",
    overviewLabel: "Why Comet",
    groups: [
      {
        label: "Comet National",
        items: [
          {
            title: "Why Comet",
            href: "/why-comet",
            blurb: "One team, every mode out of Atlanta since 1995 — our mission and values.",
          },
          {
            title: "Atlanta Facility",
            href: "/locations/atlanta",
            blurb: "Our Lilburn dock and warehouse on the metro-Atlanta I-85 corridor.",
          },
          {
            title: "Carriers",
            href: "/carriers",
            blurb: "Haul for Comet — steady lanes, fair rates, dispatchers who answer.",
          },
          {
            title: "Contact",
            href: "/contact",
            blurb: "Reach sales and dispatch by phone, email, or the quote form.",
          },
        ],
      },
    ],
    cta: {
      eyebrow: "Talk to a person",
      line: "A dispatcher answers the phone — no phone tree, no ticket queue.",
      label: SITE.phone,
      href: `tel:${SITE.phoneE164}`,
    },
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
  },
];

/** Section is "active" when the current path sits on its landing page or any sub-page. */
export function isSectionActive(section: NavSection, pathname: string): boolean {
  const matches = (href: string) =>
    !href.startsWith("tel:") && (pathname === href || pathname.startsWith(`${href}/`));
  if (matches(section.href)) return true;
  return section.groups.some((g) => g.items.some((i) => matches(i.href)));
}
