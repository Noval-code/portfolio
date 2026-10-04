import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL("https://novalaula.dev"),
  title: "Muhammad Noval Aula — Full-Stack Developer",
  description:
    "Portfolio of Muhammad Noval Aula, a full-stack developer building fast, polished, and reliable web products with React, Next.js, and Node.js.",
  keywords: [
    "Muhammad Noval Aula",
    "Full-Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Portfolio",
    "Web Developer Indonesia",
  ],
  authors: [{ name: "Muhammad Noval Aula" }],
  creator: "Muhammad Noval Aula",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      id: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://novalaula.dev",
    title: "Muhammad Noval Aula — Full-Stack Developer",
    description:
      "Full-stack developer building fast, polished, and reliable web products with React, Next.js, and Node.js.",
    siteName: "Muhammad Noval Aula",
    images: [
      {
        url: "/hero-potrait.webp",
        width: 1200,
        height: 630,
        alt: "Muhammad Noval Aula profile preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Noval Aula — Full-Stack Developer",
    description:
      "Full-stack developer building fast, polished, and reliable web products with React, Next.js, and Node.js.",
    images: ["/hero-potrait.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning tolerates extension-injected attributes
  // (e.g. data-*-ext-installed) on <html>/<body> during hydration.
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
