"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { motion, AnimatePresence } from "motion/react";
import Ferrofluid from "../components/Ferrofluid";
import ShinyText from "../components/ShinyText";
import MagicBento, { type BentoCardData } from "../components/MagicBento";
import {
  Brain,
  MessageSquareText,
  FileSearch,
  Globe,
  Workflow,
} from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import BlogCard from "../components/BlogCard";
import ProjectsSection from "../components/portfolio/ProjectsSection";
import ExperienceSection from "../components/portfolio/ExperienceSection";
import type { PostMeta } from "../lib/blog";
import type { PortfolioCms } from "../lib/sanity/projects";

const content = {
  en: {
    nav: { work: "Work", skills: "Skills", certs: "Certs", blog: "Blog", contact: "Contact", lang: "EN" },
    heroViewWork: "View Work",
    heroDownloadCv: "Download CV",
    heroSubtext:
      "Full-Stack Developer & Systems Architect. Specializing in Web Platforms and Automation systems.",
    aboutKicker: "About",
    aboutTitle:
      "I’m a full-stack developer focused on building production-ready web experiences that feel fast, look polished, and scale with real product needs.",
    aboutBody:
      "From interface design to backend systems, I help turn ideas into products that are smooth for users and stable for business operations. I care about performance, maintainability, and decisions that improve the experience long after launch.",
    workKicker: "Selected Work",
    workTitle: "Designed to move products forward",
    finalKicker: "Next",
    finalTitle: "Show both sides of the build.",
    finalBody: "Each case study should explain the interface decisions, the backend architecture, and the tradeoffs behind the final product.",
    stackKicker: "Stack",
    certificatesKicker: "Certificates",
    certificatesTitle: "Credentials that back up the craft.",
    certificatesSub: "Selected certifications across frontend, backend, and cloud — verified and up to date.",
    certificatesSoon: "Image coming soon",
    certificatesView: "View certificate",
    clientsLabel: "Used by",
    process: [
      ["Shape the experience", "Map the user journey, content structure, and interaction rhythm before writing components."],
      ["Engineer the backend", "Design APIs, schemas, auth, and data flows that support the product without unnecessary complexity."],
      ["Ship the product", "Bring UI, motion, performance, and deployment together into a clean release."],
    ],
    contactKicker: "Contact",
    contactTitle: "Need someone who can make the interface feel sharp and the system behind it work?",
    contactCta: "Let's build it",
    blogKicker: "Blog",
    blogTitle: "Notes on building for the web.",
    blogSub: "Essays on shipping, performance, and design systems — from real project work.",
    blogAll: "View all articles",
    experienceKicker: "Work History",
    experienceTitle: "Experience",
    experienceIntro: "I have worked with some of the most innovative industry leaders to help build their top-notch products.",
    experience: [
      {
        role: "Fullstack Developer",
        company: "PT Kampung Marketerindo Berdaya (Komerce)",
        period: "Jul 2025 — Nov 2025",
        points: [
          "Built and maintained business-facing products, including Cekwa.id — a WhatsApp account analysis platform for broadcast and bulk messaging workflows used in promotional campaigns.",
          "Used Next.js to build a responsive frontend for campaign management, user dashboards, and operational workflows while keeping the product interface clear and maintainable.",
          "Designed a modular backend architecture with Go services and PostgreSQL as the core data layer, separating business logic from the interface to support scalability and easier maintenance.",
          "Integrated Whatsmeow for WhatsApp automation and used Docker with GitLab to run, deploy, and manage the system in a more reliable and repeatable way.",
        ],
        stack: ["Next.js", "Golang", "PostgreSQL", "Whatsmeow", "GitLab", "Docker"],
      },
      {
        role: "Fullstack Developer",
        company: "BKR RACING EXHAUST",
        period: "Dec 2025 — Jun 2026",
        points: [
          "Built a Facebook Marketplace automation system to help sellers manage product listings faster and more efficiently.",
          "Developed interfaces for managing products, posts, and Marketplace listings with simple, responsive, and maintainable workflows.",
          "Designed a modular backend architecture to handle automation processes and data management in a structured way, making the system easier to maintain and extend.",
          "Automated workflows from product posting to listing management, reducing repetitive manual work by up to 90% and improving operational efficiency.",
          "Integrated browser-based automation to execute Marketplace activities consistently, reducing manual intervention and streamlining sellers' daily workflows.",
        ],
        stack: ["Automa", "Browser Automation", "E-commerce"],
      },
    ],
  },
  id: {
    nav: { work: "Karya", skills: "Skill", certs: "Sertifikat", blog: "Blog", contact: "Kontak", lang: "ID" },
    heroViewWork: "Lihat Karya",
    heroDownloadCv: "Unduh CV",
    heroSubtext:
      "Full-Stack Developer & Systems Architect. Spesialisasi di platform web dan sistem otomatisasi.",
    aboutKicker: "Tentang",
    aboutTitle:
      "Saya adalah full-stack developer yang fokus membangun pengalaman web production-ready yang terasa cepat, terlihat rapi, dan siap tumbuh sesuai kebutuhan produk.",
    aboutBody:
      "Dari desain antarmuka hingga sistem backend, saya membantu mengubah ide menjadi produk yang lancar untuk pengguna dan stabil untuk operasional bisnis. Saya peduli pada performa, maintainability, dan keputusan yang memperbaiki pengalaman dalam jangka panjang.",
    workKicker: "Karya Pilihan",
    workTitle: "Dirancang untuk mendorong produk maju",
    finalKicker: "Lanjut",
    finalTitle: "Tampilkan dua sisi dari proses build.",
    finalBody: "Setiap case study sebaiknya menjelaskan keputusan interface, arsitektur backend, dan tradeoff di balik produk akhirnya.",
    stackKicker: "Stack",
    certificatesKicker: "Sertifikat",
    certificatesTitle: "Kredensial yang mendukung keahlian.",
    certificatesSub: "Sertifikasi pilihan di bidang frontend, backend, dan cloud — terverifikasi dan terkini.",
    certificatesSoon: "Gambar segera hadir",
    certificatesView: "Lihat sertifikat",
    clientsLabel: "Dipakai oleh",
    process: [
      ["Bentuk experience", "Petakan user journey, struktur konten, dan ritme interaksi sebelum menulis komponen."],
      ["Bangun backend", "Rancang API, schema, auth, dan data flow yang mendukung produk tanpa kompleksitas berlebihan."],
      ["Ship produk", "Satukan UI, motion, performa, dan deployment menjadi release yang rapi."],
    ],
    contactKicker: "Kontak",
    contactTitle: "Butuh orang yang bisa membuat interface terasa sharp dan sistem di belakangnya berjalan?",
    contactCta: "Mari bangun",
    blogKicker: "Blog",
    blogTitle: "Catatan membangun untuk web.",
    blogSub: "Esai tentang shipping, performa, dan design system — dari kerja project nyata.",
    blogAll: "Lihat semua artikel",
    experienceKicker: "Work History",
    experienceTitle: "Experience",
    experienceIntro: "I have worked with some of the most innovative industry leaders to help build their top-notch products.",
    experience: [
      {
        role: "Fullstack Developer",
        company: "PT Kampung Marketerindo Berdaya (Komerce)",
        period: "Jul 2025 — Nov 2025",
        points: [
          "Membangun dan memelihara produk web bisnis, termasuk Cekwa.id — platform analisis akun WhatsApp untuk kebutuhan broadcast dan bulk message dalam workflow promosi.",
          "Menggunakan Next.js untuk membangun frontend yang responsif untuk dashboard campaign, operasional pengguna, dan kebutuhan user-facing dengan interface yang tetap jelas dan mudah dikelola.",
          "Merancang arsitektur backend yang modular dengan layanan Go dan PostgreSQL sebagai layer data utama, sehingga logika bisnis terpisah dari antarmuka dan lebih mudah diskalakan.",
          "Mengintegrasikan Whatsmeow untuk automasi WhatsApp serta menggunakan Docker dan GitLab untuk menjalankan, mendeliver, dan mengelola sistem dengan cara yang lebih konsisten dan reliabel.",
        ],
        stack: ["Next.js", "Golang", "PostgreSQL", "Whatsmeow", "GitLab", "Docker"],
      },
      {
        role: "Fullstack Developer",
        company: "BKR RACING EXHAUST",
        period: "Des 2025 — Jun 2026",
        points: [
          "Membangun sistem otomasi Facebook Marketplace untuk membantu penjual mengelola listing produk lebih cepat dan efisien.",
          "Mengembangkan interface untuk mengelola produk, postingan, dan listing Marketplace dengan workflow yang sederhana, responsif, dan mudah dipelihara.",
          "Merancang arsitektur backend yang modular untuk menangani proses otomasi dan pengelolaan data secara terstruktur, sehingga sistem lebih mudah dirawat dan dikembangkan.",
          "Mengotomasi workflow dari posting produk hingga pengelolaan listing, mengurangi pekerjaan manual repetitif hingga 90% dan meningkatkan efisiensi operasional.",
          "Mengintegrasikan otomasi berbasis browser untuk menjalankan aktivitas Marketplace secara konsisten, mengurangi intervensi manual, dan menyederhanakan workflow harian penjual.",
        ],
        stack: ["Automa", "Browser Automation", "E-commerce"],
      },
    ],
  },
};

