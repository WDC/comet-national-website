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
  /**
   * Buyer-facing FAQs. Rendered as a visible section on the service page and
   * emitted as FAQPage JSON-LD. Kept defensible (no unaudited specifics) and in
   * the brand voice. Phase 2 these move to Sanity.
   */
  faqs?: Array<{ q: string; a: string }>;
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
    faqs: [
      {
        q: "How is Flatbed LTL priced?",
        a: "By the linear feet your freight takes up on the deck — not by freight class or a full-trailer minimum. You pay for the space you use, with no phantom density charge or reclass surprise.",
      },
      {
        q: "When does Flatbed LTL beat a full flatbed?",
        a: "Roughly when your load runs 8–20 linear feet. Below a full trailer’s worth of deck, sharing the space with other partials splits the cost. Over that, a dedicated flatbed is usually the better rate.",
      },
      {
        q: "Can you load if we don’t have a forklift or dock?",
        a: "Yes — flag it on the quote. We match the trailer and equipment to the site, from driver-assist to crane- or forklift-loaded, and put it on the dispatch so the driver arrives ready.",
      },
      {
        q: "What if my load is oversized or over-height?",
        a: "Past legal flatbed dimensions we move it on open deck — step-deck, double-drop, or RGN — with permits and pilot cars arranged in-house. Send the dimensions and we’ll route it.",
      },
    ],
  },
  {
    slug: "dry-van-ltl",
    title: "Dry Van LTL",
    category: "trailer",
    blurb: "Enclosed less-than-truckload for palletized freight on dependable lanes.",
    schemaServiceType: "Dry Van LTL Freight",
    faqs: [
      {
        q: "What freight is a good fit for Dry Van LTL?",
        a: "Palletized, boxed, or crated goods that need to stay enclosed and dry and don’t fill a full trailer. If it rides on standard pallets and is weather-sensitive, dry van LTL is usually the call.",
      },
      {
        q: "Will my freight get reclassified after pickup?",
        a: "We quote off the real commodity and dimensions, so you don’t get a surprise reclass on the invoice. Give us accurate weight and dims up front and the number you’re quoted is the number you pay.",
      },
      {
        q: "Do you offer liftgate or limited-access delivery?",
        a: "Yes — liftgate, limited-access, and appointment deliveries are available as accessorials. Tell us at quote time so it’s priced in rather than tacked on later.",
      },
    ],
  },
  {
    slug: "volume-ltl",
    title: "Volume LTL",
    category: "trailer",
    blurb: "Partial truckload — when you outgrow LTL but don’t need a full trailer.",
    schemaServiceType: "Volume LTL / Partial Truckload Freight",
    faqs: [
      {
        q: "What counts as Volume LTL?",
        a: "Freight too big for standard LTL but short of a full truckload — usually about 6 to 12 pallets or 5,000-plus lbs. You get partial-truckload space without paying for a whole trailer.",
      },
      {
        q: "Is my freight reclassified by density?",
        a: "No. Volume LTL is priced on the space and weight you actually use, not on shifting class or density brackets — so there are no phantom accessorial charges.",
      },
      {
        q: "Do you cover the US and Canada?",
        a: "Yes. Volume LTL lanes run across the lower 48 and into southern Canada, dispatched from one Atlanta team.",
      },
    ],
  },
  {
    slug: "full-truckload",
    title: "Full Truckload",
    category: "trailer",
    blurb: "Dedicated dry van capacity for time-critical, full-trailer loads.",
    schemaServiceType: "Full Truckload Dry Van",
    faqs: [
      {
        q: "When should I book a full truckload instead of LTL?",
        a: "When you have enough freight to fill a trailer, when the freight is fragile and you’d rather it not be handled at a cross-dock, or when timing is tight — a dedicated trailer runs point to point with no terminal stops.",
      },
      {
        q: "How fast can a truckload deliver?",
        a: "It’s one trailer, one customer, one delivery, so transit is governed by drive time and hours-of-service rather than the LTL hub network. Give us the lane and we’ll quote honest transit, not optimistic transit.",
      },
      {
        q: "Do you run team drivers for urgent loads?",
        a: "For time-critical full-trailer freight we can arrange team or expedited capacity. Ask at quote time and we’ll price the option against a standard solo run.",
      },
    ],
  },
  {
    slug: "flatbed-open-deck",
    title: "Flatbed / Open Deck",
    category: "trailer",
    blurb: "Full flatbed, step-deck, double-drop, RGN — oversized and specialty.",
    schemaServiceType: "Open Deck / Flatbed Freight",
    faqs: [
      {
        q: "What trailers do you run for open-deck freight?",
        a: "Standard flatbed, step-deck, double-drop, and RGN — matched to the height and deck clearance your load needs. Send the dimensions and weight and we’ll spec the right deck.",
      },
      {
        q: "Do you handle permits and escorts for oversized loads?",
        a: "Yes. Permits, routing, and pilot/escort cars for over-dimensional freight are arranged in-house, so you’re not stitching together a patchwork of vendors.",
      },
      {
        q: "How is the load secured?",
        a: "Securement is matched to the commodity — chains, straps, coil racks, tarping — and the driver documents it. For high-value or damage-prone freight we can photograph the load in and out.",
      },
    ],
  },
  {
    slug: "refrigerated",
    title: "Refrigerated",
    category: "trailer",
    blurb: "Reefer and frozen, temperature-controlled coast to coast.",
    schemaServiceType: "Refrigerated Freight",
    faqs: [
      {
        q: "What temperature ranges do you carry?",
        a: "Multi-temp reefer from frozen through fresh and controlled-ambient. Give us the set point and any protect-from-freeze requirement and it’s noted on the dispatch.",
      },
      {
        q: "Do you provide temperature records?",
        a: "Yes — temperature is logged on every reefer load, so you have the data for QA or for a receiver who requires it.",
      },
      {
        q: "Can reefer freight move LTL, or only full trailers?",
        a: "Both. We handle full reefer trailers and can consolidate smaller temperature-controlled loads; tell us the volume and we’ll quote the cheaper structure.",
      },
    ],
  },
  {
    slug: "hotshot",
    title: "Hotshot",
    category: "trailer",
    blurb: "Expedited urgent freight when a load can’t wait.",
    schemaServiceType: "Hotshot / Expedited Freight",
    faqs: [
      {
        q: "How fast can a hotshot roll?",
        a: "Hotshot is dispatched 24/7 for time-critical freight, and a driver is often moving within about two hours of a confirmed load. Call for the fastest read on current capacity.",
      },
      {
        q: "What size loads suit hotshot?",
        a: "Smaller, urgent freight that fits a 1-, 2-, or 3-driver pickup-and-deliver run direct from origin to destination — no consolidation stops, no terminal dwell.",
      },
      {
        q: "Is hotshot the same as expedited truckload?",
        a: "They overlap. Hotshot usually runs on smaller trucks and gooseneck trailers for lighter loads; for heavier urgent freight we’ll quote expedited truckload instead. Tell us the weight and deadline and we’ll pick the right one.",
      },
    ],
  },
  {
    slug: "transloading",
    title: "Transloading",
    category: "facility",
    equityLine: "Container to van, flatbed to pup, or van to hotshot.",
    blurb: "Mode-change services at our Atlanta dock — fast, careful, documented.",
    animation: "TransloadFlow",
    schemaServiceType: "Transloading Services",
    faqs: [
      {
        q: "What is transloading?",
        a: "Moving freight from one mode or trailer to another mid-route — container to van, flatbed to pup, or van to hotshot — when the original equipment can’t finish the job. It happens at our Atlanta dock.",
      },
      {
        q: "How fast is the transfer?",
        a: "Transloads are handled at our Lilburn dock with 24/7 dispatch, so a mode change can happen in the same shift rather than sitting for days at a terminal.",
      },
      {
        q: "Do you handle the paperwork and re-securement?",
        a: "Yes — the freight is counted, re-secured for the new trailer, and documented, so the BOL and POD trail stays clean through the mode change.",
      },
    ],
  },
  {
    slug: "cross-docking",
    title: "Cross-Docking",
    category: "facility",
    blurb: "Consolidation and deconsolidation at our Lilburn facility.",
    animation: "CrossDockFlow",
    schemaServiceType: "Cross-Docking Services",
    faqs: [
      {
        q: "How is cross-docking different from warehousing?",
        a: "Cross-docking is pass-through: freight comes off an inbound trailer and goes onto an outbound one without long-term storage. Warehousing is for freight that needs to sit. We do both at the same Lilburn dock.",
      },
      {
        q: "Can you consolidate multiple inbound shipments?",
        a: "Yes — several inbound loads in, one consolidated outbound trailer out (or the reverse: one in, fanned out). It’s a common way to cut LTL cost to regional stops.",
      },
      {
        q: "Where is the dock?",
        a: "Our facility is on the metro-Atlanta I-85 corridor in Lilburn, GA — close to the interstate for fast inbound and outbound turns.",
      },
    ],
  },
  {
    slug: "distressed-load-recovery",
    title: "Distressed Load Recovery",
    category: "facility",
    equityLine: "When disaster strikes.",
    blurb: "Restack, rewrap, recover. The 911 call freight brokers don’t take.",
    animation: "DistressedRecovery",
    schemaServiceType: "Distressed Load Recovery",
    faqs: [
      {
        q: "What is distressed load recovery?",
        a: "When a load arrives damaged, shifted, refused, or stranded, we restack, rewrap, and recover it — the call other brokers pass on. Dispatched 24/7 from our Atlanta dock.",
      },
      {
        q: "How quickly can you respond?",
        a: "Distressed loads are handled with 24/7 dispatch and same-shift recovery at our Lilburn dock. Call the dispatch line and we’ll move on it.",
      },
      {
        q: "Can you document the condition for a claim?",
        a: "Yes — freight is counted and photographed as received and after recovery, so you have the record you need for a cargo claim or your own QA.",
      },
    ],
  },
  {
    slug: "warehousing-fulfillment",
    title: "Warehousing & Fulfillment",
    category: "facility",
    blurb: "Short and long-term storage with optional pick-and-pack.",
    schemaServiceType: "Warehousing and Fulfillment",
    faqs: [
      {
        q: "Do you offer short-term and long-term storage?",
        a: "Both — from overflow staging measured in days to long-term pallet storage. Release freight on your schedule, whether that’s a construction draw schedule or retail sell-through.",
      },
      {
        q: "Can you pick and pack orders?",
        a: "Yes — optional pick-and-pack fulfillment alongside storage, so inventory can ship in the quantities your customers actually order.",
      },
      {
        q: "What makes your warehousing different?",
        a: "It sits next to our own carrier capacity, so freight coming out of storage can go straight back on a truck from the same team — no separate carrier hand-off.",
      },
    ],
  },
  {
    slug: "freight-brokerage",
    title: "Freight Brokerage",
    category: "managed",
    blurb: "One call, every mode. We solve the whole problem.",
    schemaServiceType: "Freight Brokerage",
    faqs: [
      {
        q: "How is Comet different from a pure freight broker?",
        a: "We started as a carrier and still run our own equipment and dock, so brokerage here means one team that can actually move the freight — not just re-post it to a load board.",
      },
      {
        q: "What modes can you cover on one call?",
        a: "Flatbed, van, reefer, hotshot, and open deck across the US and Canada — plus transload, cross-dock, and warehousing at our own facility. One call, every mode.",
      },
      {
        q: "How do you vet the carriers you use?",
        a: "We use carriers that are FMCSA-current and carry cargo and liability coverage, and we confirm the coverage fits your commodity before the load rolls.",
      },
    ],
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

/**
 * Reverse lookup: which industries recombine a given service. Powers the
 * "Common industries" cross-links on each service page (industry pages already
 * link out to services; this closes the loop the other way).
 */
export function getIndustriesForService(slug: string): IndustryItem[] {
  return INDUSTRIES.filter((i) => i.serviceSlugs.includes(slug));
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
