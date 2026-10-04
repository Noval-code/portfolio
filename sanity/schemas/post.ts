import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL: /blog/en/<slug> atau /blog/id/<slug> — harus sama untuk kedua bahasa",
      options: {
        source: "titleEn",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (EN)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleId",
      title: "Title (ID)",
      type: "string",
    }),
    defineField({
      name: "excerptEn",
      title: "Excerpt (EN)",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerptId",
      title: "Excerpt (ID)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "bodyEn",
      title: "Body (EN)",
      type: "array",
      of: [{ type: "block" }, { type: "code" }, { type: "image" }],
    }),
    defineField({
      name: "bodyId",
      title: "Body (ID)",
      type: "array",
      of: [{ type: "block" }, { type: "code" }, { type: "image" }],
    }),
    defineField({
      name: "date",
      title: "Publish Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "minutes",
      title: "Reading Minutes",
      type: "number",
      description: "Perkiraan waktu baca dalam menit",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "titleEn",
      subtitle: "slug.current",
      media: "featuredImage",
    },
  },
  orderings: [
    {
      title: "Publish Date, New First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