const skillGroups = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Vue", "Angular", "GSAP", "Tailwind"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "PHP", "Laravel", "Express.js", "Python", "Flask"],
  },
  {
    id: "ml",
    label: "Machine Learning",
    items: ["TensorFlow", "NLP", "Chatbot", "RAG", "Web Scraping"],
  },
  {
    id: "database",
    label: "Database",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Prisma"],
  },
  {
    id: "tools",
    label: "Tools",
    items: ["Git", "GitLab", "Docker", "Postman", "Figma", "Automa", "n8n"],
  },
];

// Urutan kartu MagicBento — kartu ke-1, ke-3, dan ke-4 dapat sel 2x2
// (ruang paling besar) di desktop, sesuai rule nth-child di MagicBento.css.
const bentoCardOrder = ["frontend", "database", "backend", "ml", "tools"];

// Ikon teknologi (Devicon / Simple Icons CDN) — dirender dengan efek chrome/silver via CSS.
const backendIcons: Record<string, string> = {
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  "Laravel": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  "Express.js": "https://cdn.simpleicons.org/express/D4D7DC",
  "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "Flask": "https://cdn.simpleicons.org/flask/D4D7DC",
};

const databaseIcons: Record<string, string> = {
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "Supabase": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
  "Prisma": "https://cdn.simpleicons.org/prisma/D4D7DC",
};

