/**
 * Service taxonomy. Phase 1 lives in code; Phase 2 this is replaced by a
 * Sanity GROQ query that returns the same shape.
 *
 * Categories drive the mega-menu groupings (PLAN.md §2):
 *   - trailer:  By trailer type
 *   - facility: By facility / dock-side service
 *   - managed:  Brokerage / managed
 */

export type ServiceCategory = "trailer" | "facility" | "managed";

export interface ServiceItem {
  slug: string;
  title: string;
  category: ServiceCategory;
  blurb: string;
  /** Optional inherited equity line from the legacy brand. */
  equityLine?: string;
  /** Animation slug from src/components/animations/. Optional. */
  animation?: string;
  /** `serviceType` value for JSON-LD Service schema. */
  schemaServiceType: string;
}

export const SERVICES: ServiceItem[] = [
  {
    slug: "flatbed-ltl",
    title: "Flatbed LTL",
    category: "trailer",
    equityLine: "You only pay for the space you use.",
    blurb: "Partial flatbed for pumps, big iron, generators, transformers, tanks, and raw materials.",
    animation: "FlatbedLTLViz",
    schemaServiceType: "Flatbed LTL Freight",
  },
  {
    slug: "dry-van-ltl",
    title: "Dry Van LTL",
    category: "trailer",
    blurb: "Enclosed less-than-truckload for palletized freight on dependable lanes.",
    schemaServiceType: "Dry Van LTL Freight",
  },
  {
    slug: "volume-ltl",
    title: "Volume LTL",
    category: "trailer",
    blurb: "Partial truckload — when you outgrow LTL but don’t need a full trailer.",
    schemaServiceType: "Volume LTL / Partial Truckload Freight",
  },
  {
    slug: "full-truckload",
    title: "Full Truckload",
    category: "trailer",
    blurb: "Dedicated dry van capacity for time-critical, full-trailer loads.",
    schemaServiceType: "Full Truckload Dry Van",
  },
  {
    slug: "flatbed-open-deck",
    title: "Flatbed / Open Deck",
    category: "trailer",
    blurb: "Full flatbed, step-deck, double-drop, RGN — oversized and specialty.",
    schemaServiceType: "Open Deck / Flatbed Freight",
  },
  {
    slug: "refrigerated",
    title: "Refrigerated",
    category: "trailer",
    blurb: "Reefer and frozen, temperature-controlled coast to coast.",
    schemaServiceType: "Refrigerated Freight",
  },
  {
    slug: "hotshot",
    title: "Hotshot",
    category: "trailer",
    blurb: "Expedited urgent freight when a load can’t wait.",
    schemaServiceType: "Hotshot / Expedited Freight",
  },
  {
    slug: "transloading",
    title: "Transloading",
    category: "facility",
    equityLine: "Container to van, flatbed to pup, or van to hotshot.",
    blurb: "Mode-change services at our Atlanta dock — fast, careful, documented.",
    animation: "TransloadFlow",
    schemaServiceType: "Transloading Services",
  },
  {
    slug: "cross-docking",
    title: "Cross-Docking",
    category: "facility",
    blurb: "Consolidation and deconsolidation at our Lilburn facility.",
    animation: "CrossDockFlow",
    schemaServiceType: "Cross-Docking Services",
  },
  {
    slug: "distressed-load-recovery",
    title: "Distressed Load Recovery",
    category: "facility",
    equityLine: "When disaster strikes.",
    blurb: "Restack, rewrap, recover. The 911 call freight brokers don’t take.",
    animation: "DistressedRecovery",
    schemaServiceType: "Distressed Load Recovery",
  },
  {
    slug: "warehousing-fulfillment",
    title: "Warehousing & Fulfillment",
    category: "facility",
    blurb: "Short and long-term storage with optional pick-and-pack.",
    schemaServiceType: "Warehousing and Fulfillment",
  },
  {
    slug: "freight-brokerage",
    title: "Freight Brokerage",
    category: "managed",
    blurb: "One call, every mode. We solve the whole problem.",
    schemaServiceType: "Freight Brokerage",
  },
];

export const SERVICES_BY_CATEGORY: Record<ServiceCategory, ServiceItem[]> = {
  trailer: SERVICES.filter((s) => s.category === "trailer"),
  facility: SERVICES.filter((s) => s.category === "facility"),
  managed: SERVICES.filter((s) => s.category === "managed"),
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  trailer: "By trailer",
  facility: "By facility",
  managed: "Managed",
};

