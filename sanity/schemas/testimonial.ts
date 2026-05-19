import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "author", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({
      name: "service",
      type: "reference",
      to: [{ type: "service" }],
      description: "Optional — surfaces this quote on a specific service page.",
    }),
  ],
  preview: {
    select: { title: "author", subtitle: "body" },
    prepare({ title, subtitle }) {
      return { title: title || "(no author)", subtitle: subtitle?.slice(0, 80) };
    },
  },
});
