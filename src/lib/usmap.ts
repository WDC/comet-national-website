/**
 * Shared continental-US geometry for the freight-network animations.
 *
 * The outline and every city are defined in real [lon, lat] and run through one
 * equirectangular projection (with a cosine correction at the US mid-latitude),
 * so lane endpoints always land on the right spot of the map. Callers pick a
 * viewBox + padding; `createProjection` fits the outline into it and returns a
 * `project(lon,lat)` plus a ready-to-render `usPath`.
 */

export type LonLat = [number, number];
export interface City {
  lonlat: LonLat;
  label: string;
}

/* US destination cities (the network nodes). */
export const CITIES: Record<string, City> = {
  atlanta: { lonlat: [-84.39, 33.75], label: 'Atlanta' },
  losAngeles: { lonlat: [-118.24, 34.05], label: 'Los Angeles' },
  seattle: { lonlat: [-122.33, 47.61], label: 'Seattle' },
  denver: { lonlat: [-104.99, 39.74], label: 'Denver' },
  houston: { lonlat: [-95.37, 29.76], label: 'Houston' },
  dallas: { lonlat: [-96.8, 32.78], label: 'Dallas' },
  chicago: { lonlat: [-87.63, 41.88], label: 'Chicago' },
  newYork: { lonlat: [-74.01, 40.71], label: 'New York' },
  miami: { lonlat: [-80.19, 25.76], label: 'Miami' },
  minneapolis: { lonlat: [-93.27, 44.98], label: 'Minneapolis' },
  phoenix: { lonlat: [-112.07, 33.45], label: 'Phoenix' },
  saltLake: { lonlat: [-111.89, 40.76], label: 'Salt Lake City' },
  nashville: { lonlat: [-86.78, 36.16], label: 'Nashville' },
  charlotte: { lonlat: [-80.84, 35.23], label: 'Charlotte' },
  kansasCity: { lonlat: [-94.58, 39.1], label: 'Kansas City' },
  detroit: { lonlat: [-83.05, 42.33], label: 'Detroit' },
};

/* Cross-border nodes (used by the Coverage map to show reach into Canada). */
export const CANADA: Record<string, City> = {
  toronto: { lonlat: [-79.38, 43.65], label: 'Toronto' },
  vancouver: { lonlat: [-123.12, 49.28], label: 'Vancouver' },
};

/**
 * Cycle of hub cities. Atlanta leads, five other majors take their turn, then it
 * loops back to Atlanta. Each `to` is a spread of destinations for that hub.
 */
export const TOUR: { hub: string; to: string[] }[] = [
  { hub: 'atlanta', to: ['newYork', 'chicago', 'dallas', 'miami', 'losAngeles'] },
  { hub: 'losAngeles', to: ['seattle', 'denver', 'dallas', 'chicago', 'atlanta'] },
  { hub: 'chicago', to: ['newYork', 'minneapolis', 'denver', 'atlanta', 'houston'] },
  { hub: 'dallas', to: ['houston', 'denver', 'atlanta', 'phoenix', 'chicago'] },
  { hub: 'newYork', to: ['chicago', 'atlanta', 'miami', 'charlotte', 'detroit'] },
  { hub: 'seattle', to: ['losAngeles', 'saltLake', 'denver', 'minneapolis', 'chicago'] },
];

/**
 * Continental-US outline, clockwise from the NW tip of Washington: down the
 * Pacific coast, across the southern border, around the Gulf and Florida, up the
 * Atlantic seaboard to Maine, then west along the northern border (Great Lakes +
 * Michigan mitten) back to the start. Detailed enough to read as a real map,
 * simplified enough to stay crisp at background opacity.
 */
