import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "\u25BC maxcv - AI Resume Improver",
  description:
    "Analyze and improve your resume with AI. Score across 6 dimensions + complete rewrite. Free, no sign-up.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "maxcv - AI Resume Improver",
    description:
      "Analyze and improve your resume with AI. Score across 6 dimensions + complete rewrite. Free, no sign-up.",
    url: "https://maxcv.org",
    siteName: "maxcv",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "maxcv - AI Resume Improver",
    description:
      "Free AI-powered resume analyzer. Score + rewrite. No sign-up.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "maxcv",
              description:
                "AI-powered resume analyzer and improver. Free, no sign-up.",
              url: "https://maxcv.org",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              inLanguage: ["es", "en"],
            }),
          }}
        />
      </head>
      <body className="bg-ink-000 text-ink-900 font-[family-name:var(--font-geist)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
