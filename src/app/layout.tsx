import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://maxcv.org"),
  title: "maxcv — Analiza y mejora tu CV con IA gratis",
  description:
    "Análisis profesional de CV con inteligencia artificial. Puntaje en 6 dimensiones + reescritura completa optimizada para ATS. Gratis, sin registro, 100% anónimo.",
  alternates: {
    canonical: "https://maxcv.org",
    languages: {
      "es": "https://maxcv.org",
      "en": "https://maxcv.org",
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "maxcv — Analiza y mejora tu CV con IA gratis",
    description:
      "Puntaje en 6 dimensiones + reescritura completa optimizada para ATS. Sin registro, sin costo, 100% anónimo.",
    url: "https://maxcv.org",
    siteName: "maxcv",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
    title: "maxcv — Analiza y mejora tu CV con IA gratis",
    description:
      "Análisis de CV con IA. Puntaje + reescritura ATS. Gratis, sin registro.",
  },
  robots: {
    index: true,
    follow: true,
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
              "@type": "WebApplication",
              name: "maxcv",
              url: "https://maxcv.org",
              description:
                "Herramienta gratuita de análisis y mejora de CV con inteligencia artificial. Puntaje en 6 dimensiones y reescritura completa optimizada para ATS.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Gratuito con donaciones voluntarias",
              },
              creator: {
                "@type": "Organization",
                name: "Pixan AI",
                url: "https://github.com/pixan-ai",
              },
              inLanguage: ["es", "en"],
              featureList: [
                "CV scoring across 6 dimensions",
                "AI-powered resume rewriting",
                "ATS optimization",
                "No registration required",
                "100% anonymous analysis",
                "Bilingual (Spanish/English)",
                "Open source",
              ],
              isAccessibleForFree: true,
              license: "https://opensource.org/licenses/MIT",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Pixan AI",
              url: "https://maxcv.org",
              logo: "https://maxcv.org/icon.svg",
              sameAs: ["https://github.com/pixan-ai/maxcv"],
              contactPoint: {
                "@type": "ContactPoint",
                email: "security@maxcv.org",
                contactType: "customer support",
                availableLanguage: ["Spanish", "English"],
              },
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
