import { groq } from "next-sanity";

import { sanityClient } from "./client";
import type { BlogLang, PostMeta } from "../blog";

// ---------- Types ----------

export interface SanityPost {
  slug: string;
  titleEn: string;
  titleId?: string;
  excerptEn: string;
  excerptId?: string;
  date: string;
  tags?: string[];
  minutes?: number;
  featuredImage?: {
    _type: string;
    asset?: { _ref: string; _type: string };
  };
  bodyEn?: unknown[];
  bodyId?: unknown[];
}

// ---------- Queries ----------

const postFields = /* groq */ `
  "slug": slug.current,
  titleEn,
  titleId,
  excerptEn,
  excerptId,
  date,
  tags,
  minutes,
  featuredImage,
  bodyEn,
  bodyId
`;

const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(date desc) {
  ${postFields}
}`;

const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  ${postFields}
}`;

// ---------- Fetch ----------

/** Ambil semua post published dari Sanity. */
export async function fetchSanityPosts(): Promise<SanityPost[]> {
  try {
    return await sanityClient.fetch<SanityPost[]>(postsQuery);
  } catch {
    // Project ID belum valid / offline → fallback ke MDX statis.
    return [];
  }
}

/** Ambil satu post by slug dari Sanity. */
export async function fetchSanityPost(slug: string): Promise<SanityPost | null> {
  try {
    return await sanityClient.fetch<SanityPost | null>(postBySlugQuery, { slug });
  } catch {
    return null;
  }
}

// Mapping UI dipindah ke ./post-mappers (tanpa dependency next-sanity)
export { sanityPostToMeta } from "./post-mappers";
