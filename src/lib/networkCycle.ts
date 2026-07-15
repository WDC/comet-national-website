/**
 * Freight-network cycling animation. Drives a shared SVG structure (a marker
 * group, a pool of lanes, a pool of shipment dots) through a tour of hub cities:
 * for each hub the marker settles + pulses, lanes draw outward, shipments run
 * the lanes, then everything retracts and the next city takes over. Loops
 * forever, returning to the first hub (Atlanta).
 *
 * The SVG must contain, inside `root`:
 *   [data-glow] [data-pulse] [data-core] [data-label]  — the active-hub marker
 *   [data-lane]  × N   — reusable lane <line>s   (N ≥ max dests per hub)
 *   [data-ship]  × N   — reusable shipment <circle>s
 *
 * Reduced motion: renders the first hub fully drawn, static, no travel.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface NetStop {
  hub: { label: string; x: number; y: number };
  dests: { x: number; y: number }[];
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface CycleOpts {
  /** viewBox width — used to decide which side the hub label sits on. */
  vbW: number;
  /** Optional ScrollTrigger vars to gate the start (e.g. Coverage below fold). */
  scrollTrigger?: ScrollTrigger.Vars;
}

export function runNetworkCycle(
  root: HTMLElement,
  tour: NetStop[],
  opts: CycleOpts,
): gsap.core.Timeline | void {
  const lanes = [...root.querySelectorAll<SVGLineElement>('[data-lane]')];
  const ships = [...root.querySelectorAll<SVGCircleElement>('[data-ship]')];
  const glow = root.querySelector<SVGCircleElement>('[data-glow]');
  const pulse = root.querySelector<SVGCircleElement>('[data-pulse]');
  const core = root.querySelector<SVGCircleElement>('[data-core]');
  const label = root.querySelector<SVGTextElement>('[data-label]');
  const W = opts.vbW;

  const moveMarker = (x: number, y: number) => {
    [glow, pulse, core].forEach((el) => {
      if (!el) return;
      el.setAttribute('cx', String(x));
      el.setAttribute('cy', String(y));
    });
  };

  const placeLabel = (x: number, y: number, text: string) => {
    if (!label) return;
    label.textContent = text;
    const right = x > W * 0.58;
    label.setAttribute('text-anchor', right ? 'end' : 'start');
    label.setAttribute('x', String(x + (right ? -16 : 16)));
    label.setAttribute('y', String(y + 5));
  };

  const configLanes = (hub: NetStop['hub'], dests: NetStop['dests']) => {
    lanes.forEach((ln, i) => {
      const d = dests[i];
      if (!d) {
        ln.style.opacity = '0';
        return;
      }
      ln.setAttribute('x1', String(hub.x));
      ln.setAttribute('y1', String(hub.y));
      ln.setAttribute('x2', String(d.x));
      ln.setAttribute('y2', String(d.y));
      const len = Math.hypot(d.x - hub.x, d.y - hub.y);
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      ln.style.opacity = '1';
    });
  };

  // Static end-state for reduced motion: first hub, lanes drawn, no motion.
  if (reduced()) {
    const s = tour[0];
    moveMarker(s.hub.x, s.hub.y);
    placeLabel(s.hub.x, s.hub.y, s.hub.label);
    configLanes(s.hub, s.dests);
    lanes.forEach((ln, i) => {
      if (s.dests[i]) ln.style.strokeDashoffset = '0';
    });
    ships.forEach((sp) => (sp.style.opacity = '0'));
    if (label) label.style.opacity = '1';
    return;
  }

  gsap.set(ships, { opacity: 0 });
  if (pulse) gsap.set(pulse, { opacity: 0 });
  if (glow) gsap.set(glow, { opacity: 0 });
  if (label) gsap.set(label, { opacity: 0 });
  if (core) gsap.set(core, { scale: 0, transformOrigin: 'center' });

  if (opts.scrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const master = gsap.timeline({
    repeat: -1,
    ...(opts.scrollTrigger ? { scrollTrigger: opts.scrollTrigger } : {}),
  });

  tour.forEach((stop) => {
    const { hub, dests } = stop;
    const n = dests.length;
    const aLanes = lanes.slice(0, n);
    const aShips = ships.slice(0, n);
    const seg = gsap.timeline();

    // Reconfigure the shared elements for this hub (fires on every loop).
    seg.call(() => {
      moveMarker(hub.x, hub.y);
      placeLabel(hub.x, hub.y, hub.label);
      configLanes(hub, dests);
      aShips.forEach((sp) => gsap.set(sp, { attr: { cx: hub.x, cy: hub.y }, opacity: 0 }));
    });

    // Marker settles in.
    seg.to(core, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    seg.to(glow, { opacity: 1, duration: 0.4 }, '<');
    seg.to(label, { opacity: 1, duration: 0.5 }, '<');

    // Lanes draw outward.
    seg.to(aLanes, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.out', stagger: 0.1 }, '-=0.15');
    seg.addLabel('dwell');

    // Two pulse rings from the hub.
    if (pulse) {
      seg.fromTo(
        pulse,
        { attr: { r: 8 }, opacity: 0.85 },
        { attr: { r: 28 }, opacity: 0, duration: 1.5, ease: 'power1.out', repeat: 1 },
        'dwell',
      );
    }

    // Shipments travel each lane.
    aShips.forEach((sp, i) => {
      const d = dests[i];
      seg
        .to(sp, { opacity: 1, duration: 0.2 }, `dwell+=${0.1 + i * 0.22}`)
        .to(sp, { attr: { cx: d.x, cy: d.y }, duration: 1.5, ease: 'none' }, '<')
        .to(sp, { opacity: 0, duration: 0.25 }, '>-0.25');
    });

    // Hold, then retract before handing off to the next hub.
    seg.to({}, { duration: 0.5 }, 'dwell+=2.2');
    seg.to(aLanes, { opacity: 0, duration: 0.5 });
    seg.to(core, { scale: 0, duration: 0.35 }, '<');
    seg.to([glow, label], { opacity: 0, duration: 0.4 }, '<');

    master.add(seg);
  });

  return master;
}
