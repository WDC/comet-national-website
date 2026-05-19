/**
 * Lightweight motion helpers. Pure DOM + IntersectionObserver.
 * No external animation library — every animation lives in CSS @keyframes.
 *
 * Two utilities, both global per-page (registered once by Header.astro):
 *   1. observeReveals() — toggles `.is-visible` on `[data-reveal]` elements
 *      when they enter the viewport. Composes with `.reveal` CSS.
 *   2. observeAnimOn() — toggles `.anim-on` on `[data-anim]` elements when
 *      they enter, plus `data-count` count-ups on numerics inside.
 *
 * Both honor `prefers-reduced-motion` (CSS handles the no-op; JS skips the count-up).
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function observeReveals(root: ParentNode = document) {
  const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );
  items.forEach((el) => io.observe(el));
}

export function observeAnimOn(root: ParentNode = document) {
  const items = root.querySelectorAll<HTMLElement>("[data-anim]");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("anim-on");
          runCountUps(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
  );
  items.forEach((el) => io.observe(el));
}

function runCountUps(scope: HTMLElement) {
  const reduce = prefersReducedMotion();
  const nodes = scope.querySelectorAll<HTMLElement>("[data-count]");
  nodes.forEach((node) => {
    const end = Number(node.dataset.count);
    if (!Number.isFinite(end)) return;
    if (reduce) {
      node.textContent = formatNumber(end, node.dataset.format);
      return;
    }
    const start = 0;
    const duration = 1500;
    const t0 = performance.now();
    const fmt = node.dataset.format;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const value = Math.round(start + (end - start) * eased);
      node.textContent = formatNumber(value, fmt);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function formatNumber(value: number, format?: string): string {
  if (format === "plus") return `${value.toLocaleString("en-US")}+`;
  if (format === "k") return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString("en-US");
}

export function bootMotion() {
  if (typeof window === "undefined") return;
  // Defer until idle so it never blocks LCP
  const start = () => {
    observeReveals();
    observeAnimOn();
  };
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(start);
  } else {
    setTimeout(start, 1);
  }
}
