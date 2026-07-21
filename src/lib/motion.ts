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

/**
 * Marquee ticker. Wraps a [data-marquee] track's children in a .marquee__group,
 * appends an aria-hidden clone, and marks the marquee ready — two identical
 * groups let the CSS loop translateX(-50%) seamlessly (see flourish.css).
 * Duration scales with content width so every ticker moves at the same speed.
 */
export function enhanceMarquees(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-marquee]").forEach((m) => {
    const track = m.querySelector<HTMLElement>(".marquee__track");
    if (!track || m.classList.contains("is-ready")) return;
    const group = document.createElement("div");
    group.className = "marquee__group";
    while (track.firstChild) group.appendChild(track.firstChild);
    track.appendChild(group);
    const clone = group.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
    // ~80px/s regardless of how much content the ticker carries.
    const w = group.scrollWidth || 1200;
    m.style.setProperty("--marquee-duration", `${Math.max(18, Math.round(w / 80))}s`);
    m.classList.add("is-ready");
  });
}

/**
 * Pointer-follow tilt for [data-tilt] cards (fine pointers only). The optional
 * attribute value is the max tilt in degrees (default 3 — a nudge, not a flip).
 */
export function enhanceTilt(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;
  root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const max = Number.parseFloat(el.dataset.tilt || "") || 3;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tilt-y", `${(px * max).toFixed(2)}deg`);
      el.style.setProperty("--tilt-x", `${(-py * max).toFixed(2)}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    });
  });
}

/**
 * Scroll drift for [data-parallax] elements. The attribute value is the total
 * travel in px across the viewport (default 24; negative inverts direction).
 * rAF-throttled; the translate offset is small relative to the viewport, so
 * reading getBoundingClientRect on the transformed element converges fine.
 */
export function enhanceParallax(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
  if (!els.length) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const progress = (r.top + r.height / 2 - vh / 2) / vh; // ≈ -0.5 … 0.5
      const speed = Number.parseFloat(el.dataset.parallax || "") || 24;
      el.style.setProperty("--parallax-y", `${(-progress * speed).toFixed(1)}px`);
    }
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

/**
 * Reading progress hairline for long-form pages. Tracks how far the element
 * named by [data-reading-progress]'s `data-target` selector (default <main>)
 * has been scrolled through, as --progress ∈ [0,1].
 */
export function enhanceReadingProgress(root: ParentNode = document) {
  const bar = root.querySelector<HTMLElement>("[data-reading-progress]");
  if (!bar) return;
  const target = document.querySelector<HTMLElement>(bar.dataset.target || "main");
  if (!target) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = target.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    bar.style.setProperty("--progress", progress.toFixed(4));
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

export function bootMotion() {
  if (typeof window === "undefined") return;
  const run = () => {
    observeReveals();
    enhanceMarquees();
    enhanceTilt();
    enhanceParallax();
    enhanceReadingProgress();
  };
  // Defer until idle so it never blocks LCP. Wrap the call so requestIdleCallback
  // doesn't pass its IdleDeadline argument into observeReveals's `root` param
  // (which would make root.querySelectorAll throw and no reveal would ever fire).
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(run);
  } else {
    setTimeout(run, 1);
  }
}
