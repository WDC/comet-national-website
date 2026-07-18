import type { APIRoute } from "astro";
import { z } from "zod";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
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

  // NB: Vercel runs on AWS Lambda, which reserves the `AWS_`-prefixed env
  // vars, so credentials are passed via `SES_`-prefixed names instead.
  const region = import.meta.env.SES_REGION ?? "us-east-1";
  const accessKeyId = import.meta.env.SES_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.SES_SECRET_ACCESS_KEY;
  // QUOTE_RECIPIENT_EMAIL may be a comma-separated list of recipients.
  const to = (import.meta.env.QUOTE_RECIPIENT_EMAIL ?? SITE.email)
    .split(",")
    .map((addr: string) => addr.trim())
    .filter(Boolean);
  const from = import.meta.env.QUOTE_FROM_EMAIL ?? `quotes@cometnational.com`;

  if (!accessKeyId || !secretAccessKey) {
    // Dev fallback: log to stdout so manual testing still works
    console.warn("[quote] SES credentials not set; logging quote and returning success.");
    console.log(formatEmailBody(data));
    return jsonOk({ ok: true, dev: true });
  }

  const ses = new SESv2Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  try {
    const subject = `Quote — ${data.company} · ${data.freightType} · ${data.origin} → ${data.destination}`;
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `Comet Quotes <${from}>`,
        Destination: { ToAddresses: to },
        ReplyToAddresses: [data.email],
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: { Text: { Data: formatEmailBody(data), Charset: "UTF-8" } },
          },
        },
      }),
    );
    // Confirmation to lead
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `Comet National <${from}>`,
        Destination: { ToAddresses: [data.email] },
        Content: {
          Simple: {
            Subject: { Data: `We got your quote request — Comet National`, Charset: "UTF-8" },
            Body: {
              Text: {
                Charset: "UTF-8",
                Data: [
                  `Hi ${data.name.split(" ")[0]},`,
                  ``,
                  `Thanks for the quote request. A dispatcher will typically reach out within one business hour.`,
                  ``,
                  `If it's urgent, call us at ${SITE.phone}.`,
                  ``,
                  `— The Comet National team`,
                  `Atlanta, GA — since ${SITE.foundingYear}`,
                ].join("\n"),
              },
            },
          },
        },
      }),
    );
  } catch (err) {
    console.error("[quote] SES failure", err);
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
