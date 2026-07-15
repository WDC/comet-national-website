/**
 * Presentation-layer typographic helpers.
 *
 * The character-level refinements (curly quotes, apostrophes, en/em dashes,
 * prime marks, non-breaking spaces) are baked directly into the source copy so
 * that titles, meta descriptions, and JSON-LD all carry correct punctuation.
 *
 * Small caps, by contrast, must NOT live in the data — a `<span>` would leak
 * into `<title>`, schema, and aria-labels. So acronym small-capping happens
 * here, at render time, and is only applied to visible text nodes via <Caps>.
 */

export const NBSP = " "; // non-breaking space
export const THINSP = " "; // thin space
export const NNBSP = " "; // narrow no-break space

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"]/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

/**
 * Acronyms we deliberately leave at full height even though they are 2+ caps:
 * roman numerals, single-letter grades, and directions read fine as caps and
 * small-capping them would look fussy. Extend as needed.
 */
const SMALLCAPS_SKIP = new Set<string>(["OK", "TV", "ID"]);

/**
 * Wrap runs of two-or-more capital letters (an acronym such as LTL, FTL, RGN,
 * HVAC, POD) in <span class="sc"> so the font renders them as small caps.
 *
 * - A trailing lowercase plural "s" (GMs, DCs) is kept OUTSIDE the small-cap
 *   span so only the acronym is affected.
 * - Input is treated as PLAIN TEXT and HTML-escaped first; the only markup in
 *   the result is the wrapping spans. Safe for use with set:html.
 */
export function smallCapsAcronyms(input: string): string {
  const escaped = escapeHtml(input);
  return escaped.replace(/\b([A-Z][A-Z0-9]*[A-Z])(s\b)?/g, (match, acro: string, plural: string | undefined) => {
    if (SMALLCAPS_SKIP.has(acro)) return match;
    return `<span class="sc">${acro}</span>${plural ?? ""}`;
  });
}