const frontendIcons: Record<string, string> = {
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Next.js": "https://cdn.simpleicons.org/nextdotjs/D4D7DC",
  "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  "Vue": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  "Angular": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg",
  "GSAP": "https://cdn.simpleicons.org/gsap/D4D7DC",
  "Tailwind": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
};

// Ikon Machine Learning — TensorFlow pakai Devicon; konsep abstrak (NLP, Chatbot, RAG,
// Web Scraping) pakai ikon generik lucide-react karena tidak punya logo resmi.
const mlIcons: Record<string, string | React.ReactNode> = {
  "TensorFlow": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  "NLP": <Brain size={14} />,
  "Chatbot": <MessageSquareText size={14} />,
  "RAG": <FileSearch size={14} />,
  "Web Scraping": <Globe size={14} />,
};

const toolsIcons: Record<string, string | React.ReactNode> = {
  "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  "GitLab": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "Postman": "https://cdn.simpleicons.org/postman/D4D7DC",
  "Figma": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  "Automa": <Workflow size={14} />,
  "n8n": "https://cdn.simpleicons.org/n8n/D4D7DC",
};

const bentoCards: BentoCardData[] = bentoCardOrder
  .map((id) => skillGroups.find((group) => group.id === id))
  .filter((group): group is (typeof skillGroups)[number] => Boolean(group))
  .map((group) => ({
    color: "#120F17",
    label: group.label,
    title: group.label,
    description: group.items.join(" · "),
    items: group.items,
    icons:
      group.id === "backend"
        ? backendIcons
        : group.id === "database"
          ? databaseIcons
          : group.id === "frontend"
            ? frontendIcons
            : group.id === "ml"
              ? mlIcons
              : group.id === "tools"
                ? toolsIcons
                : undefined,
  }));

