import { defineType, defineField } from "sanity";

export default defineType({
  name: "insight",
  title: "Insight (Blog post)",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", type: "text", rows: 3 }),
    defineField({ name: "publishedAt", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "updatedAt", type: "datetime" }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "person" }],
    }),
    defineField({
      name: "legacyUrl",
      type: "url",
      description: "Original URL on flatbedltl.com or transload911.com. Used for the 301 map.",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
        },
        {
          type: "object",
          name: "callout",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "body", type: "text" }),
          ],
        },
        {
          type: "object",
          name: "costTrap",
          title: "Cost-trap comparison",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({
              name: "rows",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", type: "string" }),
                    defineField({ name: "value", type: "string" }),
                    defineField({ name: "highlight", type: "boolean", initialValue: false }),
                  ],
                },
              ],
            }),
          ],
        },
        {
          type: "object",
          name: "animationEmbed",
          fields: [
            defineField({
              name: "key",
              type: "string",
              options: {
                list: [
                  "FreightNetwork", "CoverageReveal", "HowItWorksFlow",
                  "TrailerMorph", "FlatbedLTLViz", "TransloadFlow",
                  "CrossDockFlow", "DistressedRecovery", "StatCountUp",
                ],
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "heroImage" },
  },
  orderings: [
    {
      title: "Published date, new → old",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
