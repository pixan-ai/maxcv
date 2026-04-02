import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "maxcv — AI Resume Analyzer & Improver",
  description: "Analyze and improve your resume with AI. Professional score + instant rewrite. Free, no sign-up.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "maxcv — AI Resume Analyzer & Improver",
    description: "Analyze and improve your resume with AI. Professional score + instant rewrite. Free, no sign-up.",
    url: "https://maxcv.org",
    siteName: "maxcv",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-ink-000 text-ink-900 font-[family-name:var(--font-geist)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
