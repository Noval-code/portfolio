import { getSortedPosts, type BlogLang, type PostMeta } from "../../lib/blog";

import BlogIndexClient from "./BlogIndexClient";

// ISR: daftar post di-regenerate maksimal setiap 60 detik.
export const revalidate = 60;

export default async function BlogPage() {
  const [en, id] = await Promise.all([getSortedPosts("en"), getSortedPosts("id")]);
  const initialPosts: Record<BlogLang, PostMeta[]> = { en, id };
  return <BlogIndexClient initialPosts={initialPosts} />;
}
