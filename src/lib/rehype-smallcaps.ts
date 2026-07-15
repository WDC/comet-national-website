/**
 * rehype-smallcaps
 *
 * The rest of the site sets acronyms (LTL, FTL, RGN, POD, HVAC) as small caps
 * via the <Caps> component. Post bodies are plain Markdown, so there is no
 * component to reach for. This plugin does the same job at build time: it walks
 * the rendered HTML and wraps runs of two-or-more capitals in
 * <span class="sc">, which base.css renders with the font's true small caps.
 *
 * Mirrors lib/typography.ts#smallCapsAcronyms, but operates on the hast tree so
 * screen readers still read the real letters and the markup stays valid.
 * Dependency-free: a small manual walk instead of unist-util-visit.
 */

interface HastText {
  type: "text";
  value: string;
}
interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}
interface HastRoot {
  type: "root";
  children: HastNode[];
}
type HastNode = HastText | HastElement | HastRoot | { type: string; [k: string]: unknown };

/** Acronyms that read fine as full caps; small-capping them looks fussy. */
const SKIP = new Set<string>(["OK", "TV", "ID", "A", "I"]);

/** Never descend into these — code, math, and already-styled runs. */
const SKIP_TAGS = new Set<string>(["code", "pre", "kbd", "samp", "script", "style"]);

const ACRONYM = /\b([A-Z][A-Z0-9]*[A-Z])(s\b)?/g;

function hasClass(node: HastElement, name: string): boolean {
  const cn = node.properties?.className;
  if (Array.isArray(cn)) return cn.includes(name);
  if (typeof cn === "string") return cn.split(/\s+/).includes(name);
  return false;
}

/** Split one text node into text + <span class="sc"> nodes. Returns null when unchanged. */
function splitTextNode(value: string): HastNode[] | null {
  ACRONYM.lastIndex = 0;
  if (!ACRONYM.test(value)) return null;
  ACRONYM.lastIndex = 0;

  const out: HastNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = ACRONYM.exec(value)) !== null) {
    const full = m[0];
    const acro = m[1];
    const plural = m[2];
    if (!acro || SKIP.has(acro)) continue;
    if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
    out.push({
      type: "element",
      tagName: "span",
      properties: { className: ["sc"] },
      children: [{ type: "text", value: acro }],
    });
    if (plural) out.push({ type: "text", value: plural });
    last = m.index + full.length;
  }
  if (!out.length) return null;
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out;
}

function walk(node: HastNode): void {
  const el = node as HastElement;
  if (!Array.isArray(el.children)) return;
  if (el.type === "element" && (SKIP_TAGS.has(el.tagName) || hasClass(el, "sc"))) return;

  const next: HastNode[] = [];
  for (const child of el.children) {
    if (child.type === "text") {
      const replaced = splitTextNode((child as HastText).value);
      if (replaced) next.push(...replaced);
      else next.push(child);
    } else {
      walk(child);
      next.push(child);
    }
  }
  el.children = next;
}

export function rehypeSmallCaps() {
  return (tree: HastRoot): void => {
    walk(tree);
  };
}

export default rehypeSmallCaps;
