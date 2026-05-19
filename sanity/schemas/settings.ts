import { defineType, defineField } from "sanity";

/**
 * Singleton — Site-wide configuration. Authoritative NAP.
 */
export default defineType({
  name: "settings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string", initialValue: "Comet National" }),
    defineField({ name: "legalName", title: "Legal name", type: "string", initialValue: "Comet National Shipping Company" }),
    defineField({ name: "tagline", title: "Tagline (hero)", type: "string", initialValue: "We ship anything to anywhere." }),
    defineField({ name: "subline", title: "Subline (hero supporting copy)", type: "text", rows: 3 }),
    defineField({ name: "trustLine", title: "Trust line", type: "string", initialValue: "One Atlanta team. Every mode since 1970." }),
    defineField({
      name: "foundingYear", title: "Founding year", type: "number",
      initialValue: 1970,
      validation: (r) => r.required().min(1900).max(new Date().getFullYear()),
    }),
    defineField({ name: "phone", title: "Phone (display)", type: "string", initialValue: "(800) 831-5376" }),
    defineField({ name: "phoneE164", title: "Phone (E.164 for tel:)", type: "string", initialValue: "+18008315376" }),
    defineField({ name: "email", title: "Primary email", type: "string", initialValue: "sales@cometnational.com" }),
    defineField({
      name: "address",
      title: "Atlanta facility address",
      type: "object",
      fields: [
        defineField({ name: "street", type: "string", initialValue: "4138 Arcadia Industrial Circle" }),
        defineField({ name: "locality", type: "string", initialValue: "Lilburn" }),
        defineField({ name: "region", type: "string", initialValue: "GA" }),
        defineField({ name: "postal", type: "string", initialValue: "30047" }),
        defineField({ name: "country", type: "string", initialValue: "US" }),
      ],
    }),
    defineField({
      name: "hours",
      title: "Business hours",
      type: "object",
      fields: [
        defineField({ name: "open", type: "string", initialValue: "08:00" }),
        defineField({ name: "close", type: "string", initialValue: "17:00" }),
        defineField({
          name: "days",
          type: "array",
          of: [{ type: "string" }],
          options: { list: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], layout: "tags" },
          initialValue: ["Mo", "Tu", "We", "Th", "Fr"],
        }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Social profiles",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "platform", type: "string" }),
            defineField({ name: "url", type: "url" }),
          ],
        },
      ],
    }),
    defineField({
      name: "stats",
      title: "Headline stats (Stat band)",
      description: "Phase 1 uses placeholders. Toggle 'tbd' on each to flag values needing real data.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "value", type: "number" }),
            defineField({
              name: "format",
              type: "string",
              options: { list: ["plain", "plus", "k"] },
              initialValue: "plain",
            }),
            defineField({ name: "suffix", type: "string" }),
            defineField({ name: "tbd", type: "boolean", initialValue: true }),
          ],
        },
      ],
    }),
    defineField({ name: "seoDefault", title: "Default SEO image / fallback", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
