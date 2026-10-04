import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PortableBody from "../../../../components/PortableBody";
import {
  formatDate,
  getAllParams,
  getPostContent,
  getPostMeta,
  getSortedPosts,
  type BlogLang,
} from "../../../../lib/blog";

interface ArticleParams {
  lang: string;
  slug: string;
}

function isLang(value: string): value is BlogLang {
  return value === "en" || value === "id";
}

// ISR: halaman di-regenerate maksimal setiap 60 detik jika ada request baru.
export const revalidate = 60;

export async function generateStaticParams(): Promise<ArticleParams[]> {
  return getAllParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleParams>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const post = await getPostMeta(lang, slug);
  if (!post) return {};
  return { title: `${post.title} — DEV.PORT`, description: post.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<ArticleParams>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const post = await getPostMeta(lang, slug);
  const content = await getPostContent(lang, slug);
  if (!post || !content) notFound();

  const posts = await getSortedPosts(lang);
  const index = posts.findIndex((item) => item.slug === slug);
  const prev = posts[index + 1];
  const next = posts[index - 1];
  const readLabel = lang === "en" ? "min read" : "mnt baca";
  const backLabel = lang === "en" ? "All articles" : "Semua artikel";

  return (
    <main className="blog-page">
      <div className="article">
        <div className="blog-page-top">
          <Link href="/blog" className="blog-back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>
        </div>
        <header className="article-header">
          <div className="blog-card-meta">
            <span>{formatDate(post.date, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {post.minutes} {readLabel}
            </span>
          </div>
          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>
          <div className="blog-card-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </header>
        <div className="article-prose prose prose-invert max-w-none">
          {content.type === "sanity" ? (
            <PortableBody body={content.body} />
          ) : (
            <content.Component />
          )}
        </div>

        <nav className="article-nav" aria-label="More articles">
          {prev ? (
            <Link href={`/blog/${lang}/${prev.slug}`}>
              <span>← {lang === "en" ? "Previous" : "Sebelumnya"}</span>
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/blog/${lang}/${next.slug}`} className="next">
              <span>{lang === "en" ? "Next" : "Berikutnya"} →</span>
              {next.title}
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
