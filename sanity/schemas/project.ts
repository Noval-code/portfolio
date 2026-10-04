import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Urutan tampil di halaman (01, 02, 03, ...)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      description: "Contoh: PWA · Cafe Ordering & Membership",
    }),
    defineField({
      name: "descriptionEn",
      title: "Description (EN)",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "descriptionId",
      title: "Description (ID)",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "highlightEn",
      title: "Highlight (EN)",
      type: "string",
      description: "Satu poin unggulan, contoh: Sub-100ms presence updates",
    }),
    defineField({
      name: "highlightId",
      title: "Highlight (ID)",
      type: "string",
    }),
    defineField({
      name: "clients",
      title: "Clients",
      type: "array",
      of: [{ type: "string" }],
      description: "Kosongkan jika tidak ada klien",
    }),
    defineField({
      name: "liveUrl",
      title: "Live URL",
      type: "url",
    }),
    defineField({
      name: "repoUrl",
      title: "Repo URL",
      type: "url",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "type",
      media: "image",
    },
  },
  orderings: [
    {
      title: "Order, Ascending",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
