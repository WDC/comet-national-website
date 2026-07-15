/**
 * Comet National — shared GSAP motion foundation.
 *
 * Every scroll-triggered and looping SVG animation on the site is built through
 * `scene()` so the whole suite reads as one hand: the same easings, the same
 * brass pulse rings, the same lane-draw and shipment-travel motifs established
 * by the hero freight network (see lib/networkCycle.ts).
 *
 * Design contract for anything built on top of this module:
 *   • Line/route draws use `prepDraw` + tween `strokeDashoffset` to 0 with
 *     EASE.draw. Stagger multiples by ~0.1s.
 *   • Markers / cargo blocks snap in with EASE.settle (a little overshoot).
 *   • Active nodes emit a two-ring brass pulse via `pulseRing` — identical
 *     signature to the hero hub so hubs feel like the same object everywhere.
 *   • Shipments travel at constant speed (EASE.linear): fade in, run the lane,
 *     fade out. Curved routes use `travelAlong` (MotionPathPlugin).
 *   • Reduced motion: never animate — paint a clean, legible end-state.
 *
 * All animation classes are driven from JS; components expose `data-*` hooks and
 * carry no CSS @keyframes, so there is a single source of timing truth.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

let registered = false;

/** Register plugins once, lazily, and hand back the shared gsap singleton. */
export function ensureGsap(): typeof gsap {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    registered = true;
  }
  return gsap;
}

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Shared easing vocabulary. Mirrors the CSS custom eases in tokens.css and the
 * hero timeline — use these names everywhere instead of raw strings so a change
 * to the house feel is a one-line edit.
 */
export const EASE = {
  out: 'power3.out', //     --ease-out: reveals, fades, slides
  settle: 'back.out(1.7)', // markers / cargo snapping into place (slight overshoot)
  draw: 'power2.out', //    stroke-dashoffset line + route draws
  inOut: 'power2.inOut', // looped shuttles, cross-fades
  linear: 'none', //        shipments running a lane at constant speed
} as const;

/** Shared durations, in seconds. */
export const DUR = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
  draw: 1.0,
  travel: 1.6,
} as const;

export interface SceneOpts {
  /** ScrollTrigger start position. Default 'top 80%'. */
  start?: string;
  /** Loop forever, gated to the viewport (pauses off-screen). Default false. */
  loop?: boolean;
  /** Delay between loop repeats, in seconds. */
  repeatDelay?: number;
  /**
   * Paint a static end-state under reduced motion instead of the built timeline.
   * Recommended for looping scenes (a snapped mid-loop frame reads as broken).
   * If omitted, the built timeline is snapped to progress 1.
   */
  reduced?: (g: typeof gsap) => void;
}

/**
 * Build a paused GSAP timeline for `root` and play it when it scrolls into view.
 * `build(tl, gsap)` populates the timeline. Everything is wrapped in a
 * `gsap.context` bound to `root` for safe teardown. Honors reduced motion.
 *
 * Returns the created timeline (or null under reduced motion with a custom
 * static painter) so callers can wire interactions (hover-to-pause, etc.).
 */
export function scene(
  root: Element,
  build: (tl: gsap.core.Timeline, g: typeof gsap) => void,
  opts: SceneOpts = {},
): gsap.core.Timeline | null {
  const g = ensureGsap();
  const reduce = reducedMotion();
  let timeline: gsap.core.Timeline | null = null;

  g.context(() => {
    if (reduce && opts.reduced) {
      opts.reduced(g);
      return;
    }

    const tl = g.timeline({
      paused: true,
      repeat: !reduce && opts.loop ? -1 : 0,
      repeatDelay: opts.repeatDelay ?? 0,
      defaults: { ease: EASE.out },
    });
    build(tl, g);
    timeline = tl;

    if (reduce) {
      tl.progress(1).pause();
      return;
    }

    ScrollTrigger.create({
      trigger: root,
      start: opts.start ?? 'top 80%',
      once: !opts.loop,
      onEnter: () => tl.play(),
      onLeave: opts.loop ? () => tl.pause() : undefined,
      onEnterBack: opts.loop ? () => tl.play() : undefined,
      onLeaveBack: opts.loop ? () => tl.pause() : undefined,
    });
  }, root);

  return timeline;
}

/**
 * Prepare an SVG line/path for a draw-on via stroke-dashoffset.
 * Returns the geometric length. `hidden` (default) starts it fully retracted;
 * tween `strokeDashoffset` to 0 to draw it in.
 */
export function prepDraw(el: SVGGeometryElement, hidden = true): number {
  const len = el.getTotalLength();
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: hidden ? len : 0 });
  return len;
}

/**
 * Emit the house two-ring brass pulse from a <circle> — the exact signature the
 * hero uses for an active hub, so every "live node" on the site pulses alike.
 */
export function pulseRing(
  tl: gsap.core.Timeline,
  el: SVGCircleElement,
  opts: { from?: number; to?: number; at?: gsap.Position; duration?: number } = {},
): gsap.core.Timeline {
  return tl.fromTo(
    el,
    { attr: { r: opts.from ?? 8 }, opacity: 0.85 },
    {
      attr: { r: opts.to ?? 28 },
      opacity: 0,
      duration: opts.duration ?? 1.5,
      ease: EASE.draw,
      repeat: 1,
    },
    opts.at,
  );
}

/**
 * Run an element along an SVG path at constant speed (MotionPathPlugin). Used
 * for curved delivery routes; straight lanes can just tween cx/cy.
 */
export function travelAlong(
  tl: gsap.core.Timeline,
  el: Element,
  path: string | SVGPathElement,
  opts: {
    duration?: number;
    at?: gsap.Position;
    autoRotate?: boolean;
    repeat?: number;
    start?: number;
    end?: number;
  } = {},
): gsap.core.Timeline {
  return tl.to(
    el,
    {
      duration: opts.duration ?? DUR.travel,
      ease: EASE.linear,
      repeat: opts.repeat ?? 0,
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5],
        autoRotate: opts.autoRotate ?? false,
        start: opts.start ?? 0,
        end: opts.end ?? 1,
      },
    },
    opts.at,
  );
}
