"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Bilingual content ──────────────────────────────────────────────
const UI = {
  es: {
    heroTitle: "Seguridad",
    heroAccent: "& Privacidad",
    heroSub: "Tu CV contiene información personal sensible. Así es como la protegemos.",
    sections: [
      {
        icon: "🗑",
        title: "No almacenamos tu CV",
        body: "Tu archivo se procesa en tiempo real durante el análisis y se descarta inmediatamente después. No existe en ningún servidor, base de datos, ni respaldo. Ni siquiera nosotros podemos recuperarlo.",
      },
      {
        icon: "👤",
        title: "Sin cuentas, sin perfiles",
        body: "No necesitas registrarte. No creamos perfiles de usuario. No usamos cookies de tracking. No hay base de datos con tu información. Llegas, analizas tu CV, y te vas.",
      },
      {
        icon: "🚫",
        title: "No vendemos datos",
        body: "No tenemos datos que vender. No compartimos información con terceros. No hacemos retargeting. No monetizamos tu información de ninguna forma.",
      },
      {
        icon: "🔒",
        title: "Cifrado en tránsito",
        body: "Toda la comunicación entre tu navegador y nuestros servidores está cifrada con TLS/SSL. Tu CV viaja protegido en todo momento.",
      },
      {
        icon: "🤖",
        title: "IA responsable",
        body: "Tu CV se analiza usando Claude, creado por Anthropic. Los datos enviados a la API de Anthropic no se usan para entrenar modelos. Anthropic es pionera en IA constitucional con principios éticos explícitos.",
        link: { label: "Conoce la constitución de Claude →", href: "https://www.anthropic.com/news/claude-new-constitution" },
      },
      {
        icon: "🏗",
        title: "Infraestructura moderna",
        body: "maxcv corre en Vercel, respaldada por la infraestructura global de AWS. Sin servidores propios que mantener, sin bases de datos de CVs, sin puntos débiles adicionales.",
      },
    ],
    neverTitle: "Lo que nunca hacemos",
    neverItems: [
      "Almacenar tu CV o su contenido",
      "Crear perfiles o cuentas de usuario",
      "Usar cookies de tracking o analytics invasivos",
      "Vender, compartir, o monetizar tus datos",
      "Usar tu CV para entrenar modelos de IA",
      "Inferir género, edad, etnia, u otros datos personales",
      "Contactarte después de tu visita",
    ],
    openTitle: "Código abierto",
    openBody: "maxcv es open source. Puedes inspeccionar exactamente cómo procesamos tu CV, qué enviamos a la API, y verificar que cumplimos cada promesa de esta página.",
    openLink: "Ver código en GitHub →",
    contactTitle: "¿Preguntas de seguridad?",
    contactBody: "Si tienes dudas sobre cómo manejamos tus datos, escríbenos.",
    contactEmail: "seguridad@maxcv.org",
    updated: "Última actualización: Marzo 2026",
  },
  en: {
    heroTitle: "Security",
    heroAccent: "& Privacy",
    heroSub: "Your resume contains sensitive personal information. Here's how we protect it.",
    sections: [
      {
        icon: "🗑",
        title: "We don't store your resume",
        body: "Your file is processed in real time during analysis and discarded immediately after. It doesn't exist on any server, database, or backup. Even we can't retrieve it.",
      },
      {
        icon: "👤",
        title: "No accounts, no profiles",
        body: "You don't need to sign up. We don't create user profiles. We don't use tracking cookies. There's no database with your information. You arrive, analyze your resume, and leave.",
      },
      {
        icon: "🚫",
        title: "We don't sell data",
        body: "We have no data to sell. We don't share information with third parties. We don't retarget. We don't monetize your information in any way.",
      },
      {
        icon: "🔒",
        title: "Encrypted in transit",
        body: "All communication between your browser and our servers is encrypted with TLS/SSL. Your resume travels protected at all times.",
      },
      {
        icon: "🤖",
        title: "Responsible AI",
        body: "Your resume is analyzed using Claude, created by Anthropic. Data sent to Anthropic's API is not used to train models. Anthropic is a pioneer in constitutional AI with explicit ethical principles.",
        link: { label: "Read Claude's constitution →", href: "https://www.anthropic.com/news/claude-new-constitution" },
      },
      {
        icon: "🏗",
        title: "Modern infrastructure",
        body: "maxcv runs on Vercel, backed by AWS's global infrastructure. No self-managed servers, no resume databases, no additional weak points.",
      },
    ],
    neverTitle: "What we never do",
    neverItems: [
      "Store your resume or its contents",
      "Create user profiles or accounts",
      "Use tracking cookies or invasive analytics",
      "Sell, share, or monetize your data",
      "Use your resume to train AI models",
      "Infer gender, age, ethnicity, or other personal data",
      "Contact you after your visit",
    ],
    openTitle: "Open source",
    openBody: "maxcv is open source. You can inspect exactly how we process your resume, what we send to the API, and verify that we keep every promise on this page.",
    openLink: "View code on GitHub →",
    contactTitle: "Security questions?",
    contactBody: "If you have questions about how we handle your data, reach out.",
    contactEmail: "security@maxcv.org",
    updated: "Last updated: March 2026",
  },
};

// ─── Page ───────────────────────────────────────────────────────────
export default function SecurityPage() {
  const [lang, setLang] = useState<"en" | "es">("es");
  const t = UI[lang];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>{" "}
            <span className="hero-reveal-2 inline-block text-accent">{t.heroAccent}</span>
          </h1>
          <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {t.heroSub}
          </p>
        </section>

        {/* Security cards */}
        <div className="space-y-3 mb-16">
          {t.sections.map((s, i) => (
            <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6 transition hover:border-ink-200">
              <div className="flex items-start gap-3.5">
                <span className="text-lg leading-none mt-0.5 shrink-0">{s.icon}</span>
                <div>
                  <h2 className="text-sm font-medium text-ink-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-ink-500 leading-relaxed">{s.body}</p>
                  {"link" in s && s.link && (
                    <a
                      href={s.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-dim transition inline-block mt-2 font-medium"
                    >
                      {s.link.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What we never do */}
        <section className="mb-16">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.neverTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <ul className="space-y-3">
              {t.neverItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-red-500 leading-none mt-0.5 shrink-0">✕</span>
                  <span className="text-ink-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Open source */}
        <section className="mb-16">
          <h2 className="text-lg font-medium text-ink-900 mb-2">{t.openTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-3">{t.openBody}</p>
          <a
            href="https://github.com/pixan-ai/maxcv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:text-accent-dim transition font-medium"
          >
            {t.openLink}
          </a>
        </section>

        {/* Contact */}
        <div className="bg-ink-050 rounded-xl p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-2">{t.contactBody}</p>
          <a
            href={`mailto:${t.contactEmail}`}
            className="text-sm text-accent hover:text-accent-dim transition font-medium"
          >
            {t.contactEmail}
          </a>
        </div>

        <p className="text-xs text-ink-300">{t.updated}</p>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
