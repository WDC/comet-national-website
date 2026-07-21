/**
 * Comet National — transactional email templates.
 *
 * Hand-written, table-based HTML tuned for maximum client compatibility
 * (Gmail, Apple Mail, Outlook Windows/Mac, iOS, Yahoo, Outlook.com). Rules
 * followed throughout:
 *   - Layout is nested <table role="presentation"> — no flex/grid, no floats.
 *   - Every style is inline; no external/`<style>`-only dependencies for layout.
 *   - Fixed 600px card, centered, with an MSO ghost table for Outlook.
 *   - Web-safe font stacks only (Georgia mirrors the site's Equity serif;
 *     Arial/Helvetica stands in for the Concourse display face).
 *   - A hidden preheader supplies the inbox preview summary.
 *   - Colors mirror src/styles/tokens.css (the heritage freight palette).
 */

import { SITE } from "@lib/site";

export type QuoteEmailInput = {
  company: string;
  name: string;
  phone: string;
  email: string;
  freightType: string;
  readyDate?: string;
  origin: string;
  destination: string;
  dimensions?: string;
  weight?: string;
  description?: string;
};

/* --- Brand palette (mirrors tokens.css) ------------------------------------ */
const C = {
  pine: "#2f462b",
  pineDeep: "#22331f",
  moss: "#46543f",
  ink: "#161d12",
  inkMuted: "#4e5a48",
  inkSoft: "#6e7867",
  line: "#d6d8cc",
  lineSoft: "#e6e7dc",
  bg: "#f7f6ee",
  bgFrame: "#e7e6db",
  bgElevated: "#fffefa",
  accent: "#c29237",
  accentDeep: "#8a6a1f",
  accentInk: "#201607",
} as const;

const LOGO_URL = "https://i.imgur.com/nAQ5Cu5.png";

const FONT_BODY =
  "Georgia, 'Times New Roman', Times, serif";
const FONT_UI =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif";

/**
 * Build an RFC 5322 `From` header value that always carries a display name, so
 * the sender never appears to recipients as a naked address.
 *
 * `envValue` (typically `QUOTE_FROM_EMAIL`) may be either a bare address
 * (`quotes@cometnational.com`) or an already-formatted pair
 * (`Comet National <quotes@cometnational.com>`). When it already includes a
 * display name, that name wins; otherwise `fallbackName` is applied. The
 * address falls back to `quotes@cometnational.com` if none can be parsed.
 */
export function formatSender(
  envValue: string | undefined,
  fallbackName: string,
): string {
  const raw = String(envValue ?? "").trim();
  const paired = raw.match(/^(.*)<\s*([^<>]+?)\s*>\s*$/);
  if (paired) {
    const [, namePart = "", addrPart = ""] = paired;
    const embeddedName = namePart.trim().replace(/^"(.*)"$/, "$1").trim();
    const address = addrPart.trim();
    return `${quoteDisplayName(embeddedName || fallbackName)} <${address}>`;
  }
  const address = raw || "quotes@cometnational.com";
  return `${quoteDisplayName(fallbackName)} <${address}>`;
}

