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
import StickerPeel from "../components/StickerPeel";
import GithubProfile from "../components/GithubActivity";
import {
  Brain,
  MessageSquareText,
  FileSearch,
  Globe,
  Workflow,
} from "lucide-react";
import BlogCard from "../components/BlogCard";
import ScrollReveal from "../components/ScrollReveal";
import ReflectiveCard from "../components/ReflectiveCard";
import ProjectsSection from "../components/portfolio/ProjectsSection";
import ExperienceSection from "../components/portfolio/ExperienceSection";
import type { PostMeta } from "../lib/blog";
import type { PortfolioCms } from "../lib/sanity/projects";

const content = {
  en: {
    nav: { about: "About", work: "Work", experience: "Experience", skills: "Skills", certs: "Certs", blog: "Blog", contact: "Contact", lang: "EN" },
    heroViewWork: "View Work",
    heroDownloadCv: "Download CV",
    heroSubtext:
      "Full-Stack Developer & Systems Architect. Specializing in Web Platforms and Automation systems.",
    aboutKicker: "WHO AM I?",
    aboutTitle:
      "Hi! I'm Muhammad Noval Aula, a Full-Stack Developer with 4 years of experience in web development.",
    aboutBody: [
      "Hi! I'm Muhammad Noval Aula, a Full-Stack Developer with 4 years of experience in web development.I enjoy building web applications that are not only visually appealing but also functional, scalable, and designed to solve real-world problems.",
      "Most recently, I developed a multi-tenant Point of Sales (POS) system with membership features for cafes. The system is currently running at Sekapa House, with planned rollouts at Depot Wahid and Sempati, covering transaction processing, product management, member registration, loyalty points, and sales reporting.",
      "Outside of development, I enjoy exploring new technologies, building personal projects, and continuously improving my software engineering skills. I'm always eager to learn, solve challenging problems, and create digital products that bring real value.",
      "For me, being a developer is not just about writing code, but also about understanding problems and turning ideas into meaningful solutions through technology.I'm always open to new opportunities, exciting challenges, and collaborations. Feel free to reach out! 🚀",
    ],
    educationTitle: "Education",
    educationSchool: "Universitas Harkat Negeri",
    educationDegree: "D4 — Informatics Engineering",
    educationPeriod: "2022 — 2026",
    workKicker: "Selected Work",
    workTitle: "Designed to move products forward",
    finalKicker: "Next",
    finalTitle: "Show both sides of the build.",
    finalBody: "Each case study should explain the interface decisions, the backend architecture, and the tradeoffs behind the final product.",
    stackKicker: "Stack",
    githubKicker: "GitHub",
    githubTitle: "Activity",
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
    contactTitle: "Have a project you'd like to build?",
    contactBody: "Tell us about your needs. We'll start by defining your goals and identifying the most sensible solutions.",
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
        company: "Freelance",
        period: "Nov 2023 — Present",
        points: [
          "Developed and maintained 10+ web-based projects using modern technologies, covering frontend development, backend services, RESTful API integration, database management, and debugging.",
          "Built and delivered 3+ business management systems, including Point of Sales (POS), ERP management systems, and e-commerce platforms to support operational workflows and business processes.",
          "Developed a Point of Sales (POS) system with 5+ core modules, including transaction processing, product management, membership, loyalty points, and sales reporting.",
          "Implemented backend services and database integrations to support multiple interconnected modules, improving data consistency and simplifying business operations.",
          "Improved development efficiency by implementing reusable components, reducing repetitive UI development efforts by an estimated 20–35% across pages with similar structures.",
          "Optimized application performance and maintainability through structured code implementation, API integration, debugging, and deployment practices.",
          "Collaborated with cross-functional teams to translate business requirements into technical solutions and deliver project features within established timelines.",
        ],
        stack: ["Next.js", "React", "Node.js", "REST API", "PostgreSQL", "MySQL"],
      },
      {
        role: "Fullstack Developer",
        company: "PT Kampung Marketerindo Berdaya (Komerce)",
        period: "Jul 2025 — Nov 2025",
        points: [
          "Contributed to the development and maintenance of Komship by enhancing three core modules: Shipment Tracking, Bulk Order, and Shipping Analytics.",
          "Implemented shipment tracking features using Go and shipping API integrations, enabling the retrieval, processing, and display of shipment status information.",
          "Developed and enhanced bulk order validation and processing workflows, handling multiple order entries to support more efficient shipment management.",
          "Implemented shipping analytics features to process and present courier performance, shipment statistics, and delivery reports for operational monitoring.",
          "Integrated frontend interfaces built with Next.js with backend services and PostgreSQL databases to ensure consistent data processing and application functionality.",
          "Performed debugging, API integration, and feature maintenance to improve existing application functionality and system reliability.",
        ],
        stack: ["Next.js", "Golang", "PostgreSQL", "Whatsmeow", "GitLab", "Docker"],
      },
    ],
  },
  id: {
    nav: { about: "Tentang", work: "Karya", experience: "Pengalaman", skills: "Skill", certs: "Sertifikat", blog: "Blog", contact: "Kontak", lang: "ID" },
    heroViewWork: "Lihat Karya",
    heroDownloadCv: "Unduh CV",
    heroSubtext:
      "Full-Stack Developer & Systems Architect. Spesialisasi di platform web dan sistem otomatisasi.",
    aboutKicker: "WHO AM I?",
    aboutTitle:
      "Hai! Aku Muhammad Noval Aula, seorang Fullstack Developer dengan pengalaman 4 tahun di bidang web development.",
    aboutBody: [
      "Hai! Aku Muhammad Noval Aula, seorang Full-Stack Developer dengan pengalaman 4 tahun di bidang web development. Aku senang membangun aplikasi web yang tidak hanya menarik secara visual tetapi juga fungsional, scalable, dan dirancang untuk menyelesaikan masalah nyata.",
      "Belakangan ini, aku mengembangkan sistem Point of Sales (POS) multi-tenant dengan fitur membership untuk cafe. Sistem ini saat ini berjalan di Sekapa House, dengan rencana penerapan di Depot Wahid dan Sempati, mencakup pemrosesan transaksi, pengelolaan produk, pendaftaran member, poin loyalitas, dan laporan penjualan.",
      "Di luar pengembangan, aku senang mengeksplorasi teknologi baru, membangun personal project, dan terus meningkatkan kemampuan software engineering. Aku selalu bersemangat untuk belajar, memecahkan masalah yang menantang, dan menciptakan produk digital yang memberikan nilai nyata.",
      "Bagiku, menjadi developer bukan sekadar menulis kode, tetapi juga tentang memahami masalah dan mengubah ide menjadi solusi yang bermakna melalui teknologi. Aku selalu terbuka untuk peluang, tantangan, dan kolaborasi baru. Jangan ragu untuk menghubungi! 🚀",
    ],
    educationTitle: "Pendidikan",
    educationSchool: "Universitas Harkat Negeri",
    educationDegree: "D4 — Teknik Informatika",
    educationPeriod: "2022 — 2026",
    workKicker: "Karya Pilihan",
    workTitle: "Dirancang untuk mendorong produk maju",
    finalKicker: "Lanjut",
    finalTitle: "Tampilkan dua sisi dari proses build.",
    finalBody: "Setiap case study sebaiknya menjelaskan keputusan interface, arsitektur backend, dan tradeoff di balik produk akhirnya.",
    stackKicker: "Stack",
    githubKicker: "GitHub",
    githubTitle: "Aktivitas",
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
    contactTitle: "Have a project you'd like to build?",
    contactBody: "Tell us about your needs. We'll start by defining your goals and identifying the most sensible solutions.",
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
        company: "Freelance",
        period: "Nov 2023 — Sekarang",
        points: [
          "Mengembangkan dan memelihara 10+ proyek web menggunakan teknologi modern, mencakup pengembangan frontend, backend, integrasi RESTful API, pengelolaan basis data, dan debugging.",
          "Membangun 3+ sistem manajemen bisnis, meliputi Point of Sales (POS), Enterprise Resource Planning (ERP), dan e-commerce untuk mendukung operasional bisnis.",
          "Mengembangkan sistem POS dengan 5+ modul utama, mencakup pemrosesan transaksi, pengelolaan produk, keanggotaan pelanggan, poin loyalitas, dan laporan penjualan.",
          "Mengintegrasikan layanan backend dan basis data antar-modul untuk meningkatkan konsistensi data dan menyederhanakan operasional bisnis.",
          "Meningkatkan efisiensi pengembangan melalui penggunaan reusable components, sehingga mengurangi pekerjaan berulang sekitar 20–35%.",
          "Mengoptimalkan performa dan pemeliharaan aplikasi melalui struktur kode, integrasi API, debugging, dan deployment.",
          "Berkolaborasi dengan berbagai tim untuk menerjemahkan kebutuhan bisnis menjadi solusi teknis dan menyelesaikan fitur sesuai tenggat waktu.",
        ],
        stack: ["Next.js", "React", "Node.js", "REST API", "PostgreSQL", "MySQL"],
      },
      {
        role: "Fullstack Developer",
        company: "PT Kampung Marketerindo Berdaya (Komerce)",
        period: "Jul 2025 — Nov 2025",
        points: [
          "Berkontribusi dalam pengembangan dan pemeliharaan Komship melalui peningkatan 3 modul utama, yaitu Shipment Tracking, Bulk Order, dan Shipping Analytics.",
          "Mengembangkan fitur pelacakan pengiriman menggunakan Go dan integrasi API ekspedisi untuk mengambil, memproses, dan menampilkan status pengiriman.",
          "Mengembangkan alur validasi dan pemrosesan Bulk Order untuk menangani banyak pesanan sekaligus dan mempermudah pengelolaan pengiriman.",
          "Mengembangkan fitur Shipping Analytics untuk mengolah dan menyajikan performa ekspedisi, statistik pengiriman, serta laporan pengantaran.",
          "Mengintegrasikan antarmuka frontend menggunakan Next.js dengan layanan backend dan basis data PostgreSQL untuk memastikan konsistensi data aplikasi.",
          "Melakukan debugging, integrasi API, dan pemeliharaan fitur untuk meningkatkan fungsionalitas serta keandalan sistem.",
        ],
        stack: ["Next.js", "Golang", "PostgreSQL", "Whatsmeow", "GitLab", "Docker"],
      },
    ],
  },
};

