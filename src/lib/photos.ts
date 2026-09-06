/**
 * Photography registry — one source of truth for every photograph the site
 * renders, keyed by where it is used.
 *
 * Every image here is licensed stock from Unsplash (https://unsplash.com/license:
 * free for commercial use, no attribution required — credits kept anyway so the
 * provenance is auditable). They are placeholders for real fleet, dock, and load
 * photography: swap a file in `src/assets/photos/` and update `alt`/`credit`
 * here, and every page picks it up. Phase 2 this becomes a Sanity image field.
 *
 * Rendering goes through `<HeroPhoto>` (background layer behind hero copy) and
 * `<PhotoBand>` (full-bleed editorial band), both of which use `astro:assets`
 * so the Vercel image service serves responsive AVIF/WebP.
 */
import type { ImageMetadata } from "astro";

import homeBand from "../assets/photos/home-band.jpg";
import servicesHub from "../assets/photos/services-hub.jpg";
import industriesHub from "../assets/photos/industries-hub.jpg";
import flatbedLtl from "../assets/photos/flatbed-ltl.jpg";
import dryVanLtl from "../assets/photos/dry-van-ltl.jpg";
import volumeLtl from "../assets/photos/volume-ltl.jpg";
import fullTruckload from "../assets/photos/full-truckload.jpg";
import flatbedOpenDeck from "../assets/photos/flatbed-open-deck.jpg";
import refrigerated from "../assets/photos/refrigerated.jpg";
import hotshot from "../assets/photos/hotshot.jpg";
import transloading from "../assets/photos/transloading.jpg";
import crossDocking from "../assets/photos/cross-docking.jpg";
import distressedLoadRecovery from "../assets/photos/distressed-load-recovery.jpg";
import warehousingFulfillment from "../assets/photos/warehousing-fulfillment.jpg";
import freightBrokerage from "../assets/photos/freight-brokerage.jpg";
import construction from "../assets/photos/construction.jpg";
import manufacturingIndustrial from "../assets/photos/manufacturing-industrial.jpg";
import buildingMaterials from "../assets/photos/building-materials.jpg";
import machineryEquipment from "../assets/photos/machinery-equipment.jpg";
import whyComet from "../assets/photos/why-comet.jpg";
import contact from "../assets/photos/contact.jpg";
import locationsAtlanta from "../assets/photos/locations-atlanta.jpg";
import carriers from "../assets/photos/carriers.jpg";
import blog from "../assets/photos/blog.jpg";

export interface Photo {
  src: ImageMetadata;
  /** Descriptive alt for when the photo is content (PhotoBand). Backgrounds use "". */
  alt: string;
  /** Photographer · source, for the provenance record. */
  credit: string;
  /** Where the subject sits, so `object-position` keeps it out from under the copy. */
  focus?: "center" | "right" | "left" | "bottom";
}

const unsplash = (photographer: string) => `${photographer} · Unsplash`;