/** Quote/escape a display name when it contains RFC 5322 special characters. */
function quoteDisplayName(name: string): string {
  if (!/[()<>[\]:;@\\,."]/.test(name)) return name;
  return `"${name.replace(/(["\\])/g, "\\$1")}"`;
}

/** HTML-escape untrusted user input before interpolating into markup. */
function esc(value: string | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A hidden preheader: sets the inbox preview line, then padded so no body
 *  copy leaks into the preview. */
function preheader(text: string): string {
  const filler = "&#847;&zwnj;&nbsp;".repeat(60);
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bgFrame};opacity:0;">${esc(
    text,
  )}${filler}</div>`;
}

/** Document shell + centered 600px card. `inner` is the card's inner rows. */
function shell(opts: {
  title: string;
  preheaderText: string;
  inner: string;
}): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${esc(opts.title)}</title>
<!--[if mso]>
<style type="text/css">
  body,table,td,a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  table { border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:none; }
  @media only screen and (max-width:620px) {
    .cn-card { width:100% !important; }
    .cn-pad { padding-left:24px !important; padding-right:24px !important; }
    .cn-stack { display:block !important; width:100% !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.bgFrame};">
${preheader(opts.preheaderText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bgFrame};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" class="cn-card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${C.bgElevated};border:1px solid ${C.line};border-radius:6px;overflow:hidden;">
${opts.inner}
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Cream header band with the logo badge + wordmark. */
function header(): string {
  return `        <tr>
          <td align="center" style="background-color:${C.bg};padding:34px 24px 26px 24px;border-bottom:1px solid ${C.lineSoft};">
            <img src="${LOGO_URL}" width="112" height="112" alt="Comet National" style="display:block;width:112px;height:112px;margin:0 auto 14px auto;" />
            <div style="font-family:${FONT_UI};font-size:22px;line-height:1;font-weight:700;letter-spacing:0.14em;color:${C.pine};text-transform:uppercase;">${esc(
              SITE.name,
            )}</div>
            <div style="font-family:${FONT_BODY};font-size:13px;line-height:1.4;font-style:italic;color:${C.inkSoft};padding-top:8px;">${esc(
              SITE.tagline,
            )} &#183; Atlanta, since ${SITE.foundingYear}</div>
          </td>
        </tr>`;
}

/** Pine title band beneath the header. */
function titleBand(kicker: string, title: string): string {
  return `        <tr>
          <td style="background-color:${C.pine};padding:20px 32px;" class="cn-pad">
            <div style="font-family:${FONT_UI};font-size:11px;line-height:1;font-weight:700;letter-spacing:0.18em;color:${C.accent};text-transform:uppercase;">${esc(
              kicker,
            )}</div>
            <div style="font-family:${FONT_UI};font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;padding-top:8px;">${esc(
              title,
            )}</div>
          </td>
        </tr>`;
}

/** Pine footer with NAP. */
function footer(): string {
  const a = SITE.address;
  return `        <tr>
          <td style="background-color:${C.pineDeep};padding:28px 32px;" class="cn-pad">
            <div style="font-family:${FONT_UI};font-size:13px;line-height:1.5;font-weight:700;letter-spacing:0.04em;color:#ffffff;">${esc(
              SITE.legalName,
            )}</div>
            <div style="font-family:${FONT_BODY};font-size:13px;line-height:1.7;color:#c7cbbf;padding-top:6px;">
              ${esc(a.street)}, ${esc(a.locality)}, ${esc(a.region)} ${esc(a.postal)}<br />
              <a href="tel:${esc(SITE.phoneE164)}" style="color:${C.accent};text-decoration:none;font-weight:700;">${esc(
                SITE.phone,
              )}</a>
              &#160;&#183;&#160;
              <a href="mailto:${esc(SITE.email)}" style="color:${C.accent};text-decoration:none;">${esc(
                SITE.email,
              )}</a>
            </div>
            <div style="font-family:${FONT_UI};font-size:11px;line-height:1.6;letter-spacing:0.04em;color:#8a9584;padding-top:16px;">Flatbed &#183; LTL &#183; Dry Van &#183; Reefer &#183; Truckload &#183; Transloading &#183; Warehousing</div>
          </td>
        </tr>`;
}

/** Bulletproof (Outlook-safe) call/CTA button. */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:4px;background-color:${C.accent};">
        <a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-family:${FONT_UI};font-size:15px;font-weight:700;letter-spacing:0.03em;color:${C.accentInk};text-decoration:none;border-radius:4px;">${esc(
          label,
        )}</a>
      </td>
    </tr>
  </table>`;
}

/** A label/value data row for the internal template. */
function dataRow(label: string, value: string, opts?: { last?: boolean }): string {
  const border = opts?.last ? "" : `border-bottom:1px solid ${C.lineSoft};`;
  return `<tr>
    <td class="cn-stack" width="150" valign="top" style="width:150px;padding:11px 0;${border}font-family:${FONT_UI};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.inkSoft};">${esc(
      label,
    )}</td>
    <td class="cn-stack" valign="top" style="padding:11px 0;${border}font-family:${FONT_BODY};font-size:15px;line-height:1.5;color:${C.ink};">${esc(
      value || "—",
    )}</td>
  </tr>`;
}

function sectionLabel(text: string): string {
  return `<tr><td colspan="2" style="padding:22px 0 4px 0;font-family:${FONT_UI};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.accentDeep};">${esc(
    text,
  )}</td></tr>`;
}

/* --- Internal dispatcher notification -------------------------------------- */

export function renderInternalQuoteEmail(input: QuoteEmailInput): string {
  const route = `${input.origin} → ${input.destination}`;
  const inner = `${header()}
${titleBand("New Quote Request", route)}
        <tr>
          <td class="cn-pad" style="padding:24px 32px 8px 32px;">
            <div style="font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.inkMuted};">A new quote request came in from cometnational.com. Reply directly to this email to reach <strong style="color:${C.ink};">${esc(
              input.name,
            )}</strong>.</div>
          </td>
        </tr>
        <tr>
          <td class="cn-pad" style="padding:4px 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${sectionLabel("Contact")}
              ${dataRow("Company", input.company)}
              ${dataRow("Name", input.name)}
              ${dataRow("Phone", input.phone)}
              ${dataRow("Email", input.email, { last: true })}
              ${sectionLabel("Freight")}
              ${dataRow("Type", input.freightType)}
              ${dataRow("Ready date", input.readyDate || "—")}
              ${dataRow("Origin", input.origin)}
              ${dataRow("Destination", input.destination)}
              ${dataRow("Dimensions", input.dimensions || "—")}
              ${dataRow("Weight", input.weight || "—", { last: true })}
              ${sectionLabel("Description")}
              <tr><td colspan="2" style="padding:8px 0 4px 0;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${esc(
                input.description || "(none provided)",
              )}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="cn-pad" align="center" style="padding:20px 32px 28px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="padding:0 6px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td align="center" style="border-radius:4px;background-color:${C.pine};">
                      <a href="mailto:${esc(
                        input.email,
                      )}" style="display:inline-block;padding:13px 26px;font-family:${FONT_UI};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:4px;">Reply to ${esc(
                        input.name.split(" ")[0] || "lead",
                      )}</a>
                    </td>
                  </tr></table>
                </td>
                <td align="center" style="padding:0 6px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td align="center" style="border-radius:4px;border:1px solid ${C.line};background-color:${C.bg};">
                      <a href="tel:${esc(
                        input.phone.replace(/[^0-9+]/g, ""),
                      )}" style="display:inline-block;padding:12px 26px;font-family:${FONT_UI};font-size:14px;font-weight:700;color:${C.pine};text-decoration:none;border-radius:4px;">Call ${esc(
                        input.phone,
                      )}</a>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
${footer()}`;

  return shell({
    title: `New quote — ${input.company}`,
    preheaderText: `${input.company} · ${input.freightType} · ${route} · ${input.name} ${input.phone}`,
    inner,
  });
}

