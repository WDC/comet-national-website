import type { APIRoute } from "astro";
import { z } from "zod";
import { Resend } from "resend";
import { SITE } from "@lib/site";

export const prerender = false;

const QuoteSchema = z.object({
  company: z.string().min(1).max(200),
  name: z.string().min(1).max(120),
  phone: z.string().min(7).max(40),
  email: z.string().email().max(200),
  freightType: z.string().min(1).max(80),
  readyDate: z.string().optional().default(""),
  origin: z.string().min(2).max(200),
  destination: z.string().min(2).max(200),
  dimensions: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  description: z.string().optional().default(""),
  _botfield: z.string().optional().default(""),
  "cf-turnstile-response": z.string().optional(),
});

async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — skip in dev
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function formatEmailBody(input: z.infer<typeof QuoteSchema>): string {
  const lines: string[] = [
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
  ];
  return lines.join("\n");
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const parsed = QuoteSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError("Some fields look wrong — please check and try again.", 400);
  }
  const data = parsed.data;

  // Honeypot
  if (data._botfield) {
    // Pretend success to not tip off the bot
    return jsonOk({ ok: true });
  }

  // Turnstile (when configured)
  const turnstileOk = await verifyTurnstile(data["cf-turnstile-response"], clientAddress ?? null);
  if (!turnstileOk) {
    return jsonError("Verification failed. Please retry.", 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.QUOTE_RECIPIENT_EMAIL ?? SITE.email;
  const from = import.meta.env.QUOTE_FROM_EMAIL ?? `quotes@cometnational.com`;

  if (!apiKey) {
    // Dev fallback: log to stdout so manual testing still works
    console.warn("[quote] RESEND_API_KEY not set; logging quote and returning success.");
    console.log(formatEmailBody(data));
    return jsonOk({ ok: true, dev: true });
  }

  const resend = new Resend(apiKey);
  try {
    const subject = `Quote — ${data.company} · ${data.freightType} · ${data.origin} → ${data.destination}`;
    await resend.emails.send({
      from: `Comet Quotes <${from}>`,
      to,
      replyTo: data.email,
      subject,
      text: formatEmailBody(data),
    });
    // Confirmation to lead
    await resend.emails.send({
      from: `Comet National <${from}>`,
      to: data.email,
      subject: `We got your quote request — Comet National`,
      text: [
        `Hi ${data.name.split(" ")[0]},`,
        ``,
        `Thanks for the quote request. A dispatcher will typically reach out within one business hour.`,
        ``,
        `If it's urgent, call us at ${SITE.phone}.`,
        ``,
        `— The Comet National team`,
        `Atlanta, GA — since ${SITE.foundingYear}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[quote] resend failure", err);
    return jsonError("Couldn't send the email. Please call us — fastest path.", 500);
  }

  return jsonOk({ ok: true });
};

function jsonOk(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
