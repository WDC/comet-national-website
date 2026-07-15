/**
 * Lightweight reveal helper. Pure DOM + IntersectionObserver.
 *
 * observeReveals() toggles `.is-visible` on `[data-reveal]` elements when they
 * enter the viewport, composing with the `.reveal` / `.reveal-stagger` /
 * `.section-bar` CSS in styles/motion.css. This stays intentionally tiny and
 * dependency-free because it runs on every page for section fade-ups.
 *
 * The richer freight/cargo scene animations (hero network, coverage map, service
 * illustrations, stat count-up, …) are driven by GSAP through the shared
 * `scene()` foundation in lib/gsapMotion.ts — not by this module.
 *
 * Honors `prefers-reduced-motion` via CSS (see the catch-all in tokens.css).
 */

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

export function bootMotion() {
  if (typeof window === "undefined") return;
  // Defer until idle so it never blocks LCP. Wrap the call so requestIdleCallback
  // doesn't pass its IdleDeadline argument into observeReveals's `root` param
  // (which would make root.querySelectorAll throw and no reveal would ever fire).
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(() => observeReveals());
  } else {
    setTimeout(() => observeReveals(), 1);
  }
}
