import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaxCV — AI-Powered Resume Improver",
  description:
    "Improve your resume instantly with AI. Free to use, powered by Claude Opus 4.6.",
  openGraph: {
    title: "MaxCV — AI-Powered Resume Improver",
    description:
      "Improve your resume instantly with AI. Free to use, powered by Claude Opus 4.6.",
    url: "https://maxcv.org",
    siteName: "MaxCV",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Inter for legacy improve page */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
