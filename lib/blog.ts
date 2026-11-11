// lib/blog.ts ikut masuk bundle CLIENT (BlogCard di homepage/blog memakai formatDate).
// next-sanity hanya dimuat lewat dynamic import (chunk terpisah, kebanyakan di server).
import type { SanityPost } from "./sanity/posts";

export type BlogLang = "en" | "id";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  minutes: number;
  /** true jika post berasal dari Sanity CMS */
  fromCms?: boolean;
}

const postFetchModule = () => import("./sanity/posts");

/**
 * Post yang berasal dari Sanity.
 * next-sanity dimuat via dynamic import — tidak pernah masuk bundle awal client.
 */
let sanityPostsCache: SanityPost[] | null = null;
let sanityCacheTime = 0;
const SANITY_CACHE_TTL = 60_000; // 1 menit

export async function getSanityPosts(): Promise<SanityPost[]> {
  const { fetchSanityPosts } = await postFetchModule();

  if (typeof window !== "undefined") {
    // Browser: cache in-memory
    const now = Date.now();
    if (sanityPostsCache && now - sanityCacheTime < SANITY_CACHE_TTL) {
      return sanityPostsCache;
    }
    const posts = await fetchSanityPosts();
    if (posts.length > 0) {
      sanityPostsCache = posts;
      sanityCacheTime = now;
    }
    return posts;
  }

  // Server: langsung fetch (cache diatur via useCdn + revalidate di client.ts)
  return fetchSanityPosts();
}

/** Semua post diambil dari Sanity CMS, terbaru lebih dulu. */
export async function getSortedPosts(lang: BlogLang): Promise<PostMeta[]> {
  const { sanityPostToMeta } = await postFetchModule();
  const sanityPosts = await getSanityPosts();

  return sanityPosts
    .map((post) => sanityPostToMeta(post, lang))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostMeta(lang: BlogLang, slug: string): Promise<PostMeta | undefined> {
  const { sanityPostToMeta } = await postFetchModule();
  const sanityPosts = await getSanityPosts();
  const sanityPost = sanityPosts.find((post) => post.slug === slug);
  return sanityPost ? sanityPostToMeta(sanityPost, lang) : undefined;
}

/** Ambil konten artikel Portable Text dari Sanity. */
export async function getPostContent(
  lang: BlogLang,
  slug: string,
): Promise<{ type: "sanity"; body: import("sanity").TypedObject[] } | null> {
  const sanityPosts = await getSanityPosts();
  const sanityPost = sanityPosts.find((post) => post.slug === slug);
  if (!sanityPost) return null;

  const body = (lang === "id" ? sanityPost.bodyId || sanityPost.bodyEn : sanityPost.bodyEn) ?? [];
  if (body.length === 0) return null;

  return { type: "sanity", body: body as import("sanity").TypedObject[] };
}

export async function getAllParams(): Promise<Array<{ lang: BlogLang; slug: string }>> {
  const sanityPosts = await getSanityPosts();
  const langs: BlogLang[] = ["en", "id"];

  return sanityPosts.flatMap((post) => langs.map((lang) => ({ lang, slug: post.slug })));
}

export function formatDate(date: string, lang: BlogLang): string {
  return new Date(date + "T00:00:00").toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
