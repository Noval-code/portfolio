"use client";

import { useState } from "react";
import Link from "next/link";
import BlogCard from "../../components/BlogCard";
import type { BlogLang, PostMeta } from "../../lib/blog";

const copy = {
  en: {
    back: "Home",
    kicker: "Blog",
    title: "Notes on building for the web.",
    sub: "Essays on shipping, performance, and design systems — from real project work.",
  },
  id: {
    back: "Beranda",
    kicker: "Blog",
    title: "Catatan membangun untuk web.",
    sub: "Esai tentang shipping, performa, dan design system — dari kerja project nyata.",
  },
};

export default function BlogIndexClient({ initialPosts }: { initialPosts: Record<BlogLang, PostMeta[]> }) {
  const [lang, setLang] = useState<BlogLang>("en");
  const t = copy[lang];

  // Posts per bahasa sudah di-fetch server-side; toggle bahasa hanya memilih array.
  const posts = initialPosts[lang];

  return (
    <main className="blog-page">
      <div className="blog-page-top">
        <Link href="/" className="blog-back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          {t.back}
        </Link>
        <div className="blog-lang-toggle" role="group" aria-label="Language">
          {(["en", "id"] as BlogLang[]).map((option) => (
            <button
              key={option}
              type="button"
              className={option === lang ? "is-active" : ""}
              onClick={() => setLang(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="section-kicker">{t.kicker}</p>
      <div className="blog-heading">
        <div>
          <h2>{t.title}</h2>
          <p className="blog-sub">{t.sub}</p>
        </div>
      </div>
      <div className="blog-list">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} lang={lang} readLabel={lang === "en" ? "min read" : "mnt baca"} />
        ))}
      </div>
    </main>
  );
}
