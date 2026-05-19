import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

/**
 * Comet National Studio.
 * Deploy with: cd sanity && pnpm sanity init && pnpm sanity deploy
 * Studio URL: cometnational.sanity.studio
 */
export default defineConfig({
  name: "comet-national",
  title: "Comet National",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "REPLACE_AFTER_SANITY_INIT",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Singletons first
            S.listItem()
              .title("Site settings")
              .id("settings")
              .child(S.editor().schemaType("settings").documentId("settings")),
            S.divider(),
            S.documentTypeListItem("service").title("Services"),
            S.documentTypeListItem("industry").title("Industries"),
            S.documentTypeListItem("insight").title("Insights (Blog)"),
            S.documentTypeListItem("testimonial").title("Testimonials"),
            S.documentTypeListItem("person").title("Authors"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      // Hide "New settings" since it's a singleton.
      templates.filter(({ schemaType }) => schemaType !== "settings"),
  },
});
