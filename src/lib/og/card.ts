/**
 * Open Graph card generator.
 *
 * Renders a 1200x630 social-share image for a blog post entirely in code:
 * Satori lays out the card and rasterizes the MB Type faces to vector paths,
 * then sharp flattens that SVG to a PNG. No headless browser, no runtime font
 * I/O (the two faces are embedded in fonts.data.ts), so it runs the same in a
 * local build and in a Vercel serverless function.
 *
 * Palette is pulled straight from the design tokens (tokens.css) so a card
 * always matches the site chrome.
 */
import satori from "satori";
import sharp from "sharp";
import { CONCOURSE_BLACK, TRIPLICATE_REGULAR } from "./fonts.data";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Mirror of the relevant tokens.css custom properties.
const C = {
  bg: "#f7f6ee",
  pine: "#2f462b",
  ink: "#161d12",
  inkMuted: "#4e5a48",
  accent: "#c29237",
  accentDeep: "#8a6a1f",
};

export interface OgCardInput {
  /** Post title — the headline of the card. */
  title: string;
  /** Small mono kicker, upper-cased by the renderer (e.g. a category). */
  eyebrow?: string;
  /** Bottom-left mono line, e.g. "June 14, 2026 · 6 min read". */
  meta?: string;
  /** Bottom-right mono line. Defaults to the site domain. */
  footer?: string;
}

/** Satori accepts a plain element tree; this avoids needing a JSX runtime. */
type El = { type: string; props: Record<string, unknown> };
const div = (style: Record<string, unknown>, children?: unknown): El => ({
  type: "div",
  props: children === undefined ? { style } : { style, children },
});

/**
 * Size the headline to the amount of text so a short title reads large and a
 * long one still fits inside the card without clipping.
 */
function headlineSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 78;
  if (len <= 60) return 68;
  if (len <= 85) return 60;
  return 52;
}

function buildTree(input: OgCardInput): El {
  const { title, eyebrow = "Blog", meta, footer = "cometnational.com" } = input;
  const monoRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Triplicate",
    fontSize: 22,
    letterSpacing: 3,
    color: C.inkMuted,
  } as const;

  return div(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px",
      backgroundColor: C.bg,
      fontFamily: "Concourse",
      position: "relative",
    },
    [
      // Brass rule across the very top.
      div({
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: C.accent,
      }),
      // Brand lockup + section eyebrow.
      div(monoRow, [
        div({ display: "flex", alignItems: "center" }, [
          div({ width: 26, height: 26, backgroundColor: C.pine, marginRight: 14 }),
          div({ display: "flex" }, "COMET NATIONAL"),
        ]),
        div({ display: "flex", color: C.accentDeep }, eyebrow.toUpperCase()),
      ]),
      // Headline.
      div({
        display: "flex",
        fontSize: headlineSize(title),
        lineHeight: 1.03,
        color: C.ink,
        fontWeight: 800,
        letterSpacing: -1.5,
        maxWidth: 1010,
      }, title),
      // Meta row: date/reading time upper-cased like a mono label; the domain
      // stays lowercase so it reads as a URL.
      div(monoRow, [
        div({ display: "flex" }, (meta ?? "").toUpperCase()),
        div({ display: "flex", color: C.accentDeep }, footer),
      ]),
    ],
  );
}

/** Render a post OG card to a PNG buffer. */
export async function renderOgCard(input: OgCardInput): Promise<Buffer> {
  const svg = await satori(buildTree(input) as unknown as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: "Concourse", data: CONCOURSE_BLACK, weight: 800, style: "normal" },
      { name: "Triplicate", data: TRIPLICATE_REGULAR, weight: 400, style: "normal" },
    ],
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
