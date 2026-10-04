import { groq } from "next-sanity";

import { sanityClient } from "./client";

// ---------- Types ----------

export interface SanityProject {
  order: number;
  title: string;
  type?: string;
  descriptionEn: string;
  descriptionId?: string;
  stack?: string[];
  highlightEn?: string;
  highlightId?: string;
  clients?: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: {
    _type: string;
    asset?: { _ref: string; _type: string };
  };
}

export interface SanityCertificate {
  order: number;
  title: string;
  issuer: string;
  year?: string;
  credentialId?: string;
  link?: string;
  image?: {
    _type: string;
    asset?: { _ref: string; _type: string };
  };
}

// ---------- Queries ----------

const projectsQuery = groq`*[_type == "project" && defined(title)] | order(order asc) {
  order,
  title,
  type,
  descriptionEn,
  descriptionId,
  stack,
  highlightEn,
  highlightId,
  clients,
  liveUrl,
  repoUrl,
  image
}`;

const certificatesQuery = groq`*[_type == "certificate" && defined(title)] | order(order asc) {
  order,
  title,
  issuer,
  year,
  credentialId,
  link,
  image
}`;

// ---------- Fetch ----------

export async function fetchSanityProjects(): Promise<SanityProject[]> {
  try {
    return await sanityClient.fetch<SanityProject[]>(projectsQuery);
  } catch {
    return [];
  }
}

export async function fetchSanityCertificates(): Promise<SanityCertificate[]> {
  try {
    return await sanityClient.fetch<SanityCertificate[]>(certificatesQuery);
  } catch {
    return [];
  }
}

// Mapping UI dipindah ke ./project-mappers (tanpa dependency next-sanity)
export {
  projectImageUrl,
  certificateImageUrl,
  sanityProjectToUi,
  sanityCertificateToUi,
} from "./project-mappers";
export type { UiProject, UiCertificate } from "./project-mappers";

import type { BlogLang, PostMeta } from "../blog";
import { getSortedPosts } from "../blog";
import { sanityProjectToUi, sanityCertificateToUi, type UiProject, type UiCertificate } from "./project-mappers";

export interface PortfolioCms {
  projects: Record<BlogLang, UiProject[]>;
  certificates: UiCertificate[];
  /** 3 post terbaru per bahasa untuk section "Latest writing". */
  posts: Record<BlogLang, PostMeta[]>;
}

/**
 * Fetch + map SEMUA data CMS untuk homepage di server (sekali jalan).
 * Hasilnya dipass sebagai props ke client — browser tidak perlu fetch Sanity lagi.
 */
export async function fetchPortfolioCms(): Promise<PortfolioCms> {
  const [projects, certificates, postsEn, postsId] = await Promise.all([
    fetchSanityProjects(),
    fetchSanityCertificates(),
    getSortedPosts("en"),
    getSortedPosts("id"),
  ]);

  const langs: BlogLang[] = ["en", "id"];

  return {
    projects: Object.fromEntries(
      langs.map((lang) => [lang, projects.map((p, i) => sanityProjectToUi(p, lang, i))]),
    ) as Record<BlogLang, UiProject[]>,
    certificates: certificates.map((c, i) => sanityCertificateToUi(c, i)),
    posts: {
      en: postsEn.slice(0, 3),
      id: postsId.slice(0, 3),
    },
  };
}
