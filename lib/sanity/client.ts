import { createClient } from "next-sanity";

// PENTING: JANGAN import apa pun dari "sanity" / sanity/schemas di file ini!
// File ini ikut masuk bundle CLIENT (dipakai lib/blog.ts untuk fetch post di browser).
// Package "sanity" = Sanity Studio core (~1 MB+, termasuk mux-player + hls.js).
// Studio config ada di sanity.config.ts yang hanya dimuat di /studio.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";

/**
 * Read-only client untuk frontend.
 * - Tidak butuh token untuk konten yang published.
 * - `perspective: "published"` supaya hanya konten final yang tampil.
 * - `useCdn: true` + Next.js Data Cache (revalidate 60) → konten fresh maksimal 1 menit.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