const skillGroups = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Vue", "Angular", "Svelte", "GSAP", "Tailwind"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Golang", "Node.js", "Bun", "PHP", "Laravel", "Express.js", "Python", "Flask"],
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
    items: ["Git", "GitLab", "Docker", "Postman", "Figma", "WordPress", "Automa", "n8n"],
  },
];

// Urutan kartu MagicBento — kartu ke-1, ke-3, dan ke-4 dapat sel 2x2
// (ruang paling besar) di desktop, sesuai rule nth-child di MagicBento.css.
const bentoCardOrder = ["frontend", "database", "backend", "ml", "tools"];

// Ikon teknologi (Devicon / Simple Icons CDN) — dirender dengan efek chrome/silver via CSS.
const backendIcons: Record<string, string> = {
  "Golang": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Bun": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg",
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
  "Svelte": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg",
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
  "WordPress": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg",
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
        <a href="#top" className="brand" aria-label="Noval Portfolio">
          <Image
            src="/Logo.png"
            alt="Noval Logo"
            width={36}
            height={36}
            className="brand-logo"
            priority
          />
        </a>
        <div className="nav-links">
          <a href="#about">{navLabels.about}</a>
          <a href="#work">{navLabels.work}</a>
          <a href="#experience">{navLabels.experience}</a>
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
            <span className="nav-menu-bar" />
          </button>
        </div>
      </nav>
      <div id="mobile-menu" className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}>
        <a
          href="#about"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.about}
        </a>
        <a
          href="#work"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.work}
        </a>
        <a
          href="#experience"
          onClick={() => setIsMenuOpen(false)}
        >
          {navLabels.experience}
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

      <section id="about" className="section intro">
        <div className="intro-layout">
          <div className="intro-content">
            <p className="section-kicker about-kicker-shiny reveal">
              <ShinyText
                text={copy.aboutKicker}
                speed={3}
                color="rgba(245,247,251,0.72)"
                shineColor="#ffffff"
                spread={100}
              />
            </p>
            <div className="intro-columns">
              {Array.isArray(copy.aboutBody)
                ? copy.aboutBody.map((paragraph, index) => (
                    <ScrollReveal
                      key={`${language}-${index}`}
                      enableBlur={true}
                      baseOpacity={0.08}
                      blurStrength={5}
                      baseRotation={2}
                      containerClassName="about-para-reveal"
                      textClassName="about-para-text"
                    >
                      {paragraph.replace(/\*\*([^*]+)\*\*/g, "$1")}
                    </ScrollReveal>
                  ))
                : (
                    <ScrollReveal
                      enableBlur={true}
                      baseOpacity={0.08}
                      blurStrength={5}
                      baseRotation={2}
                      containerClassName="about-para-reveal"
                      textClassName="about-para-text"
                    >
                      {typeof copy.aboutBody === "string" ? copy.aboutBody : ""}
                    </ScrollReveal>
                  )}
            </div>
          </div>
          <div className="about-avatar-card reveal" aria-hidden="true">
            <Image src="/about-avatar.webp" alt="" fill className="about-avatar-image" />
          </div>
        </div>
      </section>

      <section id="education" className="section education">
        <div className="education-heading reveal">
          <p className="section-kicker about-kicker-shiny">
            <ShinyText
              text={copy.educationTitle}
              speed={3}
              color="rgba(245, 247, 251, 0.72)"
              shineColor="#ffffff"
              spread={100}
            />
          </p>
        </div>
        <article className="education-card reveal">
          <div className="education-top">
            <span className="education-school">{copy.educationSchool}</span>
            <span className="education-period">{copy.educationPeriod}</span>
          </div>
          <p className="education-degree">{copy.educationDegree}</p>
        </article>
      </section>

      <ProjectsSection
        kicker={copy.workKicker}
        title={copy.workTitle}
        projects={projects}
        demoComingSoon={language === "en" ? "Demo coming soon" : "Demo menyusul"}
        clientsLabel={copy.clientsLabel}
      />

      <ExperienceSection
        kicker={copy.experienceKicker}
        title={copy.experienceTitle}
        intro={copy.experienceIntro}
        experience={copy.experience}
      />

      <section id="skills" className="section skills">
        <div className="experience-heading reveal skills-heading">
          <h2 className="skills-title">{copy.stackKicker}</h2>
          <StickerPeel
            imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
            width={90}
            rotate={12}
            peelBackHoverPct={22}
            peelBackActivePct={38}
            shadowIntensity={0.5}
            lightingIntensity={0.08}
            initialPosition={{ x: 0, y: 0 }}
            className="skills-sticker"
          />
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

      <section id="github" className="section github-activity-section">
        <div className="github-heading reveal">
          <ShinyText
            text={copy.githubKicker}
            className="experience-work-history"
            speed={4.5}
            color="rgba(176, 182, 191, 0.72)"
            shineColor="rgba(255, 255, 255, 0.95)"
            spread={88}
            yoyo
            delay={0.3}
          />
          <h2 className="experience-title github-title">{copy.githubTitle}</h2>
        </div>
        <div className="github-panel reveal">
          <GithubProfile
            username="Noval-code"
            theme="dark"
            colors={["#2b3038", "#57606d", "#9aa4b2", "#dfe4ea"]}
            empty="#16191f"
            mode="2d"
            shape="rounded"
            blocks="skyline"
            stats="inline"
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


      <section id="blog" className="section blog">
        <div className="blog-heading reveal">
          <div>
            <ShinyText
              text={copy.blogKicker}
              className="experience-work-history"
              speed={4.5}
              color="rgba(176, 182, 191, 0.72)"
              shineColor="rgba(255, 255, 255, 0.95)"
              spread={88}
              yoyo
              delay={0.3}
            />
            <h2>{copy.blogTitle}</h2>
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
        <div className="contact-rc-wrapper reveal">
          <ReflectiveCard
            theme="dark"
            tint="#ffffff"
            metalness={1}
            roughness={0.3}
            blurStrength={6}
            shine={1}
            glare={0.5}
            width="100%"
            height={420}
            radius={32}
          >
            <div className="contact-rc-content">
              <h2 className="contact-rc-title">{copy.contactTitle}</h2>
              <p className="contact-rc-body">{copy.contactBody}</p>
              <div className="contact-rc-socials">
                <a
                  href="mailto:novalaula486@gmail.com"
                  className="contact-rc-link"
                  aria-label="Email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/palls___/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-rc-link"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/muhammadnovalaula/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-rc-link"
                  aria-label="LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://www.threads.net/@nvlaula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-rc-link"
                  aria-label="Threads"
                >
                  <svg width="20" height="20" viewBox="0 0 192 192" fill="currentColor" stroke="none">
                    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                  </svg>
                </a>
              </div>
            </div>
          </ReflectiveCard>
        </div>
      </section>
    </main>
  );
}
 