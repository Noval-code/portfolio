import Link from "next/link";
import { formatDate, type BlogLang, type PostMeta } from "../lib/blog";

interface BlogCardProps {
  post: PostMeta;
  lang: BlogLang;
  readLabel: string;
}

export default function BlogCard({ post, lang, readLabel }: BlogCardProps) {
  return (
    <Link href={`/blog/${lang}/${post.slug}`} className="blog-card reveal">
      <div className="blog-card-meta">
        <span>{formatDate(post.date, lang)}</span>
        <span aria-hidden="true">·</span>
        <span>
          {post.minutes} {readLabel}
        </span>
      </div>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <div className="blog-card-tags">
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="blog-card-footer">
        <span>{readLabel === "min read" ? "Read article" : "Baca artikel"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 7h10v10" />
          <path d="M7 17l10-10" />
        </svg>
      </div>
    </Link>
  );
}
