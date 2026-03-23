import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "maxcv — AI-Powered Resume Improver",
  description:
    "Improve your resume instantly with AI. Free to use, powered by Claude.",
  openGraph: {
    title: "maxcv — AI-Powered Resume Improver",
    description:
      "Improve your resume instantly with AI. Free to use, powered by Claude.",
    url: "https://maxcv.org",
    siteName: "maxcv",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-[--ink-000] text-[--ink-900] font-[family-name:var(--font-geist)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