export default function Portfolio({ cms }: { cms: PortfolioCms }) {
  const root = useRef<HTMLElement>(null);
  const certTrackRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<"en" | "id">("en");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<null | {
    title: string;
    issuer: string;
    image: string;
    link: string;
  }>(null);
  const copy = content[language];
  const navLabels = copy.nav;

  const scrollCerts = (dir: 1 | -1) => {
    const el = certTrackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cert-card");
    const step = card ? card.offsetWidth + 18 : 340;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Projects & certificates langsung dari Sanity (tanpa fallback hardcode).
  const projects = cms.projects[language];
  const certificates = cms.certificates;
  const blogPosts: PostMeta[] = cms.posts[language];

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    document.documentElement.lang = language === "id" ? "id" : "en";
  }, [language]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        yPercent: 110,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "power4.out",
      });

      gsap.from(".hero-meta", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay: 0.45,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".hero-subword", {
        yPercent: 110,
        opacity: 0,
        duration: 0.7,
        stagger: 0.025,
        delay: 0.35,
        ease: "power3.out",
      });

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top-=80",
        end: "bottom top",
        onEnter: () => document.body.classList.add("nav-compact"),
        onLeaveBack: () => document.body.classList.remove("nav-compact"),
      });

      gsap.to(".orb", {
        y: -80,
        rotate: 18,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".shiny-fullstack", {
        xPercent: -24,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".shiny-engineer", {
        xPercent: 24,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((item) => {
        gsap.from(item, {
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".skill-pill").forEach((item, index) => {
        gsap.from(item, {
          y: 28,
          opacity: 0,
          duration: 0.5,
          delay: index * 0.02,
          scrollTrigger: {
            trigger: ".skills-grid",
            start: "top 78%",
          },
        });
      });

      gsap.to(".progress-line", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      const hero = root.current?.querySelector<HTMLElement>(".hero");
      const portrait = root.current?.querySelector<HTMLElement>(".hero-portrait");
      const reflection = root.current?.querySelector<HTMLElement>(".lens-reflection");
      const cleanups: Array<() => void> = [];

      if (hero && portrait && reflection && window.matchMedia("(pointer: fine)").matches) {
        const rotateX = gsap.quickTo(portrait, "rotationX", { duration: 0.6, ease: "power3.out" });
        const rotateY = gsap.quickTo(portrait, "rotationY", { duration: 0.6, ease: "power3.out" });
        const moveX = gsap.quickTo(portrait, "x", { duration: 0.7, ease: "power3.out" });
        const moveY = gsap.quickTo(portrait, "y", { duration: 0.7, ease: "power3.out" });
        const shineX = gsap.quickTo(reflection, "xPercent", { duration: 0.55, ease: "power3.out" });
        const shineY = gsap.quickTo(reflection, "yPercent", { duration: 0.55, ease: "power3.out" });

        const onPointerMove = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;

          rotateX(ny * -7);
          rotateY(nx * 10);
          moveX(nx * 22);
          moveY(ny * 14);
          shineX(nx * 42);
          shineY(ny * 28);
        };

        const onPointerLeave = () => {
          rotateX(0);
          rotateY(0);
          moveX(0);
          moveY(0);
          shineX(0);
          shineY(0);
        };

        hero.addEventListener("pointermove", onPointerMove);
        hero.addEventListener("pointerleave", onPointerLeave);
        gsap.set(portrait, { transformPerspective: 900, transformOrigin: "50% 48%" });

        cleanups.push(() => {
          hero.removeEventListener("pointermove", onPointerMove);
          hero.removeEventListener("pointerleave", onPointerLeave);
        });
      }

      const aboutAvatar = root.current?.querySelector<HTMLElement>(".about-avatar-card");
      const intro = root.current?.querySelector<HTMLElement>(".intro");
      if (intro && aboutAvatar && window.matchMedia("(pointer: fine)").matches) {
        const rotateX = gsap.quickTo(aboutAvatar, "rotationX", { duration: 0.55, ease: "power3.out" });
        const rotateY = gsap.quickTo(aboutAvatar, "rotationY", { duration: 0.55, ease: "power3.out" });
        const moveX = gsap.quickTo(aboutAvatar, "x", { duration: 0.65, ease: "power3.out" });
        const moveY = gsap.quickTo(aboutAvatar, "y", { duration: 0.65, ease: "power3.out" });

        const onPointerMove = (event: PointerEvent) => {
          const rect = intro.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;

          rotateX(ny * -8);
          rotateY(nx * 12);
          moveX(nx * 18);
          moveY(ny * 12);
        };

        const onPointerLeave = () => {
          rotateX(0);
          rotateY(0);
          moveX(0);
          moveY(0);
        };

        intro.addEventListener("pointermove", onPointerMove);
        intro.addEventListener("pointerleave", onPointerLeave);
        gsap.set(aboutAvatar, { transformPerspective: 900, transformOrigin: "50% 50%" });

        cleanups.push(() => {
          intro.removeEventListener("pointermove", onPointerMove);
          intro.removeEventListener("pointerleave", onPointerLeave);
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    }, root);

    return () => {
      document.body.classList.remove("nav-compact");
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <main ref={root}>
      <div className="progress-line" />
      <nav className="nav">
        <a href="#top" className="brand">DEV.PORT</a>
        <div className="nav-links">
          <a href="#work">{navLabels.work}</a>
          <a href="#skills">{navLabels.skills}</a>
          <a href="#certificates">{navLabels.certs}</a>
          <Link href="/blog">{navLabels.blog}</Link>
          <a href="#contact">{navLabels.contact}</a>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className="nav-control"
            aria-label="Toggle language"
            onClick={() => setLanguage((current) => (current === "en" ? "id" : "en"))}
          >
            {navLabels.lang}
          </button>
          <button
            type="button"
            className="nav-menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="nav-menu-bar" />
            <span className="nav-menu-bar" />
          </button>
        </div>
      </nav>
      <div id="mobile-menu" className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}>
        <a
          href="#work"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.work}
        </a>
        <a
          href="#skills"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.skills}
        </a>
        <a
          href="#certificates"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.certs}
        </a>
        <Link
          href="/blog"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.blog}
        </Link>
        <a
          href="#contact"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.contact}
        </a>
      </div>

      <section id="top" className="hero section">
        <div className="hero-ferro" aria-hidden="true">
          <Ferrofluid
            dpr={1}
            colors={["#f4f7fb", "#9aa3ad", "#3f4650"]}
            speed={0.32}
            scale={1.25}
            turbulence={0.72}
            fluidity={0.18}
            rimWidth={0.24}
            sharpness={3}
            shimmer={1.1}
            glow={1.7}
            opacity={0.62}
            flowDirection="right"
            mouseInteraction
            mouseStrength={0.55}
            mouseRadius={0.28}
            mouseDampening={0.18}
            mixBlendMode="screen"
          />
        </div>
        <div className="hero-portrait" aria-hidden="true">
          <Image src="/hero-potrait.webp" alt="" fill priority className="hero-portrait-image" />
          <div className="lens-reflection" />
        </div>
        <div className="hero-shiny-title" aria-hidden="true">
          <ShinyText
            text="FULL-STACK"
            className="shiny-line shiny-fullstack"
            speed={4.5}
            color="rgba(245, 247, 251, 0.16)"
            shineColor="rgba(255, 255, 255, 0.82)"
            spread={105}
            yoyo
            delay={0.6}
          />
          <ShinyText
            text="DEVELOPER"
            className="shiny-line shiny-engineer"
            speed={4.5}
            color="rgba(245, 247, 251, 0.12)"
            shineColor="rgba(255, 255, 255, 0.72)"
            spread={105}
            yoyo
            direction="right"
            delay={0.2}
          />
        </div>
        <div className="hero-copy-panel hero-copy-right">
          <p className="split-subtext" aria-label={copy.heroSubtext}>
            {copy.heroSubtext.split(" ").map((word, index) => (
              <span className="hero-subword-wrap" aria-hidden="true" key={`${word}-${index}`}>
                <span className="hero-subword">{word}</span>
              </span>
            ))}
          </p>
          <div className="hero-actions hero-meta">
            <a href="#work" className="button primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {copy.heroViewWork}
            </a>
            <a href="/cv.pdf" download className="button ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {copy.heroDownloadCv}
            </a>
          </div>
        </div>
      </section>

      <section className="section intro">
        <div className="intro-layout">
          <div className="intro-content">
            <p className="section-kicker reveal">{copy.aboutKicker}</p>
            <ScrollReveal
              baseOpacity={0}
              enableBlur
              baseRotation={5}
              blurStrength={10}
              containerClassName="about-scroll-reveal"
              textClassName="about-scroll-text"
            >
              {copy.aboutTitle}
            </ScrollReveal>
            <div className="intro-columns">
              <p className="reveal">{copy.aboutBody}</p>
            </div>
          </div>
          <div className="about-avatar-card reveal" aria-hidden="true">
            <Image src="/about-avatar.webp" alt="" fill className="about-avatar-image" />
          </div>
        </div>
      </section>

      <ProjectsSection
        kicker={copy.workKicker}
        title={copy.workTitle}
        projects={projects}
        demoComingSoon={language === "en" ? "Demo coming soon" : "Demo menyusul"}
        clientsLabel={copy.clientsLabel}
        finalKicker={copy.finalKicker}
        finalTitle={copy.finalTitle}
        finalBody={copy.finalBody}
      />

      <ExperienceSection
        kicker={copy.experienceKicker}
        title={copy.experienceTitle}
        intro={copy.experienceIntro}
        experience={copy.experience}
      />

      <section id="skills" className="section skills">
        <div className="experience-heading reveal">
          <h2 className="skills-title">{copy.stackKicker}</h2>
        </div>
        <div className="skills-bento reveal">
          <MagicBento
            cards={bentoCards}
            textAutoHide={false}
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt
            enableMagnetism
            clickEffect
            spotlightRadius={300}
            particleCount={10}
            glowColor="212, 215, 220"
          />
        </div>
      </section>

      <section id="certificates" className="section certificates">
        <div className="certificates-heading reveal">
          <div>
            <ShinyText
              text={copy.certificatesKicker}
              className="experience-work-history"
              speed={4.5}
              color="rgba(176, 182, 191, 0.72)"
              shineColor="rgba(255, 255, 255, 0.95)"
              spread={88}
              yoyo
              delay={0.3}
            />
            <h2 className="experience-title certificates-title">{copy.certificatesTitle}</h2>
            <p className="certificates-sub">{copy.certificatesSub}</p>
          </div>
          <div className="cert-controls">
            <button type="button" className="view-btn cert-btn" aria-label="Scroll certificates left" onClick={() => scrollCerts(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" className="view-btn cert-btn" aria-label="Scroll certificates right" onClick={() => scrollCerts(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="cert-track" ref={certTrackRef}>
          {certificates.map((cert) => (
            <article className="cert-card reveal" key={cert.credentialId}>
              {cert.image ? (
                <button
                  type="button"
                  className="cert-media is-clickable"
                  onClick={() => setLightbox({ title: cert.title, issuer: cert.issuer, image: cert.image, link: cert.link })}
                  aria-label={`${copy.certificatesView}: ${cert.title}`}
                >
                  <Image src={cert.image} alt={cert.title} fill sizes="(max-width: 760px) 84vw, 360px" className="cert-media-image" loading="lazy" />
                  <span className="cert-zoom" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </span>
                </button>
              ) : (
                <div className="cert-media" aria-hidden="true">
                  <span className="cert-media-placeholder">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.5 13l1.5 8-5-3-5 3 1.5-8" />
                    </svg>
                    <span>{copy.certificatesSoon}</span>
                  </span>
                </div>
              )}
              <div className="cert-top">
                <span className="cert-badge" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.5 13l1.5 8-5-3-5 3 1.5-8" />
                  </svg>
                </span>
                <span className="cert-year">{cert.year}</span>
              </div>
              <h3>{cert.title}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <p className="cert-id">ID: {cert.credentialId}</p>
              <div className="cert-footer">
                <a className="cert-link" href={cert.link} target="_blank" rel="noopener noreferrer">
                  {language === "en" ? "Verify" : "Verifikasi"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" />
                    <path d="M7 17l10-10" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              className="lightbox-figure"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-media">
                <Image src={lightbox.image} alt={lightbox.title} fill sizes="(max-width: 760px) 92vw, 880px" className="lightbox-image" priority />
              </div>
              <figcaption className="lightbox-caption">
                <span>
                  <strong>{lightbox.title}</strong>
                  <span>{lightbox.issuer}</span>
                </span>
                <span className="lightbox-actions">
                  <a className="cert-link" href={lightbox.link} target="_blank" rel="noopener noreferrer">
                    {language === "en" ? "Verify" : "Verifikasi"}
                  </a>
                  <button type="button" className="view-btn" onClick={() => setLightbox(null)} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="section process">
        <div className="process-card reveal">
          <span>01</span>
          <h3>{copy.process[0][0]}</h3>
          <p>{copy.process[0][1]}</p>
        </div>
        <div className="process-card reveal">
          <span>02</span>
          <h3>{copy.process[1][0]}</h3>
          <p>{copy.process[1][1]}</p>
        </div>
        <div className="process-card reveal">
          <span>03</span>
          <h3>{copy.process[2][0]}</h3>
          <p>{copy.process[2][1]}</p>
        </div>
      </section>

      <section id="blog" className="section blog">
        <div className="blog-heading reveal">
          <div>
            <p className="section-kicker">{copy.blogKicker}</p>
            <h2>{copy.blogTitle}</h2>
            <p className="blog-sub">{copy.blogSub}</p>
          </div>
        </div>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} lang={language} readLabel={language === "en" ? "min read" : "mnt baca"} />
          ))}
        </div>
        <div className="blog-more reveal">
          <Link className="button ghost" href="/blog">
            {copy.blogAll}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }} aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section id="contact" className="section contact">
        <p className="section-kicker reveal">{copy.contactKicker}</p>
        <h2 className="reveal">{copy.contactTitle}</h2>
        <a className="contact-link reveal" href="mailto:novalaula486@gmail.com">{copy.contactCta}</a>
      </section>
    </main>
  );
}
 