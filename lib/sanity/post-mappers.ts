import type { BlogLang, PostMeta } from "../blog";
import type { SanityPost } from "./posts";

/**
 * Mapping Sanity post → PostMeta yang dipakai UI (fallback EN jika ID kosong).
 * File ini TIDAK meng-import next-sanity — aman untuk client bundle.
 */
export function sanityPostToMeta(post: SanityPost, lang: BlogLang): PostMeta {
  const locale = lang === "id" ? "Id" : "En";
  const fallback = lang === "id" ? "En" : "Id";
  const pick = (field: "title" | "excerpt") =>
    (post[`${field}${locale}`] || post[`${field}${fallback}`] || "") as string;

  return {
    slug: post.slug,
    title: pick("title"),
    excerpt: pick("excerpt"),
    date: post.date,
    tags: post.tags ?? [],
    minutes: post.minutes ?? 5,
  };
}
