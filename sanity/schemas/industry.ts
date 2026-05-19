import { defineType, defineField } from "sanity";

export default defineType({
  name: "industry",
  title: "Industry",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "blurb", type: "text", rows: 2 }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
    }),
    defineField({ name: "intro", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "relevantServices",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      validation: (r) => r.min(2),
    }),
    defineField({
      name: "cargoExamples",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "blurb", media: "heroImage" } },
});
