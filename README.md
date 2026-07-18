# Comet National

Marketing site for Comet National, built with [Astro](https://astro.build) and deployed on Vercel.

## Development

```bash
pnpm install
pnpm dev          # local dev server
pnpm build        # production build
pnpm check        # type + Astro diagnostics
```

Copy `.env.example` to `.env` and fill in the values.

## Quote form email (AWS SES)

The Get a Quote form (`/get-a-quote`) posts to `POST /api/quote`, which sends
two emails via AWS SES v2: a notification to the team and a confirmation to the
lead. Configuration is via the `SES_*` and `QUOTE_*` env vars in `.env.example`.

Notes:

- Credentials use `SES_`-prefixed names (not `AWS_*`) because Vercel/Lambda
  reserves the `AWS_*` env vars — set the same `SES_*` names in the Vercel
  project settings.
- `QUOTE_RECIPIENT_EMAIL` accepts a **comma-separated list** to notify multiple
  people (e.g. `sales@cometnational.com,dispatch@cometnational.com`). Set it the
  same way in Vercel.
- The `QUOTE_FROM_EMAIL` address (or its domain) must be a **verified SES
  identity**, and the account must be out of the SES sandbox to email leads at
  arbitrary addresses. The IAM keys need the `ses:SendEmail` permission.
- With no SES credentials set, the endpoint logs the request and returns success
  so the form still works in local dev.
