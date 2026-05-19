import { defineType, defineField } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title tag",
      type: "string",
      validation: (r) => r.max(70).warning("Keep under 70 chars for Google SERP."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 2,
      validation: (r) => r.max(165).warning("Keep under 165 chars."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image (1200x630)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
