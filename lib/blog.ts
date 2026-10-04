import type { ComponentType } from "react";

// PENTING: lib/sanity/posts TIDAK boleh di-import statis di file ini.
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

type MDXModule = { default: ComponentType };

export const POSTS: Record<BlogLang, PostMeta[]> = {
  en: [
    {
      slug: "ship-small-learn-fast",
      title: "Ship small, learn fast",
      excerpt: "Why weekly releases beat quarterly perfection — and the rhythm that makes it work.",
      date: "2026-09-10",
      tags: ["Shipping", "Process"],
      minutes: 4,
    },
    {
      slug: "core-web-vitals-nextjs",
      title: "Core Web Vitals in Next.js, practically",
      excerpt: "A short checklist that covers 90% of performance wins: formats, sizes, priority, stability.",
      date: "2026-08-02",
      tags: ["Next.js", "Performance"],
      minutes: 6,
    },
    {
      slug: "design-system-that-scales",
      title: "A design system that scales",
      excerpt: "Systems fail from lack of decisions, not lack of components. Tokens first, guidance always.",
      date: "2026-06-18",
      tags: ["Design Systems", "React"],
      minutes: 5,
    },
  ],
  id: [
    {
      slug: "ship-small-learn-fast",
      title: "Kirim kecil, belajar cepat",
      excerpt: "Kenapa rilisan mingguan mengalahkan kesempurnaan kuartalan — dan ritme yang membuatnya berhasil.",
      date: "2026-09-10",
      tags: ["Shipping", "Proses"],
      minutes: 4,
    },
    {
      slug: "core-web-vitals-nextjs",
      title: "Core Web Vitals di Next.js secara praktis",
      excerpt: "Checklist pendek yang mencakup 90% kemenangan performa: format, ukuran, prioritas, stabilitas.",
      date: "2026-08-02",
      tags: ["Next.js", "Performa"],
      minutes: 6,
    },
    {
      slug: "design-system-that-scales",
      title: "Design system yang scalable",
      excerpt: "Sistem gagal karena kekurangan keputusan, bukan kekurangan komponen. Token dulu, panduan selalu.",
      date: "2026-06-18",
      tags: ["Design System", "React"],
      minutes: 5,
    },
  ],
};

const COMPONENTS: Record<BlogLang, Record<string, () => Promise<MDXModule>>> = {
  en: {
    "ship-small-learn-fast": () => import("../content/blog/en/ship-small-learn-fast.mdx"),
    "core-web-vitals-nextjs": () => import("../content/blog/en/core-web-vitals-nextjs.mdx"),
    "design-system-that-scales": () => import("../content/blog/en/design-system-that-scales.mdx"),
  },
  id: {
    "ship-small-learn-fast": () => import("../content/blog/id/ship-small-learn-fast.mdx"),
    "core-web-vitals-nextjs": () => import("../content/blog/id/core-web-vitals-nextjs.mdx"),
    "design-system-that-scales": () => import("../content/blog/id/design-system-that-scales.mdx"),
  },
};

/**
 * Post yang berasal dari Sanity.
 * next-sanity dimuat via dynamic import — tidak pernah masuk bundle awal client.
 */
let sanityPostsCache: SanityPost[] | null = null;
let sanityCacheTime = 0;
const SANITY_CACHE_TTL = 60_000; // 1 menit

async function loadFetchers() {
  // Dynamic import: chunk next-sanity hanya dimuat saat benar-benar dipakai.
  const postsModule = await import("./sanity/posts");
  return postsModule;
}

export async function getSanityPosts(): Promise<SanityPost[]> {
  const { fetchSanityPosts } = await loadFetchers();

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

/**
 * getSortedPosts: Sanity dulu, fallback ke MDX statis.
 * Sanity post + MDX post dengan slug sama → Sanity menang.
 */
export async function getSortedPosts(lang: BlogLang): Promise<PostMeta[]> {
  const { sanityPostToMeta } = await loadFetchers();
  const sanityPosts = await getSanityPosts();
  if (sanityPosts.length === 0) {
    return [...POSTS[lang]].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  const mdxPosts = POSTS[lang];
  const cmsMetas = sanityPosts.map((post) => sanityPostToMeta(post, lang));
  const cmsSlugs = new Set(cmsMetas.map((meta) => meta.slug));
  const mdxFallback = mdxPosts.filter((post) => !cmsSlugs.has(post.slug));

  return [...cmsMetas, ...mdxFallback].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostMeta(lang: BlogLang, slug: string): Promise<PostMeta | undefined> {
  const { sanityPostToMeta } = await loadFetchers();
  const sanityPosts = await getSanityPosts();
  const sanityPost = sanityPosts.find((post) => post.slug === slug);
  if (sanityPost) return sanityPostToMeta(sanityPost, lang);
  return POSTS[lang].find((post) => post.slug === slug);
}

/** Ambil konten artikel: Portable Text dari Sanity atau MDX component. */
export async function getPostContent(
  lang: BlogLang,
  slug: string,
): Promise<
  | { type: "sanity"; body: import("sanity").TypedObject[] }
  | { type: "mdx"; Component: ComponentType }
  | null
> {
  const sanityPosts = await getSanityPosts();
  const sanityPost = sanityPosts.find((post) => post.slug === slug);
  if (sanityPost) {
    const body = (lang === "id" ? sanityPost.bodyId || sanityPost.bodyEn : sanityPost.bodyEn) ?? [];
    if (body.length > 0) {
      return { type: "sanity", body: body as import("sanity").TypedObject[] };
    }
  }

  const loader = COMPONENTS[lang]?.[slug];
  if (!loader) return null;
  const mod = await loader();
  return { type: "mdx", Component: mod.default };
}

export async function getAllParams(): Promise<Array<{ lang: BlogLang; slug: string }>> {
  const params = (Object.keys(POSTS) as BlogLang[]).flatMap((lang) =>
    POSTS[lang].map((post) => ({ lang, slug: post.slug }))
  );

  const sanityPosts = await getSanityPosts();
  for (const post of sanityPosts) {
    for (const lang of ["en", "id"] as BlogLang[]) {
      if (!params.some((p) => p.lang === lang && p.slug === post.slug)) {
        params.push({ lang, slug: post.slug });
      }
    }
  }
  return params;
}

export function formatDate(date: string, lang: BlogLang): string {
  return new Date(date + "T00:00:00").toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
