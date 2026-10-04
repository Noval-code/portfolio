import type { BlogLang } from "../blog";
import { urlForImage } from "./image-url";
import type { SanityProject, SanityCertificate } from "./projects";

// ---------- UI Types ----------

export interface UiProject {
  number: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  highlight: string;
  badges: string[];
  clients: string[];
  liveUrl: string;
  repoUrl: string;
  image?: string;
}

export interface UiCertificate {
  title: string;
  issuer: string;
  year: string;
  credentialId: string;
  link: string;
  image: string;
}

/**
 * Mapping Sanity project/certificate → format UI.
 * File ini TIDAK meng-import next-sanity client — aman untuk client bundle.
 * (image-url hanya butuh projectId/dataset, bukan fetch client.)
 */

export function projectImageUrl(project: SanityProject): string | undefined {
  return project.image?.asset?._ref ? urlForImage(project.image).url() : undefined;
}

export function certificateImageUrl(cert: SanityCertificate): string | undefined {
  return cert.image?.asset?._ref ? urlForImage(cert.image).url() : undefined;
}

export function sanityProjectToUi(project: SanityProject, lang: BlogLang, index: number): UiProject {
  const locale = lang === "id" ? "Id" : "En";
  const fallback = lang === "id" ? "En" : "Id";
  const pick = (field: "description" | "highlight") =>
    (project[`${field}${locale}`] || project[`${field}${fallback}`] || "") as string;

  return {
    number: String(project.order ?? index + 1).padStart(2, "0"),
    title: project.title,
    type: project.type ?? "",
    description: pick("description"),
    stack: project.stack ?? [],
    highlight: pick("highlight"),
    badges: [],
    clients: project.clients ?? [],
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    image: projectImageUrl(project),
  };
}

export function sanityCertificateToUi(cert: SanityCertificate, index: number): UiCertificate {
  return {
    title: cert.title,
    issuer: cert.issuer,
    year: cert.year ?? "",
    credentialId: cert.credentialId ?? `CERT-${index + 1}`,
    link: cert.link ?? "",
    image: certificateImageUrl(cert) ?? "",
  };
}