export function getService(slug: string): ServiceItem | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export interface IndustryItem {
  slug: string;
  title: string;
  /** Short blurb for the home-page IndustriesBand. */
  blurb: string;
  /** Service slugs that recombine for this buyer. */
  serviceSlugs: string[];
  /** Optional inherited equity / positioning line. */
  equityLine?: string;
  /** One-paragraph hero lede used on the industry page. */
  heroLede?: string;
  /** Buyer descriptor — who reads this page. */
  buyer?: string;
  /** Cargo examples grid (mono tags). */
  cargoExamples?: string[];
  /** Pain → answer pairs for "What you call us for" grid. */
  challenges?: Array<{ challenge: string; answer: string }>;
  /** Animation slug — hero scene for the page hero-art slot. */
  animation?: string;
  /** Closing paragraph used as the "Why Comet for X" section. */
  whyComet?: string;
}

export const INDUSTRIES: IndustryItem[] = [
  {
    slug: "construction",
    title: "Construction",
    blurb: "Flatbed LTL, full flatbed, and jobsite delivery for builders.",
    serviceSlugs: ["flatbed-ltl", "flatbed-open-deck", "hotshot", "warehousing-fulfillment"],
    equityLine: "Built around the way GCs and superintendents actually order freight.",
    heroLede:
      "Steel by the bundle. Pre-cast on a Tuesday. A generator that has to be on-site before the inspection at 7 a.m. Construction freight breaks every assumption commodity LTL carriers make — so we built our flatbed and jobsite service around the way the schedule actually moves.",
    buyer: "General contractors · superintendents · jobsite logistics managers",
    cargoExamples: [
      "Structural steel",
      "Rebar bundles",
      "Pre-cast concrete",
      "Pipe & conduit",
      "Generators",
      "HVAC rooftop units",
      "Scaffolding",
      "Lumber & treated wood",
      "Roofing materials",
      "Site trailers",
      "Heavy tools",
      "Materials for inspection windows",
    ],
    challenges: [
      { challenge: "Jobsite access is tight", answer: "Flatbed with hand-unload, hotshot for back-lot drops, pup-trailer splits where a 53′ won’t fit." },
      { challenge: "Inspection or pour deadlines", answer: "Hotshot dispatch typically within 2 hours · direct origin-to-destination · no consolidation stops." },
      { challenge: "Material delivered too early", answer: "Lilburn warehouse staging · release to site on your draw schedule." },
      { challenge: "Oversize or over-height load", answer: "Step-deck, double-drop, RGN · permits and pilot routes handled in-house." },
      { challenge: "Partial flatbed cost trap", answer: "Flatbed LTL billed by linear feet · no phantom density or accessorial surprises." },
      { challenge: "POD friction with the office", answer: "Same-day digital POD · driver phone shared on every dispatch." },
    ],
    animation: "ConstructionRise",
    whyComet:
      "Construction logistics is a sequencing problem dressed up as a shipping problem. We’ve been the carrier behind the schedules of GCs across the southeast since 1995 — we know the difference between a permit you can route around and one you can’t, between a foreman who’ll hand-unload and one who won’t.",
  },
  {
    slug: "manufacturing-industrial",
    title: "Manufacturing & Industrial",
    blurb: "Volume LTL, FTL, warehousing, and cross-docking for plant logistics.",
    serviceSlugs: ["volume-ltl", "full-truckload", "warehousing-fulfillment", "cross-docking"],
    equityLine: "Plant logistics that respect the production schedule.",
    heroLede:
      "When the line stops, the freight stops paying for itself. We move the inbound parts, the outbound finished goods, and the in-process WIP that keeps the plant running — with the dock-side scheduling and clean paperwork that production planners actually need.",
    buyer: "Plant managers · production planners · supply chain leads",
    cargoExamples: [
      "Raw materials",
      "Stamped components",
      "Castings & forgings",
      "Sub-assemblies",
      "Production tooling",
      "MRO supplies",
      "Packaging stock",
      "Finished goods",
      "Pallets of WIP",
      "Drums & totes",
      "Returnable dunnage",
      "Spare-part kits",
    ],
    challenges: [
      { challenge: "Line-down emergency", answer: "Hotshot dispatch · 24/7 phone · driver often rolling within the hour." },
      { challenge: "JIT inbound windows", answer: "Scheduled-arrival LTL · dock-time confirmed before the truck rolls." },
      { challenge: "Multiple suppliers, one inbound trailer", answer: "Inbound consolidation at our Lilburn cross-dock." },
      { challenge: "Outbound to regional DCs", answer: "Pool distribution · one inbound load, fanned-out outbound LTL." },
      { challenge: "Inventory overflow at the plant", answer: "Short- and long-term pallet storage two miles off I-85." },
      { challenge: "Inbound QA hold", answer: "Inspection-hold staging · counted, photographed, released on your approval." },
    ],
    animation: "PlantFlow",
    whyComet:
      "Plant logistics rewards the carrier who picks up the phone and knows the part number. We’re an asset-based carrier with a brokerage arm and a warehouse — so the answer to ‘can you also do X’ is almost always yes, from the same dispatcher, on the same BOL.",
  },
  {
    slug: "building-materials",
    title: "Building Materials",
    blurb: "Flatbed, LTL consolidation, and storage for distributors.",
    serviceSlugs: ["flatbed-ltl", "dry-van-ltl", "volume-ltl", "warehousing-fulfillment"],
    equityLine: "Distribution freight that respects the dealer’s calendar.",
    heroLede:
      "A pallet of fasteners doesn’t move the same way a pre-hung door does. We carry building-materials freight the way distributors actually buy it — partial flatbed for the long stuff, dry van for the boxed, and warehouse staging for the seasonal swings.",
    buyer: "Building-materials distributors · branch managers · purchasing leads",
    cargoExamples: [
      "Pre-hung doors",
      "Windows & glazing",
      "Drywall & wallboard",
      "Insulation",
      "Plumbing fixtures",
      "Electrical supply",
      "Fasteners & hardware",
      "Adhesives & sealants",
      "Tile & stone",
      "Cabinetry",
      "Trim & moulding",
      "Roofing & siding",
    ],
    challenges: [
      { challenge: "Long product, partial load", answer: "Flatbed LTL · billed by linear feet · no phantom density charges." },
      { challenge: "Branch replenishment cycles", answer: "Scheduled weekly lanes · single-touchpoint dispatch out of Atlanta." },
      { challenge: "Pre-season buy, off-season storage", answer: "Short- and long-term warehousing · release on your sell-through." },
      { challenge: "Yard-to-yard rebalancing", answer: "Volume LTL or pool distribution between branches." },
      { challenge: "Damage claims on glazing & doors", answer: "Cargo-specific securement · photograph in / photograph out." },
      { challenge: "Special-order rush", answer: "Hotshot dispatch when a contractor walk-in becomes a same-day need." },
    ],
    animation: "MaterialsStack",
    whyComet:
      "Building-materials distribution is a relationship business — and so is freight. The same dispatcher learns your branches, your seasonal swings, and the products that always need extra care. That continuity is the difference between freight as overhead and freight as a competitive edge.",
  },
  {
    slug: "machinery-equipment",
    title: "Machinery & Equipment",
    blurb: "Open deck, oversized, and distressed load recovery.",
    serviceSlugs: ["flatbed-open-deck", "distressed-load-recovery", "hotshot", "transloading"],
    equityLine: "Heavy iron, handled by people who’ve been around heavy iron.",
    heroLede:
      "A piece of machinery in the wrong hands becomes a freight claim. We’ve moved presses, gensets, transformers, and yellow iron since long before the routing software existed — with the equipment, the securement, and the permitting know-how that protects the asset and the timeline.",
    buyer: "Equipment dealers · OEM logistics teams · industrial buyers",
    cargoExamples: [
      "Industrial pumps",
      "Generators",
      "Transformers",
      "Construction equipment",
      "Machine tools",
      "Compressors",
      "HVAC chillers",
      "Hydraulic presses",
      "Yellow iron",
      "Skid-mount packages",
      "Process tanks",
      "Conveyor lines",
    ],
    challenges: [
      { challenge: "Over-dimensional load", answer: "Step-deck, double-drop, RGN · permits and pilots routed in-house." },
      { challenge: "Load damaged in transit", answer: "Same-day distressed-load recovery · restack, rewrap, document." },
      { challenge: "Driver-load vs. roll-on", answer: "RGN drive-on, crane-loaded flatbed, or forklift drop — your dock or ours." },
      { challenge: "Port to inland delivery", answer: "Transload at our Lilburn dock · container to flatbed in the same shift." },
      { challenge: "Time-critical down-machine part", answer: "Hotshot dispatch · driver typically moving within 2 hours of confirmation." },
      { challenge: "Multi-piece project freight", answer: "Sequenced delivery with staging at our warehouse between drops." },
    ],
    animation: "HeavyHaul",
    whyComet:
      "Machinery freight has consequences. A misrouted permit costs days; a mis-set chain costs the asset. We’ve spent three decades earning the calls that other brokers pass on — because the carrier who’s done it before is the one who actually finishes the job.",
  },
];