export const US_OUTLINE: LonLat[] = [
  // Pacific coast (north → south)
  [-124.7, 48.4], [-124.1, 46.9], [-124.0, 46.2], [-124.2, 43.9], [-124.4, 42.4],
  [-124.1, 40.4], [-123.8, 39.3], [-122.9, 38.2], [-122.5, 37.8], [-121.9, 36.6],
  [-120.9, 35.4], [-120.5, 34.5], [-118.8, 34.0], [-117.3, 32.8],
  // Southern border (west → east)
  [-115.2, 32.7], [-114.7, 32.5], [-112.9, 31.9], [-111.1, 31.3], [-108.2, 31.3],
  [-108.2, 31.8], [-106.5, 31.8], [-105.0, 30.7], [-104.4, 29.5], [-103.0, 28.9],
  [-102.3, 29.8], [-101.4, 29.8], [-100.5, 28.9], [-99.4, 27.5], [-98.1, 26.1],
  [-97.4, 25.9],
  // Gulf coast + Florida
  [-97.1, 27.4], [-96.4, 28.4], [-95.3, 28.9], [-94.4, 29.5], [-93.5, 29.8],
  [-92.2, 29.5], [-91.0, 29.2], [-90.0, 29.1], [-89.2, 29.3], [-89.3, 30.0],
  [-88.8, 30.4], [-88.0, 30.4], [-87.2, 30.3], [-86.2, 30.4], [-85.4, 29.9],
  [-84.3, 30.0], [-83.6, 29.9], [-82.9, 29.1], [-82.7, 28.4], [-82.8, 27.7],
  [-82.1, 26.8], [-81.8, 26.3], [-81.2, 25.3], [-80.4, 25.2], [-80.3, 25.9],
  [-80.1, 26.8], [-80.2, 27.6], [-80.6, 28.4], [-81.0, 29.4], [-81.4, 30.7],
  // Atlantic seaboard (south → north)
  [-80.9, 32.0], [-79.2, 33.2], [-78.4, 33.9], [-77.7, 34.3], [-76.4, 34.6],
  [-75.5, 35.2], [-75.5, 36.1], [-76.0, 36.9], [-75.8, 37.9], [-75.1, 38.4],
  [-74.9, 38.9], [-74.3, 39.6], [-74.0, 40.5], [-73.7, 40.6], [-72.9, 41.1],
  [-71.9, 41.3], [-71.2, 41.5], [-70.6, 41.7], [-70.3, 42.6], [-70.8, 43.1],
  [-70.0, 43.7], [-69.1, 44.0], [-68.0, 44.3], [-67.0, 44.8],
  // Northern border (east → west): Maine, Great Lakes, Michigan, 49th parallel
  [-67.8, 45.7], [-69.2, 47.4], [-70.5, 45.9], [-71.5, 45.0], [-73.3, 45.0],
  [-74.7, 45.0], [-76.0, 44.2], [-76.8, 43.6], [-78.5, 43.4], [-79.2, 43.1],
  [-80.5, 42.3], [-82.0, 41.7], [-83.2, 41.9], [-82.9, 42.4], [-82.5, 43.0],
  [-83.3, 44.0], [-83.6, 43.7], [-83.9, 44.3], [-83.4, 45.0], [-84.7, 45.8],
  [-85.5, 46.0], [-86.5, 46.4], [-88.4, 46.8], [-90.4, 46.7], [-92.1, 46.8],
  [-92.3, 48.0], [-94.5, 48.7], [-95.2, 49.0], [-98.0, 49.0], [-104.0, 49.0],
  [-111.0, 49.0], [-117.0, 49.0], [-122.8, 49.0], [-123.1, 48.2],
];

/* Lake Michigan, drawn as an inner loop so the Michigan mitten reads correctly. */
export const LAKE_MICHIGAN: LonLat[] = [
  [-87.4, 41.8], [-86.3, 43.2], [-85.6, 44.8], [-85.9, 45.7],
  [-87.0, 45.2], [-87.8, 44.0], [-87.8, 42.6],
];

const LAT_MID = 39.5;
const K = Math.cos((LAT_MID * Math.PI) / 180);
const raw = (lon: number, lat: number) => ({ x: lon * K, y: -lat });

export interface Point {
  x: number;
  y: number;
}

export interface Projection {
  project: (lon: number, lat: number) => Point;
  /** Full US outline path (perimeter + Lake Michigan), ready for a <path d>. */
  usPath: string;
}

/** Fit the US outline into a viewBox with padding; returns a shared projector. */
export function createProjection(
  vbW: number,
  vbH: number,
  padX: number,
  padY: number,
): Projection {
  const rp = US_OUTLINE.map(([lo, la]) => raw(lo, la));
  const minX = Math.min(...rp.map((p) => p.x));
  const maxX = Math.max(...rp.map((p) => p.x));
  const minY = Math.min(...rp.map((p) => p.y));
  const maxY = Math.max(...rp.map((p) => p.y));
  const s = Math.min((vbW - 2 * padX) / (maxX - minX), (vbH - 2 * padY) / (maxY - minY));
  const offX = padX + ((vbW - 2 * padX) - s * (maxX - minX)) / 2;
  const offY = padY + ((vbH - 2 * padY) - s * (maxY - minY)) / 2;

  const project = (lon: number, lat: number): Point => {
    const p = raw(lon, lat);
    return {
      x: +(offX + (p.x - minX) * s).toFixed(1),
      y: +(offY + (p.y - minY) * s).toFixed(1),
    };
  };

  const toPath = (pts: LonLat[]): string =>
    pts
      .map(([lo, la], i) => {
        const { x, y } = project(lo, la);
        return `${i ? 'L' : 'M'}${x},${y}`;
      })
      .join(' ') + ' Z';

  return { project, usPath: `${toPath(US_OUTLINE)} ${toPath(LAKE_MICHIGAN)}` };
}