/* --- Lead confirmation ----------------------------------------------------- */

export function renderLeadConfirmationEmail(input: QuoteEmailInput): string {
  const firstName = input.name.split(" ")[0] || "there";
  const route = `${input.origin} → ${input.destination}`;
  const inner = `${header()}
${titleBand("Request Received", "We’re on it.")}
        <tr>
          <td class="cn-pad" style="padding:28px 32px 4px 32px;">
            <div style="font-family:${FONT_BODY};font-size:17px;line-height:1.65;color:${C.ink};">Hi ${esc(
              firstName,
            )},</div>
            <div style="font-family:${FONT_BODY};font-size:16px;line-height:1.7;color:${C.inkMuted};padding-top:12px;">Thanks for reaching out. We&#8217;ve got your quote request and a dispatcher will typically follow up <strong style="color:${C.ink};">within one business hour</strong>. One team, every mode &mdash; we&#8217;ll solve the whole problem.</div>
          </td>
        </tr>
        <tr>
          <td class="cn-pad" style="padding:20px 32px 4px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};border:1px solid ${C.lineSoft};border-radius:6px;">
              <tr><td style="padding:18px 22px;">
                <div style="font-family:${FONT_UI};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.accentDeep};padding-bottom:10px;">Your request</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${dataRow("Freight", input.freightType)}
                  ${dataRow("Route", route)}
                  ${dataRow("Ready date", input.readyDate || "As soon as possible", { last: true })}
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="cn-pad" align="center" style="padding:24px 32px 8px 32px;">
            <div style="font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.inkMuted};padding-bottom:16px;">Need it moving now? Call us &mdash; that&#8217;s the fastest path.</div>
            ${button(`Call ${SITE.phone}`, `tel:${SITE.phoneE164}`)}
          </td>
        </tr>
        <tr>
          <td class="cn-pad" style="padding:20px 32px 28px 32px;">
            <div style="font-family:${FONT_BODY};font-size:15px;line-height:1.7;color:${C.inkMuted};">&mdash; The ${esc(
              SITE.name,
            )} team<br /><span style="color:${C.inkSoft};font-size:14px;">Atlanta, GA &#183; since ${SITE.foundingYear}</span></div>
          </td>
        </tr>
${footer()}`;

  return shell({
    title: "We got your quote request — Comet National",
    preheaderText: `Thanks, ${firstName} — a dispatcher will reach out within one business hour about your ${input.freightType} shipment.`,
    inner,
  });
}

/* --- Plain-text fallbacks (multipart alternative) -------------------------- */

export function renderInternalQuoteText(input: QuoteEmailInput): string {
  return [
    `New quote request from cometnational.com`,
    ``,
    `--- CONTACT ---`,
    `Company:     ${input.company}`,
    `Name:        ${input.name}`,
    `Phone:       ${input.phone}`,
    `Email:       ${input.email}`,
    ``,
    `--- FREIGHT ---`,
    `Type:        ${input.freightType}`,
    `Ready date:  ${input.readyDate || "—"}`,
    `Origin:      ${input.origin}`,
    `Destination: ${input.destination}`,
    `Dimensions:  ${input.dimensions || "—"}`,
    `Weight:      ${input.weight || "—"}`,
    ``,
    `--- DESCRIPTION ---`,
    input.description || "(none provided)",
  ].join("\n");
}

export function renderLeadConfirmationText(input: QuoteEmailInput): string {
  const firstName = input.name.split(" ")[0] || "there";
  return [
    `Hi ${firstName},`,
    ``,
    `Thanks for the quote request. A dispatcher will typically reach out within one business hour.`,
    ``,
    `If it’s urgent, call us at ${SITE.phone}.`,
    ``,
    `— The ${SITE.name} team`,
    `Atlanta, GA — since ${SITE.foundingYear}`,
  ].join("\n");
}