export const PHOTOS = {
  "home-band": {
    src: homeBand,
    alt: "A conventional semi tractor pulling a covered trailer down a wet two-lane highway under a clearing sky.",
    credit: unsplash("Zetong Li"),
    focus: "center",
  },
  "services-hub": {
    src: servicesHub,
    alt: "Aerial view of dozens of semi trailers parked in rows at a freight yard.",
    credit: unsplash("Nigel Tadyanehondo"),
    focus: "center",
  },
  "industries-hub": {
    src: industriesHub,
    alt: "Two workers in high-visibility vests unloading lumber from a truck at a construction site.",
    credit: unsplash("Indraadityan Logamurugan"),
    focus: "right",
  },
  "flatbed-ltl": {
    src: flatbedLtl,
    alt: "Fabricated steel structures chained down on the deck of a flatbed trailer.",
    credit: unsplash("Lucas"),
    focus: "right",
  },
  "dry-van-ltl": {
    src: dryVanLtl,
    alt: "A white dry van semi truck on an open highway at golden hour.",
    credit: unsplash("Isher Singh"),
    focus: "right",
  },
  "volume-ltl": {
    src: volumeLtl,
    alt: "A semi trailer backed to a covered dock being loaded with palletized bagged freight.",
    credit: unsplash("Zemos"),
    focus: "right",
  },
  "full-truckload": {
    src: fullTruckload,
    alt: "A dark semi truck and dry van trailer on a desert highway at dusk.",
    credit: unsplash("Sander Yigin"),
    focus: "right",
  },
  "flatbed-open-deck": {
    src: flatbedOpenDeck,
    alt: "A tracked excavator loaded on a lowboy open-deck trailer outside a steel building.",
    credit: unsplash("Roger Starnes Sr"),
    focus: "right",
  },
  refrigerated: {
    src: refrigerated,
    alt: "A semi truck and trailer running a snow-covered mountain highway.",
    credit: unsplash("Donna Elliot"),
    focus: "right",
  },
  hotshot: {
    src: hotshot,
    alt: "A semi truck bearing down a highway at dusk, headlights on, seen from a following car.",
    credit: unsplash("Josiah Farrow"),
    focus: "right",
  },
  transloading: {
    src: transloading,
    alt: "A truck parked in a container yard in front of stacked shipping containers.",
    credit: unsplash("Bernd Dittrich"),
    focus: "right",
  },
  "cross-docking": {
    src: crossDocking,
    alt: "Semi trailers backed into a row of loading-dock doors.",
    credit: unsplash("Tom Jackson"),
    focus: "center",
  },
  "distressed-load-recovery": {
    src: distressedLoadRecovery,
    alt: "Trucks moving through a highway tunnel at night under cold blue lights.",
    credit: unsplash("Jay Huang"),
    focus: "right",
  },
  "warehousing-fulfillment": {
    src: warehousingFulfillment,
    alt: "A forklift moving between tall racks of palletized goods inside a warehouse.",
    credit: unsplash("Bernd Dittrich"),
    focus: "right",
  },
  "freight-brokerage": {
    src: freightBrokerage,
    alt: "Aerial view of two semi trucks travelling a divided highway through farmland.",
    credit: unsplash("Bernd Dittrich"),
    focus: "center",
  },
  construction: {
    src: construction,
    alt: "A busy construction site crowded with cranes, trucks, and steel.",
    credit: unsplash("Tsuyoshi Kozu"),
    focus: "center",
  },
  "manufacturing-industrial": {
    src: manufacturingIndustrial,
    alt: "A forklift parked on the floor of an industrial warehouse.",
    credit: unsplash("Jhonatan Londono"),
    focus: "center",
  },
  "building-materials": {
    src: buildingMaterials,
    alt: "A flatbed loaded with banded dimensional lumber crossing a suspension bridge.",
    credit: unsplash("Riley Crawford"),
    focus: "center",
  },
  "machinery-equipment": {
    src: machineryEquipment,
    alt: "A heavy-haul tractor moving an oversized yellow mining truck on a multi-axle trailer.",
    credit: unsplash("snap wander"),
    focus: "right",
  },
  "why-comet": {
    src: whyComet,
    alt: "A worker in a high-visibility jacket and hard hat standing at the cab of a truck.",
    credit: unsplash("Mitchell Luo"),
    focus: "right",
  },
  contact: {
    src: contact,
    alt: "The side of a white freight trailer catching the last light of the day.",
    credit: unsplash("Caleb Ruiter"),
    focus: "right",
  },
  "locations-atlanta": {
    src: locationsAtlanta,
    alt: "A line of semi trailers parked at the edge of a freight yard.",
    credit: unsplash("Tom Jackson"),
    focus: "right",
  },
  carriers: {
    src: carriers,
    alt: "A classic long-nose semi tractor with a dry van trailer on a city street.",
    credit: unsplash("Bernd Dittrich"),
    focus: "right",
  },
  blog: {
    src: blog,
    alt: "Aerial view of a truck on a straight rural highway lined with wind turbines.",
    credit: unsplash("Sven Brandsma"),
    focus: "right",
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

/** Service slugs share their photo key; anything unmapped falls back to the hub image. */
export function photoForService(slug: string): PhotoKey {
  return slug in PHOTOS ? (slug as PhotoKey) : "services-hub";
}

/** Industry slugs share their photo key; anything unmapped falls back to the hub image. */
export function photoForIndustry(slug: string): PhotoKey {
  return slug in PHOTOS ? (slug as PhotoKey) : "industries-hub";
}
