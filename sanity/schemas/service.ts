import { defineType, defineField } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "metadata", title: "Metadata & SEO" },
  ],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (r) => r.required(),
      group: "metadata",
    }),
    defineField({
      name: "category",
      type: "string",
      options: { list: ["trailer", "facility", "managed"], layout: "radio" },
      validation: (r) => r.required(),
      group: "metadata",
    }),
    defineField({
      name: "equityLine",
      type: "string",
      description: "Inherited brand line (e.g. 'You only pay for the space you use'). Optional.",
      group: "content",
    }),
    defineField({ name: "heroHeadline", type: "string", group: "content" }),
    defineField({ name: "heroSubline", type: "text", rows: 2, group: "content" }),
    defineField({
      name: "heroAnimationKey",
      type: "string",
      description: "Component slug under src/components/animations/. Leave empty to use a static illustration.",
      options: {
        list: [
          "FreightNetwork", "CoverageReveal", "HowItWorksFlow",
          "TrailerMorph", "FlatbedLTLViz", "TransloadFlow",
          "CrossDockFlow", "DistressedRecovery", "StatCountUp",
        ],
      },
      group: "metadata",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
      group: "content",
    }),
    defineField({ name: "blurb", type: "text", rows: 2, group: "content" }),
    defineField({ name: "whatItIs", type: "array", of: [{ type: "block" }], group: "content" }),
    defineField({ name: "whoItsFor", type: "array", of: [{ type: "block" }], group: "content" }),
    defineField({
      name: "cargoList",
      title: "What we haul",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "howItWorks",
      title: "How it works (steps)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "step", type: "number" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "body", type: "text", rows: 3 }),
          ],
        },
      ],
      group: "content",
    }),
    defineField({ name: "whyComet", title: "Why Comet for this", type: "array", of: [{ type: "block" }], group: "content" }),
    defineField({
      name: "relatedServices",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      validation: (r) => r.min(2).warning("Link at least 2 related services for SEO/UX (PLAN.md §7)."),
      group: "metadata",
    }),
    defineField({
      name: "relatedIndustries",
      type: "array",
      of: [{ type: "reference", to: [{ type: "industry" }] }],
      group: "metadata",
    }),
    defineField({
      name: "faq",
      type: "array",
      of: [{ type: "faqItem" }],
      group: "content",
    }),
    defineField({
      name: "schemaServiceType",
      type: "string",
      description: "Used in Service JSON-LD's serviceType (e.g. 'Flatbed LTL Freight').",
      validation: (r) => r.required(),
      group: "metadata",
    }),
    defineField({ name: "seo", type: "seo", group: "metadata" }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "heroImage" },
  },
});
