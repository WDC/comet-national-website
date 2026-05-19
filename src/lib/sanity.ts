/**
 * Sanity client + image URL helper.
 * Phase 1: stub. Phase 2: real GROQ queries that replace src/lib/services.ts.
 *
 * After running `cd sanity && pnpm sanity init`, populate:
 *   PUBLIC_SANITY_PROJECT_ID=...
 *   PUBLIC_SANITY_DATASET=production
 * in your .env, then `pnpm add @sanity/client @sanity/image-url` and uncomment below.
 */

export const SANITY = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: import.meta.env.SANITY_API_VERSION ?? "2024-12-01",
};

export const sanityConfigured = SANITY.projectId.length > 0;

/* Phase 2 — uncomment after `pnpm add @sanity/client @sanity/image-url`:

import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: SANITY.projectId,
  dataset: SANITY.dataset,
  apiVersion: SANITY.apiVersion,
  useCdn: true,
  perspective: "published",
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: any) => builder.image(source);
*/
